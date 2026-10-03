// src/store/useTransactionStore.ts
import { create } from 'zustand';
import { db } from '../db/schema';

export interface TransactionWithCategory {
  id: string;
  amount: number;
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  note: string;
  date: string;
  receipt_url?: string;
  sync_status: 'pending' | 'synced';
  updated_at: string;
}

export interface CategoryBudget {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  amount_limit: number;
  total_spent: number;
}

export interface CategorySpendingBreakdown {
  category_id: string;
  category_name: string;
  category_color: string;
  category_icon: string;
  total_spent: number;
  percentage: number;
}

interface TransactionState {
  transactions: TransactionWithCategory[];
  budgets: CategoryBudget[];
  spendingBreakdown: CategorySpendingBreakdown[];
  fetchTransactions: () => void;
  fetchBudgets: () => void;
  fetchSpendingBreakdown: () => void;
  addTransaction: (tx: { amount: number; category_id: string; note: string; date: string }) => void;
  deleteTransaction: (id: string) => void;
  setBudgetLimit: (categoryId: string, limit: number) => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  budgets: [],
  spendingBreakdown: [],

  fetchTransactions: () => {
    const rows = db.getAllSync<TransactionWithCategory>(`
      SELECT 
        t.id, t.amount, t.category_id, t.note, t.date, t.receipt_url, t.sync_status, t.updated_at,
        c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      ORDER BY t.date DESC;
    `);
    set({ transactions: rows });
  },

  fetchBudgets: () => {
    const rows = db.getAllSync<CategoryBudget>(`
      SELECT 
        c.id as category_id,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        COALESCE(b.amount_limit, 0) as amount_limit,
        COALESCE(SUM(t.amount), 0) as total_spent
      FROM categories c
      LEFT JOIN budgets b ON c.id = b.category_id
      LEFT JOIN transactions t ON c.id = t.category_id
      WHERE c.type = 'expense'
      GROUP BY c.id;
    `);
    set({ budgets: rows });
  },

  fetchSpendingBreakdown: () => {
    const totalResult = db.getFirstSync<{ grand_total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as grand_total FROM transactions;`
    );
    const grandTotal = totalResult?.grand_total || 0;

    const rows = db.getAllSync<{
      category_id: string;
      category_name: string;
      category_color: string;
      category_icon: string;
      total_spent: number;
    }>(`
      SELECT 
        c.id as category_id,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon,
        COALESCE(SUM(t.amount), 0) as total_spent
      FROM categories c
      INNER JOIN transactions t ON c.id = t.category_id
      GROUP BY c.id
      HAVING total_spent > 0
      ORDER BY total_spent DESC;
    `);

    const breakdown = rows.map((item) => ({
      ...item,
      percentage: grandTotal > 0 ? (item.total_spent / grandTotal) * 100 : 0,
    }));

    set({ spendingBreakdown: breakdown });
  },

  addTransaction: (txData) => {
    const id = `tx_${Date.now()}`;
    const updated_at = new Date().toISOString();

    db.runSync(
      `INSERT INTO transactions (id, amount, category_id, note, date, receipt_url, sync_status, updated_at)
       VALUES (?, ?, ?, ?, ?, '', 'pending', ?);`,
      [id, txData.amount, txData.category_id, txData.note, txData.date, updated_at]
    );

    // Refresh transactions, budgets, and breakdown data
    get().fetchTransactions();
    get().fetchBudgets();
    get().fetchSpendingBreakdown();
  },

  deleteTransaction: (id: string) => {
    db.runSync('DELETE FROM transactions WHERE id = ?;', [id]);
    
    // Refresh transactions, budgets, and breakdown data
    get().fetchTransactions();
    get().fetchBudgets();
    get().fetchSpendingBreakdown();
  },

  setBudgetLimit: (categoryId: string, limit: number) => {
    const existing = db.getFirstSync<{ id: string }>(
      'SELECT id FROM budgets WHERE category_id = ?;',
      [categoryId]
    );

    if (existing) {
      db.runSync('UPDATE budgets SET amount_limit = ? WHERE category_id = ?;', [limit, categoryId]);
    } else {
      const id = `bgt_${Date.now()}`;
      db.runSync('INSERT INTO budgets (id, category_id, amount_limit) VALUES (?, ?, ?);', [
        id,
        categoryId,
        limit,
      ]);
    }

    get().fetchBudgets();
  },
}));