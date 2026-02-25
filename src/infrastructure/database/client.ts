import { Database } from "bun:sqlite";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

let db: Database | null = null;

export function getDatabase(): Database {
  if (!db) {
    const dataDir = join(process.cwd(), "Data");

    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = join(dataDir, "database.sqlite");

    db = new Database(dbPath);

    db.run("PRAGMA foreign_keys = ON;");
    db.run("PRAGMA journal_mode = WAL;");
  }

  return db;
}
