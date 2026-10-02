// src/store/useTransactionStore.ts
import { create } from 'zustand';
import { db } from '../db/schema';

export interface Transaction {
  id: string;
  amount: number;
  category_id: string;
  note: string;
  date: string;
  receipt_url?: string;
  sync_status: 'pending' | 'synced';
  updated_at: string;
}

interface TransactionState {
  transactions: Transaction[];
  fetchTransactions: () => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'sync_status' | 'updated_at'>) => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],

  fetchTransactions: () => {
    const rows = db.getAllSync<Transaction>('SELECT * FROM transactions ORDER BY date DESC;');
    set({ transactions: rows });
  },

  addTransaction: (txData) => {
    const id = `tx_${Date.now()}`;
    const updated_at = new Date().toISOString();

    db.runSync(
      `INSERT INTO transactions (id, amount, category_id, note, date, receipt_url, sync_status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?);`,
      [id, txData.amount, txData.category_id, txData.note, txData.date, txData.receipt_url || '', updated_at]
    );

    get().fetchTransactions();
  },
}));