import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'dtn_application_portal.db');

let dbInstance: SqlJsDatabase | null = null;

export async function getDatabase(): Promise<SqlJsDatabase> {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  // Enable foreign keys
  dbInstance.run('PRAGMA foreign_keys = ON;');
  
  initializeSchema(dbInstance);
  saveDatabase();

  return dbInstance;
}

export function saveDatabase(): void {
  if (!dbInstance) return;
  const data = dbInstance.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function initializeSchema(db: SqlJsDatabase): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      occupancy_status TEXT,
      applicant_title TEXT,
      applicant_name TEXT NOT NULL,
      org_name TEXT,
      org_representative TEXT,
      org_designation TEXT,
      dob TEXT,
      gender TEXT,
      existing_customer INTEGER NOT NULL DEFAULT 0,
      consumer_number TEXT,
      contact_number TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      declaration_accepted INTEGER NOT NULL DEFAULT 1,
      declaration_terms_version TEXT NOT NULL DEFAULT 'v1.0-demo',
      declaration_timestamp TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Submitted',
      payment_status TEXT NOT NULL DEFAULT 'Not Initiated',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
      address_type TEXT NOT NULL,
      line1 TEXT NOT NULL,
      line2 TEXT,
      area TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      speed_mbps INTEGER NOT NULL,
      data_allowance TEXT NOT NULL,
      monthly_price_paisa INTEGER NOT NULL,
      quarterly_price_paisa INTEGER NOT NULL,
      half_yearly_price_paisa INTEGER NOT NULL,
      annual_price_paisa INTEGER NOT NULL,
      installation_fee_paisa INTEGER NOT NULL DEFAULT 0,
      gst_rate_percent REAL NOT NULL DEFAULT 18.0,
      is_active INTEGER NOT NULL DEFAULT 1,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS application_pricing_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
      plan_id INTEGER NOT NULL,
      plan_name TEXT NOT NULL,
      speed_mbps INTEGER NOT NULL,
      data_allowance TEXT NOT NULL,
      billing_frequency TEXT NOT NULL,
      base_price_paisa INTEGER NOT NULL,
      tax_paisa INTEGER NOT NULL,
      installation_paisa INTEGER NOT NULL,
      total_paisa INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      snapshot_timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
      document_type TEXT NOT NULL,
      doc_label TEXT,
      original_filename TEXT NOT NULL,
      stored_filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      uploaded_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
      order_id TEXT UNIQUE NOT NULL,
      payment_id TEXT,
      gateway TEXT NOT NULL DEFAULT 'simulated',
      amount_paisa INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      status TEXT NOT NULL DEFAULT 'Pending',
      payment_method TEXT,
      gateway_reference TEXT,
      gateway_payload TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS application_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
      previous_status TEXT NOT NULL,
      new_status TEXT NOT NULL,
      changed_by TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_apps_app_id ON applications(application_id);
    CREATE INDEX IF NOT EXISTS idx_apps_status ON applications(status);
    CREATE INDEX IF NOT EXISTS idx_apps_payment_status ON applications(payment_status);
    CREATE INDEX IF NOT EXISTS idx_apps_created_at ON applications(created_at);
  `);
}

// Database query helpers
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDatabase();
  const stmt = db.prepare(sql);
  if (params && params.length > 0) {
    stmt.bind(params);
  }
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as unknown as T);
  }
  stmt.free();
  return results;
}

export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const list = await query<T>(sql, params);
  return list.length > 0 ? list[0] : null;
}

export async function execute(sql: string, params: any[] = []): Promise<{ lastInsertRowId: number; changes: number }> {
  const db = await getDatabase();
  db.run(sql, params);
  const rowIdRes = db.exec('SELECT last_insert_rowid() AS id, changes() AS changes');
  saveDatabase();
  const lastInsertRowId = (rowIdRes[0]?.values[0]?.[0] as number) || 0;
  const changes = (rowIdRes[0]?.values[0]?.[1] as number) || 0;
  return { lastInsertRowId, changes };
}
