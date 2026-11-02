// src/store/useSyncStore.ts
import { create } from 'zustand';
import { db } from '../db/schema';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './useAuthStore';

export interface LocalTransaction {
  id: string;
  user_id: string;
  category_id?: string;
  amount: number;
  type: 'income' | 'expense';
  title: string;
  note?: string;
  date: string;
  sync_status: 'pending' | 'synced';
  updated_at: string;
}

interface SyncState {
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
  getPendingCount: () => void;
  syncData: () => Promise<{ success: boolean; error?: string }>;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  isSyncing: false,
  pendingCount: 0,
  lastSyncedAt: null,

  // Check how many records are waiting to push to Supabase
  getPendingCount: () => {
    try {
      const result = db.getFirstSync<{ count: number }>(
        `SELECT COUNT(*) as count FROM transactions WHERE sync_status = 'pending'`
      );
      set({ pendingCount: result?.count || 0 });
    } catch (e) {
      console.error('Failed to get pending count:', e);
    }
  },

  // Main Two-Way Sync Handler
  syncData: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return { success: false, error: 'User not authenticated' };

    set({ isSyncing: true });

    try {
      // -----------------------------------------------------------------
      // PUSH: Upload pending local records to Supabase
      // -----------------------------------------------------------------
      const pendingRows = db.getAllSync<LocalTransaction>(
        `SELECT * FROM transactions WHERE sync_status = 'pending'`
      );

      if (pendingRows.length > 0) {
        // Map rows for Supabase insertion
        const payload = pendingRows.map((item) => ({
          id: item.id,
          user_id: user.id,
          category_id: item.category_id || null,
          amount: item.amount,
          type: item.type,
          title: item.title,
          note: item.note || null,
          date: item.date,
          updated_at: item.updated_at,
        }));

        const { error: pushError } = await supabase
          .from('transactions')
          .upsert(payload, { onConflict: 'id' });

        if (pushError) throw pushError;

        // Mark pushed rows as 'synced' locally
        const syncedIds = pendingRows.map((r) => `'${r.id}'`).join(',');
        db.execSync(
          `UPDATE transactions SET sync_status = 'synced' WHERE id IN (${syncedIds})`
        );
      }

      // -----------------------------------------------------------------
      // PULL: Fetch latest records from Supabase into local SQLite
      // -----------------------------------------------------------------
      const { data: remoteData, error: pullError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      if (pullError) throw pullError;

      if (remoteData && remoteData.length > 0) {
        db.withTransactionSync(() => {
          for (const item of remoteData) {
            // Upsert into local database
            db.runSync(
              `INSERT OR REPLACE INTO transactions 
               (id, user_id, category_id, amount, type, title, note, date, sync_status, updated_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?)`,
              [
                item.id,
                item.user_id,
                item.category_id,
                item.amount,
                item.type,
                item.title,
                item.note,
                item.date,
                item.updated_at,
              ]
            );
          }
        });
      }

      get().getPendingCount();
      set({ isSyncing: false, lastSyncedAt: new Date().toISOString() });
      return { success: true };
    } catch (error: any) {
      console.error('Sync failed:', error);
      set({ isSyncing: false });
      return { success: false, error: error.message };
    }
  },
}));