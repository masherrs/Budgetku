# BudgetKu

BudgetKu adalah MVP aplikasi budgeting mobile-first untuk keuangan pribadi dan bersama. Aplikasi dibangun dengan Next.js App Router, TypeScript, Tailwind CSS, dan Supabase.

## Menjalankan lokal

1. Salin `.env.example` menjadi `.env.local`.
2. Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dari project Supabase.
3. Jalankan migration `supabase/migrations/202607240001_initial.sql` melalui Supabase SQL Editor atau Supabase CLI.
4. Jalankan:

   ```bash
   npm install
   npm run dev
   ```

Landing page tetap dapat dibuka tanpa environment Supabase. Halaman aplikasi akan menampilkan panduan konfigurasi sampai kredensial tersedia.

## Fitur Phase 1

- Register, login, logout, forgot password, dan protected app routes.
- Workspace pribadi otomatis, workspace bersama, role owner/admin/member, dan invitation table.
- Akun keuangan dengan saldo berjalan yang dihitung dari transaksi.
- Kategori pemasukan/pengeluaran default Indonesia.
- Transaksi pemasukan, pengeluaran, transfer, edit, hapus, dan filter.
- Budget bulanan per kategori dengan status aman, waspada, dan melebihi limit.
- Dashboard aktual dari data Supabase.
- Import teks WhatsApp dengan parsing, review, dan konfirmasi sebelum simpan.
- Halaman profil dan placeholder OCR struk Phase 2.
- RLS per workspace dan validasi relasi lintas workspace.

## Deployment Vercel

Import repository ke Vercel, tambahkan tiga environment variable dari `.env.example`, lalu deploy dengan build command `npm run build`. Gunakan URL produksi sebagai `NEXT_PUBLIC_APP_URL` dan tambahkan URL callback tersebut ke konfigurasi Auth Supabase.

## Validasi

```bash
npm run lint
npm run build
```
