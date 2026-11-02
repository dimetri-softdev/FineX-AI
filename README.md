# FineX

FineX is an Expo and React Native personal-finance app for recording income and
expenses, viewing spending summaries, setting monthly category budgets, and
capturing receipt details with a Supabase Edge Function.

## Features

- Local transaction storage with SQLite.
- Income and expense entry, with totals based on recorded transactions.
- Monthly expense budgets and category spending analytics.
- Supabase authentication and per-account transaction sync.
- Soft-deleted transactions sync as tombstones so deletions are not restored
  during a later download.
- Receipt OCR through the `receipt-ocr` Supabase Edge Function.

Budgets are currently stored on the device and are not synced. Biometric app
locking and spending notifications are not implemented. Transactions entered
while signed out stay local to the device and are not automatically attached
to an account after sign-in.

## Setup

### Requirements

- Node.js 18 or newer
- npm
- Expo Go or an Android/iOS development build

### Install and configure

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env` and set your Supabase project URL and anon key:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```

3. Link the Supabase CLI and apply the database migration. The existing
   `transactions` table must be present in the project:

   ```sh
   supabase link --project-ref YOUR_PROJECT_ID
   supabase db push
   ```

   The migration adds the `deleted_at` column required for synced deletions.

4. Configure and deploy receipt OCR. Keep the Groq key server-side; never put
   it in the app or an `EXPO_PUBLIC_` variable:

   ```sh
   supabase secrets set GROQ_API_KEY=YOUR_GROQ_API_KEY
   supabase functions deploy receipt-ocr
   ```

5. Start the app:

   ```sh
   npm start
   ```

## Sync behavior

Transactions are uploaded for the signed-in user only. Sync compares each
pending local transaction with the matching remote record; the version with
the later `updated_at` timestamp wins, with ties favoring the remote record.
Local guest transactions are isolated from signed-in accounts and are not
uploaded automatically.

## Development

```sh
npm test
npm run lint
npx tsc --noEmit
```

See [LICENSE](./LICENSE) for license information.
