// src/store/useSyncStore.ts
import { create } from 'zustand';
import { db } from '../db/schema';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './useAuthStore';

export interface LocalTransaction {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  type: 'income' | 'expense';
  title: string;
  note: string | null;
  date: string;
  sync_status: 'pending' | 'synced';
  updated_at: string;
  deleted_at: string | null;
}

interface RemoteTransaction extends LocalTransaction {
  user_id: string;
  category_id: string | null;
  note: string | null;
  deleted_at: string | null;
}

const applyRemoteTransaction = (item: RemoteTransaction) => {
  db.runSync(
    `INSERT INTO transactions
     (id, user_id, category_id, amount, type, title, note, date, sync_status, updated_at, deleted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       user_id = excluded.user_id,
       category_id = excluded.category_id,
       amount = excluded.amount,
       type = excluded.type,
       title = excluded.title,
       note = excluded.note,
       date = excluded.date,
       sync_status = 'synced',
       updated_at = excluded.updated_at,
       deleted_at = excluded.deleted_at
     WHERE transactions.user_id = excluded.user_id
       AND excluded.updated_at >= transactions.updated_at`,
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
      item.deleted_at,
    ]
  );
};

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

  getPendingCount: () => {
    try {
      const userId = useAuthStore.getState().user?.id ?? null;
      const result = db.getFirstSync<{ count: number }>(
        `SELECT COUNT(*) as count
         FROM transactions
         WHERE user_id IS ? AND sync_status = 'pending'`,
        [userId]
      );
      set({ pendingCount: result?.count || 0 });
    } catch (error) {
      console.error('Failed to get pending count:', error);
    }
  },

  syncData: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return { success: false, error: 'User not authenticated' };
    if (get().isSyncing) {
      return { success: false, error: 'A sync is already in progress.' };
    }

    set({ isSyncing: true });

    try {
      const { data: initialRemoteData, error: initialPullError } =
        await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id);

      if (initialPullError) throw initialPullError;
      if (useAuthStore.getState().user?.id !== user.id) {
        throw new Error('The active account changed during synchronization.');
      }

      const remoteById = new Map(
        (initialRemoteData ?? []).map(
          (item) => [item.id, item as RemoteTransaction] as const
        )
      );
      const pendingRows = db.getAllSync<LocalTransaction>(
        `SELECT * FROM transactions
         WHERE user_id = ? AND sync_status = 'pending'`,
        [user.id]
      );
      const rowsToPush: LocalTransaction[] = [];

      db.withTransactionSync(() => {
        for (const row of pendingRows) {
          const remote = remoteById.get(row.id);
          if (
            remote &&
            Number.isFinite(Date.parse(remote.updated_at)) &&
            Date.parse(remote.updated_at) >= Date.parse(row.updated_at)
          ) {
            applyRemoteTransaction(remote);
          } else {
            rowsToPush.push(row);
          }
        }
      });

      if (rowsToPush.length > 0) {
        const payload = rowsToPush.map((item) => ({
          id: item.id,
          user_id: item.user_id,
          category_id: item.category_id || null,
          amount: item.amount,
          type: item.type,
          title: item.title,
          note: item.note || null,
          date: item.date,
          updated_at: item.updated_at,
          deleted_at: item.deleted_at,
        }));

        const { error: pushError } = await supabase
          .from('transactions')
          .upsert(payload, { onConflict: 'id' });

        if (pushError) throw pushError;

        if (useAuthStore.getState().user?.id !== user.id) {
          throw new Error('The active account changed during synchronization.');
        }

        db.withTransactionSync(() => {
          for (const row of rowsToPush) {
            db.runSync(
              `UPDATE transactions
               SET sync_status = 'synced'
               WHERE id = ? AND user_id = ? AND sync_status = 'pending' AND updated_at = ?`,
              [row.id, user.id, row.updated_at]
            );
          }
        });
      }

      if (useAuthStore.getState().user?.id !== user.id) {
        throw new Error('The active account changed during synchronization.');
      }

      const { data: remoteData, error: pullError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      if (pullError) throw pullError;

      if (remoteData && remoteData.length > 0) {
        if (useAuthStore.getState().user?.id !== user.id) {
          throw new Error('The active account changed during synchronization.');
        }

        db.withTransactionSync(() => {
          for (const item of remoteData) {
            const local = db.getFirstSync<{
              updated_at: string;
              sync_status: 'pending' | 'synced';
            }>(
              'SELECT updated_at, sync_status FROM transactions WHERE id = ? AND user_id = ?;',
              [item.id, user.id]
            );

            if (
              local?.sync_status === 'pending' &&
              Date.parse(local.updated_at) > Date.parse(item.updated_at)
            ) {
              continue;
            }

            applyRemoteTransaction(item as RemoteTransaction);
          }
        });
      }

      if (useAuthStore.getState().user?.id !== user.id) {
        throw new Error('The active account changed during synchronization.');
      }

      get().getPendingCount();
      set({ isSyncing: false, lastSyncedAt: new Date().toISOString() });
      return { success: true };
    } catch (error: unknown) {
      console.error('Sync failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      set({ isSyncing: false });
    }
  },
}));