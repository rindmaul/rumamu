# rumamu

E-commerce furnitur rotan. React + Vite + TypeScript, Tailwind CSS v4, React Router, Lucide, dan Supabase (Database + Auth + Storage). Cart di localStorage, checkout dan pembayaran bersifat simulasi (tugas), siap deploy ke Netlify.

Website tetap bisa dipratinjau penuh tanpa Supabase berkat fallback data lokal (sembilan produk awal). Begitu env Supabase diisi, data beralih ke database.

---

## 1. Teknologi

- React 18 + Vite 6 + TypeScript (mode strict)
- Tailwind CSS v4 (plugin `@tailwindcss/vite`)
- React Router v6
- lucide-react (ikon), qrcode (QR simulasi)
- Supabase JS v2 (Database, Auth, Storage)
- Font self-hosted via Fontsource: Cormorant Garamond (heading) + Outfit (body)

## 2. Struktur penting

```
public/products/        9 foto produk (image1..image9.png)
public/logo/            logo rumamu (image10.jpeg)
src/config/site.ts      semua teks/brand/nav/ongkir/metode bayar (mudah diubah)
src/data/products.ts    fallback 9 produk (mirror seed.sql)
src/lib/supabase.ts     client + flag isSupabaseConfigured
src/services/           akses data produk & order (Supabase atau fallback)
src/context/            Cart (localStorage), Auth, Toast
src/pages/              Home, Shop, ProductDetail, Cart, Checkout, Payment, OrderSuccess, About, NotFound
src/pages/admin/        Login, Dashboard, Products, ProductForm, Orders
supabase/migrations/    0001_init.sql, 0002_order_rpcs.sql
supabase/seed.sql       4 kategori + 9 produk
netlify.toml            konfigurasi build + SPA redirect
.env.example            template environment variable
```

## 3. Menjalankan secara lokal

```bash
npm install
npm run dev          # http://localhost:5173
```

Tanpa env Supabase, situs jalan dalam mode pratinjau (data lokal). Untuk build produksi:

```bash
npm run build        # tsc -b && vite build  -> output ke dist/
npm run preview      # uji hasil build secara lokal
```

## 4. Menyiapkan Supabase

### 4.1 Buat project

1. Buat project baru di https://supabase.com.
2. Catat Project URL dan anon (publishable) key dari Project Settings -> API.

### 4.2 Jalankan migration

Jalankan isi file berikut di SQL Editor Supabase, berurutan:

1. `supabase/migrations/0001_init.sql` (tabel, index, RLS, helper `is_admin`, trigger profil, bucket storage)
2. `supabase/migrations/0002_order_rpcs.sql` (RPC `create_order`, `get_order_with_items`, `confirm_order_payment`)

Atau dengan Supabase CLI (verifikasi nama command dengan `supabase --help`, karena CLI sering berubah):

```bash
supabase link --project-ref <ref>
supabase db push
```

### 4.3 Jalankan seed

Jalankan `supabase/seed.sql` di SQL Editor untuk mengisi 4 kategori dan 9 produk awal.

### 4.4 Buat akun admin

1. Authentication -> Users -> Add user. Isi email + password (akun tidak hardcoded di kode).
2. Trigger `on_auth_user_created` otomatis membuat baris di `profiles` dengan role `customer`.
3. Ubah role menjadi `admin` lewat SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'admin@rumamu.id');
```

### 4.5 Storage bucket

Bucket `product-images` sudah dibuat oleh migration (public read, write khusus admin). Jika belum ada, buat manual bucket `product-images` dan set Public.

## 5. Environment variable

Salin `.env.example` menjadi `.env.local` lalu isi:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Hanya dua variabel ini yang dipakai frontend. Jangan pernah memasukkan service_role key ke frontend atau repo publik.

## 6. Deploy ke Netlify

1. Push repo ke GitHub.
2. Di Netlify: New site from Git, pilih repo. Build command `npm run build`, publish directory `dist` (sudah diatur di `netlify.toml`, termasuk redirect SPA `/* -> /index.html`).
3. Site settings -> Environment variables: tambahkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
4. Deploy.

## 7. Cara pakai admin (setelah deploy)

- Login di `/admin/login` dengan akun admin (Bagian 4.4).
- `/admin` ringkasan, `/admin/products` kelola produk (tambah, edit, ubah harga/stok/status, arsip, hapus, upload gambar ke Storage), `/admin/orders` pantau pesanan dan ubah status.
- Produk yang diarsipkan (`is_active = false`) tidak muncul di katalog publik tetapi riwayat pesanan tetap utuh.

## 8. Keamanan (ringkas)

- RLS aktif di semua tabel. Publik hanya membaca kategori dan produk aktif.
- Helper `private.is_admin()` SECURITY DEFINER (`search_path = ''`) memutus rekursi RLS pada `profiles`.
- Pembuatan order dan pengurangan stok lewat RPC `create_order` yang mengunci baris produk (`SELECT ... FOR UPDATE`) sehingga aman dari race condition dan stok tidak pernah minus.
- Pelanggan anonim membaca/konfirmasi order miliknya lewat RPC, bukan akses tabel langsung.

## 9. Hal yang sengaja dibuat simulasi

- Pembayaran: QRIS, Transfer Bank, dan E-Wallet semuanya simulasi. QR memuat teks demo `RUMAMU-DEMO-PAYMENT-{orderNumber}-{total}` dan tidak terhubung ke rekening atau transaksi nyata.
- Receipt adalah ringkasan pesanan, bukan bukti pembayaran bank asli.
- Newsletter, tombol favorit, dan estimasi pengiriman bersifat dummy.

## 10. Catatan

Command CLI Supabase dapat berubah antarversi; selalu cek `supabase --help`. SQL di repo ini diverifikasi secara sintaks/logika; jalankan migration di project Anda lalu uji satu alur checkout untuk memastikan semuanya tersambung.
