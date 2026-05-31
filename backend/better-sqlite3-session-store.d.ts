import type session from "express-session";
import type Database from "better-sqlite3";

declare module "better-sqlite3-session-store" {
  function factory(
    session: typeof session,
  ): new (options: {
    client: Database.Database;
  }) => session.Store;

  export = factory;
}
