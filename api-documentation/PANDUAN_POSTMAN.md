# Panduan Postman — Product Catalog CRUD + PATCH

**Base URL:** `http://localhost:3000`  
**Collection:** `Product_Catalog_API_Full_CRUD.postman_collection.json`

## Import

1. Pastikan Node.js sudah terpasang. Dari akar proyek: `npm ci` (atau `npm install`), lalu `npm run dev`.
2. Pada Postman: **Import** → pilih file JSON collection.
3. Pastikan collection variable `baseUrl` adalah `http://localhost:3000`.
4. Jalankan GET pertama `GET /api/products`; respons harus 200, `total` = 9 sebelum ada mutasi.

## Cakupan request

| Folder | Cakupan |
| --- | --- |
| 01 - Browse & Detail | GET list/detail/404 |
| 02 - Search | Case-insensitive search + empty result |
| 03 - Category & Price | Category, inclusive bounds, invalid price |
| 04 - Sorting | Sort name/price dan error invalid |
| 05 - Combined | Gabungan beberapa kriteria |
| 06 - CRUD Mutation Flow | **Jalankan berurutan** POST → GET → PUT → PATCH → GET → error cases → DELETE → GET |
| 07 - Validation Edge Cases | Query ganda, image URL invalid, quantity pecahan, PATCH invalid |

## Pengujian perubahan data (wajib urut)

Sebelum menjalankan folder **06**, restart server agar data kembali ke **9 produk**.

1. POST membuat produk baru, status **201**, `createdProductId` disimpan di variable collection.
2. GET memastikan produk baru bisa dilihat.
3. PUT mengubah `price` jadi 300000 dan kemudian `variants.quantity` jadi 99 (**PUT lama tetap partial**).
4. PATCH mengubah `description` tanpa menyentuh field lain.
5. PATCH mengubah `variants.quantity` menjadi 88 tanpa kehilangan `colorOrSize`.
6. GET memastikan harga, deskripsi, dan variant benar.
7. Request tidak valid mengembalikan **400**; ID tidak ada mengembalikan **404**.
8. DELETE menghapus produk yang dibuat; GET detail mengembalikan **404**.
9. GET list akhir kembali `total` **9**.

Selama penggunaan collection, jangan jalankan POST dan DELETE secara acak di luar urutan ketika ingin memvalidasi total yang diharapkan.

## Kontrak UPDATE

- `PUT /api/products/:id` mempertahankan perilaku proyek versi awal: **partial update** (kompatibilitas mundur).
- `PATCH /api/products/:id` juga mendukung **partial update**. Contoh body:

```json
{
  "variants": { "quantity": 88 }
}
```

Keduanya mengembalikan 200 beserta produk terbaru; field yang tidak dikirim tidak berubah. Sebagai konvensi REST, PUT sering berarti penggantian penuh, namun mini project mempertahankan perilaku PUT lama agar tidak memutus pengujian sebelumnya. Di masa depan dapat diubah melalui versi API baru.

## Status yang diharapkan

- **200** GET/PUT/PATCH/DELETE sukses, serta pencarian tanpa hasil (`data: []`).
- **201** POST sukses.
- **400** validasi input/query JSON tidak valid.
- **404** produk ID tidak ditemukan.

