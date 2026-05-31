import Database from "better-sqlite3";
import supertest from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./server.js";

const app = createApp(new Database(":memory:"));

describe("GET /api/hello", () => {
  it("returns 401 when not authenticated", async () => {
    expect.hasAssertions();
    const res = await supertest(app).get("/api/hello?name=World");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  it("returns 401 when not authenticated", async () => {
    expect.hasAssertions();
    const res = await supertest(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  it("destroys the session and returns ok", async () => {
    expect.hasAssertions();
    const res = await supertest(app).post("/api/auth/logout");
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({ ok: true });
  });
});
