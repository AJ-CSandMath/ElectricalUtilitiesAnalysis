import { Database } from "sqlite3";
import { join } from "std/path/mod.ts";

class DatabaseManager {
  private static instance: Database;
  private static isInitialized = false;

  static getInstance(): Database {
    if (!this.instance) {
      const dbPath = join(Deno.cwd(), "data", "utilities.db");
      this.instance = new Database(dbPath);
      if (!this.isInitialized) {
        this.initialize();
      }
      addEventListener("unload", () => {
        this.close();
      });
    }
    return this.instance;
  }

  private static initialize() {
    // Set pragmas for better performance
    this.instance.prepare("PRAGMA journal_mode = WAL;").run();
    this.instance.prepare("PRAGMA synchronous = NORMAL;").run();
    this.isInitialized = true;
  }

  static close() {
    if (this.instance) {
      try {
        this.instance.close();
      } catch (error) {
        console.error("Error closing database:", error);
      } finally {
        this.instance = undefined as unknown as Database;
        this.isInitialized = false;
      }
    }
  }
}

export { DatabaseManager };
