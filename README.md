# Product Catalog REST API â€” CRUD + MySQL

Mini Project **Modern Back-End Development with AI** menggunakan JavaScript, Node.js, Express.js, dan **MySQL** sebagai penyimpanan utama.

**Workflow dokumentasi:** `.kiro/specs/product-catalog-crud/` berisi Requirements, Design, dan Tasks yang mencakup kebutuhan CRUD awal serta migrasi MySQL (R19-R21).

## Persyaratan

- Node.js **18 atau lebih baru**
- npm
- **MySQL Community Server** berjalan secara lokal (database `product_catalog`, user `catalog_app`)
- Postman untuk pengujian HTTP

## Setup database

### 1. Buat skema tabel

Jalankan `database/schema.sql` di MySQL Workbench atau via CLI:

`mysql -u root -p product_catalog < database/schema.sql`

### 2. Isi data awal (jika tabel masih kosong)

`mysql -u root -p product_catalog < database/seed_product_catalog.sql`

Jangan menjalankan seed ulang jika data sudah ada.

### 3. Buat file .env

Salin .env.example menjadi .env, lalu isi password:

`cp .env.example .env`

Isi nilai di .env:

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=catalog_app
DB_PASSWORD=<password_catalog_app_Anda>
DB_NAME=product_catalog

File .env diabaikan oleh Git. Jangan commit file ini.

## Jalankan aplikasi

`npm ci && npm run dev`

Server berjalan di http://localhost:3000 dan terhubung ke MySQL.
Jika koneksi gagal, server menampilkan pesan aman (tanpa password) dan keluar.

## Pengujian

Unit tests (tanpa database): `npm test`

Integration tests (memerlukan MySQL dan .env): `npm run test:integration`

Integration test membuat dan menghapus data terisolasi - tidak menghapus 9 produk seed.

## Struktur proyek

src/app.js                              - composition root + Express setup
src/routes/products.js                  - route definitions only
src/controllers/productController.js
src/services/productService.js          - use cases, filter & CRUD
src/domain/errors.js
src/repositories/inMemoryProductRepository.js  - in-memory (unit test)
src/repositories/mysqlProductRepository.js     - MySQL adapter (runtime)
src/db/pool.js                          - mysql2/promise connection pool
src/data/products.js                    - seed 9 products
src/utils/validateProduct.js
database/schema.sql                     - CREATE TABLE definitions
database/seed_product_catalog.sql       - data awal 9 produk
test/productService.test.js             - unit tests (npm test)
test/mysqlRepository.integration.test.js - integration tests
api-documentation/                      - Postman Collection + guide
.env.example                            - template konfigurasi

## API

GET    /api/products        Browse, search, filter, sort  200
GET    /api/products/:id    Detail produk                 200
POST   /api/products        Buat produk baru              201
PUT    /api/products/:id    Partial update (legacy)       200
PATCH  /api/products/:id    Partial update + nested       200
DELETE /api/products/:id    Hapus produk                  200

Error: 400 input invalid, 404 tidak ditemukan, 500 error database.

Query params GET list (semua opsional): q, category, minPrice, maxPrice, sort (name_asc/name_desc/price_asc/price_desc).

## Catatan persistensi

Data POST/PUT/PATCH/DELETE tersimpan di MySQL dan bertahan setelah server restart.
npm test (unit) tidak memerlukan database.
Restart server membaca ulang dari MySQL, bukan mereset ke data awal.
