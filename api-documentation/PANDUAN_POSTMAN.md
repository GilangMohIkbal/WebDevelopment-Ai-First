# Panduan Postman — Product Catalog API

**Base URL:** `http://localhost:3000`

File koleksi: `Product_Catalog_API_Full_CRUD.postman_collection.json`

## Impor

1. Pastikan server berjalan lewat `npm run dev` dari akar proyek.
2. Pada Postman, klik **Import** dan pilih file `.json`.
3. Collection menyediakan variabel `baseUrl` untuk alamat server; default `http://localhost:3000`.

## Pengujian utama

- GET `/api/products`: 200, array 9 produk awal (`data` dan `total`).
- GET `/api/products/1`: 200, detail produk.
- GET `/api/products/99`: 404, produk tidak ada.
- GET `?q=sepatu`: 200, dua produk sepatu.
- GET `?category=Electronics`: 200, dua produk.
- GET `?minPrice=120000&maxPrice=180000`: 200, kedua batas inklusif.
- GET `?sort=price_desc`: 200, harga turun.
- GET query dengan `minPrice > maxPrice`: 400, pesan kesalahan.
- GET pencarian yang tidak cocok: 200, `data=[]`, `total=0`.
- GET dengan kombinasi `q`, `category`, `minPrice`, `sort`: 200, cocok semua filter.

## Pengujian CRUD berurutan

Jalankan folder **06 - CRUD Mutation Flow (run sequentially)** dalam urutan default:

1. POST produk baru → **201**, ID tercatat otomatis ke variabel collection.
2. GET ID baru → **200**.
3. PUT harga → **200**.
4. PUT quantity varian → **200**, warna lama tetap.
5. GET detail lagi → **200**, nilai update tersimpan.
6. POST data tidak valid → **400**.
7. PUT harga negatif → **400**.
8. PUT ID tidak ada → **404**.
9. DELETE produk yang baru dibuat → **200**.
10. GET produk yang telah dihapus → **404**.
11. DELETE ID tidak ada → **404**.
12. GET list → **200**, jumlah kembali 9 (dengan asumsi dataset awal dan belum ada perubahan lain).

**Catatan:** Request PUT dan DELETE mengubah data di memori. Untuk memulai dari dataset awal, restart server. Simpan screenshot request/response Postman sebagai bukti bila diminta instruktur.
