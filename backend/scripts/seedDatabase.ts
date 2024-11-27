import { Database } from 'sqlite3';
import { join } from 'std/path/mod.ts';

const initializeDatabase = async () => {
  const dbPath = join(Deno.cwd(), 'data', 'utilities.db');
  console.log('Creating database at:', dbPath);

  const db = new Database(dbPath);

  try {
    // Drop existing tables
    const tables = [
      'utility_service_areas',
      'utilities',
      'financial_data',
      'generation_data',
      'emissions_data',
      'renewable_mix',
      'rate_schedules',
      'infrastructure',
      'regulatory_compliance',
    ];

    for (const table of tables) {
      db.prepare(`DROP TABLE IF EXISTS ${table}`).run();
    }

    // Create core utilities table
    db.prepare(`CREATE TABLE utilities (
      eiaid INTEGER PRIMARY KEY,
      utility_name TEXT NOT NULL,
      ownership TEXT,
      service_type TEXT,
      ferc_id TEXT,
      holding_company TEXT,
      regulatory_status TEXT
    )`).run();

    // Service areas (from your existing CSV data)
    db.prepare(`CREATE TABLE utility_service_areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eiaid INTEGER,
      zip TEXT,
      state TEXT,
      comm_rate REAL,
      ind_rate REAL,
      res_rate REAL,
      is_iou BOOLEAN,
      FOREIGN KEY(eiaid) REFERENCES utilities(eiaid)
    )`).run();

    // FERC Form 1 Financial Data
    db.prepare(`CREATE TABLE financial_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eiaid INTEGER,
      year INTEGER,
      quarter INTEGER,
      total_revenue REAL,
      operating_expenses REAL,
      net_income REAL,
      assets REAL,
      liabilities REAL,
      equity REAL,
      capex REAL,
      debt_ratio REAL,
      report_type TEXT,
      FOREIGN KEY(eiaid) REFERENCES utilities(eiaid)
    )`).run();

    // Generation Data
    db.prepare(`CREATE TABLE generation_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eiaid INTEGER,
      year INTEGER,
      month INTEGER,
      fuel_type TEXT,
      generation_mwh REAL,
      capacity_mw REAL,
      capacity_factor REAL,
      FOREIGN KEY(eiaid) REFERENCES utilities(eiaid)
    )`).run();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    db.close();
  }
};

if (import.meta.main) {
  await initializeDatabase();
}

export { initializeDatabase };
