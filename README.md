# Ramadhan Companion (Realtime + eQuran API)

- Realtime Supabase (postgres_changes) untuk tilawah/hafalan/tracker/quran_progress/admin stats
- Quran via eQuran API (https://equran.id/apidev/v2) melalui route handler Next.js (`/api/equran/*`) agar caching aman & konsisten

## Jalankan
1) `npm i`
2) Buat `.env.local` dari `.env.example`
3) Jalankan SQL: `supabase/schema.sql` di Supabase SQL Editor
4) `npm run dev`
