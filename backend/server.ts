import sqliteStoreFactory from "better-sqlite3-session-store";
import Database from "better-sqlite3";
import cors from "cors";
import express, { type Express } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

interface AppUser {
  id: number;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
}

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

function requireAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

function registerStrategies(db: Database.Database): void {
  const clientID = process.env["GOOGLE_CLIENT_ID"];
  const clientSecret = process.env["GOOGLE_CLIENT_SECRET"];
  const callbackURL = process.env["GOOGLE_CALLBACK_URL"];

  if (!clientID || !clientSecret || !callbackURL) {
    return;
  }

  passport.use(
    new GoogleStrategy(
      { callbackURL, clientID, clientSecret },
      (accessToken, refreshToken, profile, done) => {
        interface IdentityRow {
          id: number;
          user_id: number;
        }

        const identity = db
          .prepare(
            "SELECT id, user_id FROM user_identities WHERE provider = 'google' AND provider_user_id = ?",
          )
          .get(profile.id) as IdentityRow | undefined;

        if (identity) {
          db.prepare(
            "UPDATE user_identities SET access_token = ?, refresh_token = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = ?",
          ).run(accessToken, refreshToken, identity.id);

          const user = db
            .prepare("SELECT * FROM users WHERE id = ?")
            .get(identity.user_id) as AppUser | undefined;

          if (!user) {
            done(new Error("User not found"));
            return;
          }
          done(null, user);
          return;
        }

        const email = profile.emails?.[0]?.value ?? "";
        const displayName = profile.displayName ?? null;
        const avatarUrl = profile.photos?.[0]?.value ?? null;

        const { lastInsertRowid } = db
          .prepare(
            "INSERT INTO users (email, display_name, avatar_url) VALUES (?, ?, ?)",
          )
          .run(email, displayName, avatarUrl);

        db.prepare(
          "INSERT INTO user_identities (user_id, provider, provider_user_id, email, access_token, refresh_token) VALUES (?, 'google', ?, ?, ?, ?)",
        ).run(
          Number(lastInsertRowid),
          profile.id,
          email,
          accessToken,
          refreshToken,
        );

        const user = db
          .prepare("SELECT * FROM users WHERE id = ?")
          .get(lastInsertRowid) as AppUser | undefined;

        if (!user) {
          done(new Error("Failed to create user"));
          return;
        }
        done(null, user);
      },
    ),
  );
}

export function createApp(db: Database.Database): Express {
  const app = express();

  app.use(
    cors({
      credentials: true,
      origin: process.env["FRONTEND_URL"] ?? "http://localhost:5173",
    }),
  );
  app.use(express.json());

  const SqliteStore = sqliteStoreFactory(session);

  app.use(
    session({
      cookie: {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
        secure: process.env["NODE_ENV"] === "production",
      },
      resave: false,
      saveUninitialized: false,
      secret: process.env["SESSION_SECRET"] ?? "dev-secret",
      store: new SqliteStore({ client: db }),
    }),
  );

  registerStrategies(db);
  app.use(passport.initialize());

  app.get(
    "/api/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
    }),
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/login",
      session: false,
    }),
    (req: express.Request, res: express.Response) => {
      const user = req.user as AppUser | undefined;
      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      req.session.userId = user.id;
      res.redirect(process.env["FRONTEND_URL"] ?? "http://localhost:5173");
    },
  );

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((_err) => {
      res.json({ ok: true });
    });
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    const user = db
      .prepare(
        "SELECT id, email, display_name, avatar_url FROM users WHERE id = ?",
      )
      .get(req.session.userId) as AppUser | undefined;

    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    res.json({
      avatarUrl: user.avatar_url,
      displayName: user.display_name,
      id: user.id,
    });
  });

  app.get("/api/hello", requireAuth, (req, res) => {
    const nameParam = req.query["name"];
    const name = typeof nameParam === "string" ? nameParam : "World";
    res.json({ message: `Hello, ${name}!` });
  });

  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      res.status(500).json({ error: "Internal server error" });
    },
  );

  return app;
}
