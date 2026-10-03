import * as SQLite from 'expo-sqlite';

// Initialize and export the SQLite database connection
export const db = SQLite.openDatabaseSync('finex.db');

export const initDatabase = () => {
  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      type TEXT CHECK(type IN ('expense', 'income')) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      amount REAL NOT NULL,
      category_id TEXT NOT NULL,
      note TEXT,
      date TEXT NOT NULL,
      receipt_url TEXT,
      sync_status TEXT CHECK(sync_status IN ('pending', 'synced')) DEFAULT 'pending',
      updated_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY NOT NULL,
      category_id TEXT NOT NULL,
      amount_limit REAL NOT NULL,
      period TEXT DEFAULT 'monthly',
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );
  `);
  seedDefaultCategories();
};

const seedDefaultCategories = () => {
  const countResult = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM categories;');
  
  if (countResult && countResult.count === 0) {
    db.execSync(`
      INSERT INTO categories (id, name, icon, color, type) VALUES
      ('cat_1', 'Groceries', 'cart', '#FFD700', 'expense'),
      ('cat_2', 'Dining Out', 'fast-food', '#FF7000', 'expense'),
      ('cat_3', 'Transport', 'car', '#00E5FF', 'expense'),
      ('cat_4', 'Salary', 'wallet', '#CFFF4F', 'income'),
      ('cat_5', 'Utilities', 'flash', '#8A2BE2', 'expense');
    `);
  }
};