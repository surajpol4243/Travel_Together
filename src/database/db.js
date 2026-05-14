import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'travel_together.db';

let database;

const tableDefinitions = [
  `CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    destination TEXT,
    start_date TEXT,
    end_date TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS families (
    id TEXT PRIMARY KEY NOT NULL,
    trip_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS contributions (
    id TEXT PRIMARY KEY NOT NULL,
    trip_id TEXT NOT NULL,
    family_id TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    note TEXT,
    contributed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE,
    FOREIGN KEY (family_id) REFERENCES families (id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY NOT NULL,
    trip_id TEXT NOT NULL,
    family_id TEXT,
    title TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    category TEXT,
    paid_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE,
    FOREIGN KEY (family_id) REFERENCES families (id) ON DELETE SET NULL
  );`,
  `CREATE TABLE IF NOT EXISTS settlements (
    id TEXT PRIMARY KEY NOT NULL,
    trip_id TEXT NOT NULL,
    from_family_id TEXT NOT NULL,
    to_family_id TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    settled_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE,
    FOREIGN KEY (from_family_id) REFERENCES families (id) ON DELETE CASCADE,
    FOREIGN KEY (to_family_id) REFERENCES families (id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS timeline (
    id TEXT PRIMARY KEY NOT NULL,
    trip_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
  );`,
];

const indexDefinitions = [
  'CREATE INDEX IF NOT EXISTS idx_families_trip_id ON families (trip_id);',
  'CREATE INDEX IF NOT EXISTS idx_contributions_trip_id ON contributions (trip_id);',
  'CREATE INDEX IF NOT EXISTS idx_contributions_family_id ON contributions (family_id);',
  'CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses (trip_id);',
  'CREATE INDEX IF NOT EXISTS idx_expenses_family_id ON expenses (family_id);',
  'CREATE INDEX IF NOT EXISTS idx_settlements_trip_id ON settlements (trip_id);',
  'CREATE INDEX IF NOT EXISTS idx_timeline_trip_id ON timeline (trip_id);',
];

export async function getDatabase() {
  if (!database) {
    database = await SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  return database;
}

export async function executeSql(sql) {
  const db = await getDatabase();
  return db.execAsync(sql);
}

export async function runQuery(sql, params = []) {
  const db = await getDatabase();
  return db.runAsync(sql, params);
}

export async function getAll(sql, params = []) {
  const db = await getDatabase();
  return db.getAllAsync(sql, params);
}

export async function getFirst(sql, params = []) {
  const rows = await getAll(sql, params);
  return rows[0] ?? null;
}

export async function initializeDatabase() {
  const db = await getDatabase();

  await db.execAsync('PRAGMA foreign_keys = ON;');

  for (const definition of tableDefinitions) {
    await db.execAsync(definition);
  }

  for (const definition of indexDefinitions) {
    await db.execAsync(definition);
  }

  return db;
}
