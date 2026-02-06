# Ramadhan Companion (Mobile-Only)

Stack:
- Next.js (App Router) + TypeScript + TailwindCSS
- Supabase Auth & DB
- React Query + Zod
- Vercel friendly

## Jalankan
1) Install deps
```bash
npm i
```

2) Buat file `.env.local`
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

3) Run dev
```bash
npm run dev
```

## Mobile-only
- App utama hanya untuk viewport <= 480px.
- Untuk desktop akan diarahkan ke `/use-mobile`.

## Supabase SQL + RLS
Lihat `supabase/schema.sql` lalu jalankan di SQL Editor Supabase.

