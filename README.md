# Product Catalog REST API — CRUD + PATCH

Mini Project **Modern Back-End Development with AI** menggunakan JavaScript, Node.js, Express.js. Mendukung GET katalog dan detail, pencarian, filter kategori/harga, sorting, serta operasi POST, PUT, PATCH, DELETE.

**Workflow dokumentasi:** `.kiro/specs/product-catalog-crud/` berisi Requirements, Design, dan Tasks. Desain memotret implementasi proyek yang sudah ada, kemudian perubahan PATCH dan pemisahan arsitektur. Specs ini merupakan dokumentasi retrospektif beserta enhancement, bukan klaim semua tahapan dilakukan sebelum coding.

## Persyaratan

- Node.js **18 atau lebih baru** (native `structuredClone`, `node:test`)
- npm
- Postman untuk pengujian HTTP

## Jalankan aplikasi

```bash
npm ci
npm run dev
```

Server berjalan di `http://localhost:3000`. Gunakan `npm start` untuk mode tanpa auto-restart.

Untuk menjalankan pengujian otomatis logika aplikasi:

```bash
npm test
```

`npm test` menggunakan Node.js test runner, tanpa perlu server berjalan. Jalankan **Postman** secara terpisah untuk memeriksa request/response HTTP nyata. `npm ci` dapat diganti `npm install` jika diperlukan.

## Struktur proyek

```text
src/
├── app.js                       # composition root + Express setup
├── routes/products.js           # route definitions only
├── controllers/productController.js
├── services/productService.js   # use cases, filter & CRUD
├── domain/errors.js             # application errors
├── repositories/inMemoryProductRepository.js
├── data/products.js             # seed 9 products in 4 categories
└── utils/validateProduct.js     # shared input validation
test/productService.test.js       # Node.js automated tests
api-documentation/               # Postman Collection + guide
.kiro/specs/product-catalog-crud/ # requirements, design, tasks
```

Pemisahan ini adalah arsitektur berlapis **terinspirasi Clean Architecture**, karena service tidak bergantung pada Express atau data store konkret; repository diinjeksi dari `app.js`.

## API

| Method | Endpoint | Kegunaan | HTTP success |
| --- | --- | --- | --- |
| GET | `/api/products` | Browse, search, filter, sort | 200 |
| GET | `/api/products/:id` | Detail produk | 200 |
| POST | `/api/products` | Buat produk baru | 201 |
| PUT | `/api/products/:id` | Ubah sebagian field (**perilaku lama dipertahankan**) | 200 |
| PATCH | `/api/products/:id` | Ubah sebagian field, termasuk nested `variants` | 200 |
| DELETE | `/api/products/:id` | Hapus produk | 200 |

Error: **400** untuk input/query invalid, **404** untuk ID tidak ditemukan.

Parameter GET list semuanya opsional: `q` (keyword name/description, case-insensitive), `category` (exact case-insensitive), `minPrice`, `maxPrice` (batas inklusif, IDR), `sort` (`name_asc`, `name_desc`, `price_asc`, `price_desc`). Parameter dapat dikombinasikan.

Contoh:

```http
GET http://localhost:3000/api/products?q=sepatu&category=Footwear&minPrice=300000&sort=price_desc
```

GET list merespons `{ "data": [...], "total": N }` dan jika kosong menambahkan `message`.

### Contoh POST

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

Response **201** mengembalikan produk dengan ID otomatis (misalnya `10` pada dataset awal).

### Contoh PUT dan PATCH

Keduanya menerima **body parsial** untuk menjaga kompatibilitas implementasi PUT lama, contohnya:

```http
PATCH http://localhost:3000/api/products/10
Content-Type: application/json
```

```json
{ "variants": { "quantity": 99 } }
```

Response 200 berisi produk terbaru; `variants.colorOrSize` yang lama tetap ada. Perilaku partial pada PUT adalah **kompatibilitas mini project**, berbeda dari konvensi umum PUT sebagai full replace.

## Dokumentasi API dan pengujian

Impor `api-documentation/Product_Catalog_API_Full_CRUD.postman_collection.json` ke Postman, lalu baca `api-documentation/PANDUAN_POSTMAN.md`. Jalankan folder CRUD **berurutan**, karena operasi POST, PUT, PATCH, DELETE mengubah data memori.
