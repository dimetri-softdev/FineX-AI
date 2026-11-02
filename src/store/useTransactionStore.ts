// src/store/useTransactionStore.ts
import { create } from 'zustand';
import { db } from '../db/schema';
import { useAuthStore } from './useAuthStore';
import { useSyncStore } from './useSyncStore';
import { getMonthDateRange } from '../lib/finance';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

export interface TransactionWithCategory {
  id: string;
  user_id?: string;
  amount: number;
  type: 'income' | 'expense';
  title: string;
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

export interface AddTransactionPayload {
  title?: string;
  amount: number;
  type?: 'income' | 'expense';
  category_id: string;
  note?: string;
  date: string;
  receipt_url?: string;
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
  categories: Category[];
  transactions: TransactionWithCategory[];
  budgets: CategoryBudget[];
  spendingBreakdown: CategorySpendingBreakdown[];
  fetchCategories: () => void;
  fetchTransactions: () => void;
  fetchBudgets: () => void;
  fetchSpendingBreakdown: () => void;
  addTransaction: (tx: AddTransactionPayload) => void;
  deleteTransaction: (id: string) => void;
  setBudgetLimit: (categoryId: string, limit: number) => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  categories: [],
  transactions: [],
  budgets: [],
  spendingBreakdown: [],

  fetchCategories: () => {
    const rows = db.getAllSync<Category>(`
      SELECT id, name, type, icon, color 
      FROM categories 
      ORDER BY name ASC;
    `);
    set({ categories: rows });
  },

  fetchTransactions: () => {
    const userId = useAuthStore.getState().user?.id ?? null;
    const rows = db.getAllSync<TransactionWithCategory>(`
      SELECT 
        t.id, t.user_id, t.amount, t.type, t.title, t.category_id, t.note, t.date, t.receipt_url, t.sync_status, t.updated_at,
        c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id IS ? AND t.deleted_at IS NULL
      ORDER BY t.date DESC;
    `, [userId]);
    set({ transactions: rows });
  },

  fetchBudgets: () => {
    const userId = useAuthStore.getState().user?.id ?? null;
    const { start, end } = getMonthDateRange(new Date());
    const rows = db.getAllSync<CategoryBudget>(`
      SELECT 
        c.id as category_id,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        COALESCE((
          SELECT amount_limit
          FROM budgets
          WHERE category_id = c.id AND user_id IS ?
          ORDER BY updated_at DESC
          LIMIT 1
        ), 0) as amount_limit,
        COALESCE(SUM(t.amount), 0) as total_spent
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.category_id
        AND t.user_id IS ?
        AND t.type = 'expense'
        AND t.deleted_at IS NULL
        AND datetime(t.date) >= datetime(?)
        AND datetime(t.date) < datetime(?)
      WHERE c.type = 'expense'
      GROUP BY c.id;
    `, [userId, userId, start, end]);
    set({ budgets: rows });
  },

  fetchSpendingBreakdown: () => {
    const userId = useAuthStore.getState().user?.id ?? null;
    const totalResult = db.getFirstSync<{ grand_total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as grand_total
       FROM transactions
       WHERE user_id IS ? AND type = 'expense' AND deleted_at IS NULL;`,
      [userId]
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
        COALESCE(c.id, 'uncategorized') as category_id,
        COALESCE(c.name, 'Uncategorized') as category_name,
        c.color as category_color,
        c.icon as category_icon,
        COALESCE(SUM(t.amount), 0) as total_spent
      FROM transactions t
      LEFT JOIN categories c ON c.id = t.category_id
      WHERE t.user_id IS ? AND t.type = 'expense' AND t.deleted_at IS NULL
      GROUP BY c.id
      HAVING total_spent > 0
      ORDER BY total_spent DESC;
    `, [userId]);

    const breakdown = rows.map((item) => ({
      ...item,
      percentage: grandTotal > 0 ? (item.total_spent / grandTotal) * 100 : 0,
    }));

    set({ spendingBreakdown: breakdown });
  },

  addTransaction: (txData) => {
    const user = useAuthStore.getState().user;
    const id = uuidv4();
    const updated_at = new Date().toISOString();
    const type = txData.type || 'expense';
    const title = txData.title || 'Transaction';

    db.runSync(
      `INSERT INTO transactions (id, user_id, amount, type, title, category_id, note, date, receipt_url, sync_status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?);`,
      [
        id,
        user?.id || null,
        txData.amount,
        type,
        title,
        txData.category_id,
        txData.note || '',
        txData.date,
        txData.receipt_url || '',
        updated_at,
      ]
    );

    // Immediate UI refresh & queue update
    get().fetchTransactions();
    get().fetchBudgets();
    get().fetchSpendingBreakdown();
    useSyncStore.getState().getPendingCount();

    // Trigger background sync attempt
    useSyncStore.getState().syncData();
  },

  deleteTransaction: (id: string) => {
    const userId = useAuthStore.getState().user?.id ?? null;
    const updatedAt = new Date().toISOString();
    db.runSync(
      `UPDATE transactions
       SET deleted_at = ?, sync_status = 'pending', updated_at = ?
       WHERE id = ? AND user_id IS ? AND deleted_at IS NULL;`,
      [updatedAt, updatedAt, id, userId]
    );

    // Immediate UI refresh & queue update
    get().fetchTransactions();
    get().fetchBudgets();
    get().fetchSpendingBreakdown();
    useSyncStore.getState().getPendingCount();

    // Trigger background sync attempt
    useSyncStore.getState().syncData();
  },

  setBudgetLimit: (categoryId: string, limit: number) => {
    const userId = useAuthStore.getState().user?.id ?? null;
    const updated_at = new Date().toISOString();

    const existing = db.getFirstSync<{ id: string }>(
      'SELECT id FROM budgets WHERE category_id = ? AND user_id IS ?;',
      [categoryId, userId]
    );

    if (existing) {
      db.runSync(
        'UPDATE budgets SET amount_limit = ?, sync_status = "pending", updated_at = ? WHERE category_id = ? AND user_id IS ?;',
        [limit, updated_at, categoryId, userId]
      );
    } else {
      const id = uuidv4();
      db.runSync(
        'INSERT INTO budgets (id, user_id, category_id, amount_limit, sync_status, updated_at) VALUES (?, ?, ?, ?, "pending", ?);',
        [id, userId, categoryId, limit, updated_at]
      );
    }

    get().fetchBudgets();
  },
}));