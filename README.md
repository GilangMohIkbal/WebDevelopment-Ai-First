# Product Catalog REST API

Mini project **Modern Back-End Development with AI** (Node.js + Express.js). Aplikasi menyediakan katalog produk e-commerce sederhana dengan pencarian, filter, sorting, dan operasi CRUD. Data disimpan dalam array JavaScript (*in-memory*) tanpa database.

## Teknologi

- JavaScript (Node.js)
- Express.js
- Postman untuk pengujian dan dokumentasi API

## Cara menjalankan

Pastikan Node.js dan npm telah terpasang. Buka terminal pada folder yang berisi `package.json`, lalu jalankan:

```bash
npm install
npm run dev
```

Server tersedia di `http://localhost:3000`. Untuk mode non-watch, gunakan `npm start`.

Coba `GET http://localhost:3000/api/products` di Postman atau browser.

## Endpoint

| Method | Endpoint | Kegunaan | Respons utama |
| --- | --- | --- | --- |
| GET | `/api/products` | Daftar, pencarian, filter, sorting | 200 |
| GET | `/api/products/:id` | Detail produk | 200 / 404 |
| POST | `/api/products` | Buat produk | 201 / 400 |
| PUT | `/api/products/:id` | Ubah field produk (mendukung update parsial) | 200 / 400 / 404 |
| DELETE | `/api/products/:id` | Hapus produk | 200 / 404 |

**Query parameter GET list** (semua opsional):

| Parameter | Contoh | Keterangan |
| --- | --- | --- |
| `q` | `sepatu` | Pencarian nama/deskripsi, tanpa peka kapital |
| `category` | `Footwear` | Filter kategori |
| `minPrice` | `120000` | Batas minimum inklusif |
| `maxPrice` | `180000` | Batas maksimum inklusif |
| `sort` | `price_desc` | `name_asc`, `name_desc`, `price_asc`, `price_desc` |

Contoh kombinasi:

```http
GET http://localhost:3000/api/products?q=sepatu&category=Footwear&minPrice=300000&sort=price_desc
```

Respons GET list berisi `data` (array) dan `total` (jumlah produk hasil filter). Hasil kosong mengembalikan `data: []`, `total: 0` dan pesan penjelas.

## Contoh request POST

Gunakan header `Content-Type: application/json`.

```http
POST http://localhost:3000/api/products
Content-Type: application/json
```

```json
{
  "name": "Jam Tangan Digital",
  "description": "Jam tangan digital dengan stopwatch dan tahan air.",
  "category": "Electronics",
  "price": 250000,
  "image": "https://picsum.photos/seed/jam-tangan-digital/400/400",
  "variants": {
    "colorOrSize": ["Black", "Silver"],
    "quantity": 20
  }
}
```

Respons berhasil: HTTP **201** dengan objek produk dan ID otomatis. `PUT` mengizinkan perubahan sebagian field (misalnya `{ "price": 300000 }`) sesuai implementasi tugas. `DELETE` mengembalikan HTTP **200** dengan informasi produk yang dihapus. Input tidak valid menghasilkan **400** dan produk tidak ada menghasilkan **404**.

## Dokumentasi dan pengujian Postman

Impor file:

`api-documentation/Product_Catalog_API_Full_CRUD.postman_collection.json`

Langkah:

1. Jalankan server lokal.
2. Buka Postman → **Import** → pilih file JSON di atas.
3. Jalankan request GET satu per satu.
4. Untuk pengujian perubahan data, jalankan folder **06 - CRUD Mutation Flow (run sequentially)** secara berurutan dengan Collection Runner, mulai dari POST sampai DELETE.
5. Pastikan HTTP status, payload, dan hasil test sesuai. Semua pengujian yang dikirim di Postman Collection perlu dijalankan sendiri pada lingkungan lokal.

## Catatan batasan

- Dataset awal berisi 9 produk dari 4 kategori.
- Data CRUD hanya disimpan di memori. **Restart server mengembalikan data awal**, sehingga perubahan tidak permanen.
- Foto menggunakan URL placeholder; URL valid secara format tidak menjamin bahwa isi gambar sesuai nama produk atau selalu tersedia.
- Tidak menggunakan database, autentikasi, frontend, atau deployment produksi.
- Jangan upload `node_modules` atau file rahasia seperti `.env` ke GitHub; dependensi dapat dipasang lewat `npm install`.
