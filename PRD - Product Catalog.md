# Product Requirements Document (PRD)

## Product Catalog Service

**Status:** Final
**Version:** 1.0  
**Product scope:** Product catalog only  
**Document purpose:** Menjelaskan kebutuhan produk dan perilaku yang diharapkan sebelum kebutuhan tersebut diterjemahkan menjadi spesifikasi teknis.

---

## 1. Product Overview

Product Catalog Service menyediakan informasi produk yang dapat digunakan oleh aplikasi e-commerce atau client lain. Layanan ini membantu pengguna menemukan produk yang relevan, membandingkan pilihan berdasarkan harga, dan melihat informasi produk sebelum mengambil keputusan lebih lanjut.

Untuk exercise bootcamp, cakupan dibatasi pada modul **Product**. Fokusnya adalah kemampuan menjelajahi katalog—melihat produk, mencari, memfilter, mengurutkan, dan melihat detail produk. Pengelolaan produk, transaksi, serta proses pembelian tidak termasuk dalam kebutuhan inti.

## 2. Problem Statement

Pengguna membutuhkan cara yang mudah untuk menemukan produk di antara beberapa pilihan. Menampilkan daftar produk saja tidak cukup ketika katalog berisi produk dengan nama, kategori, dan harga yang berbeda. Pengguna perlu dapat mencari produk tertentu, mempersempit pilihan, serta mengurutkan hasil sesuai kebutuhannya.

Dari sisi aplikasi yang menggunakan layanan ini, informasi produk perlu disediakan secara konsisten agar pengalaman menjelajahi katalog tidak bergantung pada data yang ditulis langsung di aplikasi client.

## 3. Product Goals

1. Memungkinkan pengguna melihat katalog dan informasi dasar setiap produk.
2. Membantu pengguna menemukan produk melalui pencarian kata kunci.
3. Membantu pengguna mempersempit pilihan berdasarkan kategori dan rentang harga.
4. Membantu pengguna membandingkan pilihan dengan mengurutkan hasil berdasarkan nama atau harga.
5. Menyediakan informasi detail untuk produk yang dipilih.
6. Menjaga perilaku pencarian, filter, dan pengurutan tetap mudah dipahami serta dapat diprediksi.

## 4. Target Users

### Primary user — Prospective customer

Seseorang yang menjelajahi katalog untuk menemukan produk yang sesuai dengan kebutuhan atau anggarannya. Pengguna ini mungkin sudah mengetahui nama produk, hanya mengetahui kategorinya, atau ingin membandingkan produk berdasarkan harga.

### Secondary consumer — Client application

Aplikasi seperti storefront atau frontend yang membutuhkan informasi produk untuk menampilkan katalog kepada pengguna. Integrasi frontend bukan syarat untuk memenuhi kebutuhan produk pada exercise ini.

## 5. User Stories

- Sebagai calon pembeli, saya ingin melihat daftar produk agar mengetahui pilihan yang tersedia.
- Sebagai calon pembeli, saya ingin mencari berdasarkan kata kunci agar lebih cepat menemukan produk yang saya inginkan.
- Sebagai calon pembeli, saya ingin memfilter berdasarkan kategori agar dapat fokus pada jenis produk tertentu.
- Sebagai calon pembeli, saya ingin memfilter berdasarkan rentang harga agar dapat menemukan produk yang sesuai dengan anggaran.
- Sebagai calon pembeli, saya ingin mengurutkan produk berdasarkan nama atau harga agar lebih mudah membandingkan pilihan.
- Sebagai calon pembeli, saya ingin melihat detail suatu produk agar bisa memahami produk tersebut sebelum melanjutkan ke proses lain.
- Sebagai calon pembeli, saya ingin mendapat informasi yang jelas ketika tidak ada produk yang cocok dengan pencarian atau filter saya.

## 6. MVP Scope

### In scope

- Menampilkan daftar produk.
- Mencari produk dengan kata kunci.
- Memfilter produk berdasarkan kategori.
- Memfilter produk berdasarkan rentang harga.
- Mengurutkan produk berdasarkan nama atau harga.
- Melihat detail satu produk.
- Menunjukkan hasil kosong secara jelas ketika tidak ada produk yang cocok.
- Menyediakan data contoh yang cukup bervariasi untuk mencoba seluruh kemampuan katalog.

### Out of scope

- Menambahkan, mengubah, atau menghapus produk melalui layanan ini.
- Manajemen kategori sebagai fitur terpisah.
- Keranjang belanja, checkout, pesanan, pembayaran, pengiriman, promosi, dan pajak.
- Manajemen stok atau transaksi inventori. Informasi stok yang ditampilkan, jika ada, hanya merupakan informasi produk untuk exercise.
- Akun pengguna, autentikasi, dan otorisasi.
- Rekomendasi produk yang dipersonalisasi.
- Integrasi dengan layanan atau pemasok eksternal.
- Analitik, pelaporan, dan deployment production.
- Pembuatan frontend; frontend boleh dibuat sebagai extension setelah kebutuhan inti selesai.

## 7. Product Information

Informasi yang dibutuhkan untuk menjelaskan suatu produk:

| Information | Purpose |
|---|---|
| Unique product identity | Membedakan satu produk dari produk lainnya dan memungkinkan detail produk dipilih secara konsisten. |
| Product name | Menjelaskan nama produk dan membantu pencarian. |
| Description | Memberikan penjelasan singkat dan menjadi bagian dari pencarian kata kunci. |
| Category | Membantu pengguna mempersempit katalog ke jenis produk tertentu. |
| Price | Membantu pengguna membandingkan produk dan memfilter berdasarkan anggaran. Harga ditampilkan dalam Rupiah (IDR). |
| Product image | Menampilkan visual produk agar pengguna dapat melihat tampilan fisik produk. Image disimpan sebagai URL yang merujuk ke file gambar produk. |
| Product variants | Menyediakan informasi tentang variasi produk seperti warna, ukuran, atau varian lainnya yang tersedia. Setiap varian memiliki informasi ketersediaan atau quantity. |
| Availability / stock information | Memberi gambaran ketersediaan produk jika informasi ini ditampilkan. Manajemen inventori tidak termasuk dalam scope. |

PRD ini menjelaskan informasi yang dibutuhkan dari sisi produk, bukan tipe data, nama field teknis, struktur penyimpanan, ataupun bentuk response. Detail tersebut ditentukan pada spesifikasi teknis.

### Contoh Struktur Response API (Referensi Teknis)

Sebagai referensi untuk implementasi teknis, berikut contoh struktur response API yang mencakup field minimal yang dibutuhkan:

```json
{
  "id": 1,
  "name": "Nama Product",
  "price": 150000,
  "image": "https://.../product.png",
  "variants": {
    "colorOrSize": ["S", "M", "L"],
    "quantity": 10
  },
  "description": "Deskripsi singkat product..."
}
```

**Catatan:**
- Field `image` menyimpan URL gambar produk.
- Field `variants` berisi informasi variasi produk:
  - `colorOrSize`: array yang berisi pilihan warna atau ukuran yang tersedia
  - `quantity`: jumlah stok yang tersedia untuk produk ini
- Struktur detail dan validasi akan dijelaskan lebih lanjut di dokumen `design.md`.

## 8. Product Requirements and Acceptance Criteria

### PR-001 — Browse Product Catalog

Pengguna dapat melihat daftar produk beserta informasi utama yang membantu mereka memahami dan membandingkan pilihan.

**Acceptance criteria**

- Katalog menampilkan produk yang tersedia pada dataset untuk exercise.
- Setiap produk dalam daftar menampilkan setidaknya nama, harga, foto produk, dan kategori.
- Foto produk ditampilkan sebagai URL gambar yang valid.
- Deskripsi singkat dan informasi ketersediaan dapat ditampilkan sebagai informasi pendukung.
- Harga ditampilkan dalam Rupiah (IDR).
- Pengguna dapat memilih satu produk untuk melihat detailnya.

### PR-002 — Search Products

Pengguna dapat mencari produk menggunakan kata kunci, tanpa harus mengetahui identitas unik produk.

**Acceptance criteria**

- Pencarian mencocokkan kata kunci dengan nama dan deskripsi produk.
- Pencarian tidak membedakan huruf besar dan huruf kecil.
- Pencarian mendukung kecocokan sebagian kata, bukan hanya nama yang persis sama.
- Hasil hanya menampilkan produk yang cocok dengan kata kunci.
- Pengguna dapat menghapus kata kunci untuk kembali melihat seluruh produk yang sesuai dengan filter aktif.
- Jika tidak ada produk yang cocok, pengguna mendapat hasil kosong yang jelas; sistem tidak menampilkan produk yang tidak relevan seolah-olah cocok.

### PR-003 — Filter by Category

Pengguna dapat mempersempit daftar produk ke kategori tertentu.

**Acceptance criteria**

- Pengguna dapat memilih kategori yang tersedia dalam katalog.
- Setelah kategori dipilih, hanya produk dari kategori tersebut yang ditampilkan.
- Pengguna dapat menghapus filter kategori untuk memperluas hasil kembali.
- Jika kategori yang dipilih tidak memiliki produk yang cocok, sistem menampilkan hasil kosong yang jelas.

### PR-004 — Filter by Price Range

Pengguna dapat mempersempit daftar produk berdasarkan batas harga minimum, maksimum, atau keduanya.

**Acceptance criteria**

- Pengguna dapat menetapkan batas harga minimum saja, maksimum saja, atau keduanya.
- Produk yang harganya sama dengan batas minimum atau maksimum tetap termasuk dalam hasil.
- Jika kedua batas diisi, batas minimum tidak boleh lebih tinggi daripada batas maksimum; kondisi tersebut harus diberi feedback yang dapat dipahami.
- Pengguna dapat menghapus filter harga untuk kembali ke hasil tanpa batas harga.
- Filter harga dapat digunakan bersamaan dengan pencarian dan filter kategori.

### PR-005 — Sort Products

Pengguna dapat mengurutkan hasil untuk mempermudah penemuan dan perbandingan produk.

**Acceptance criteria**

- Pengguna dapat mengurutkan berdasarkan nama dari A ke Z.
- Pengguna dapat mengurutkan berdasarkan nama dari Z ke A.
- Pengguna dapat mengurutkan berdasarkan harga dari terendah ke tertinggi.
- Pengguna dapat mengurutkan berdasarkan harga dari tertinggi ke terendah.
- Pengurutan mengubah urutan hasil, bukan produk mana yang memenuhi pencarian atau filter.
- Pengurutan dapat diterapkan bersamaan dengan pencarian dan filter yang aktif.

### PR-006 — View Product Details

Pengguna dapat melihat informasi lebih lengkap tentang satu produk yang dipilih.

**Acceptance criteria**

- Detail yang ditampilkan merujuk pada produk yang dipilih.
- Informasi detail mencakup nama, deskripsi, kategori, harga, foto produk, dan variasi produk (warna/ukuran beserta quantity yang tersedia).
- Informasi ketersediaan ditampilkan jika tersedia.
- Variasi produk menampilkan pilihan yang tersedia (misalnya: S, M, L untuk ukuran atau warna yang tersedia) beserta jumlah stok.
- Jika produk yang diminta tidak ada dalam katalog, pengguna menerima hasil yang menjelaskan bahwa produk tidak ditemukan.

### PR-007 — Combine Search, Filters, and Sorting

Pengguna dapat menggunakan beberapa kemampuan katalog secara bersamaan untuk menemukan hasil yang lebih relevan.

**Acceptance criteria**

- Pencarian, filter kategori, dan filter harga dapat digunakan secara bersamaan.
- Hasil hanya berisi produk yang cocok dengan seluruh kriteria pencarian dan filter yang aktif.
- Pengurutan diterapkan pada hasil yang sudah memenuhi kriteria tersebut.
- Pengguna dapat mengubah atau menghapus satu kriteria tanpa harus menghapus kriteria lain yang masih ingin dipakai.
- Ketika kombinasi kriteria tidak menghasilkan produk, sistem menampilkan hasil kosong yang jelas.

## 9. Business Rules

1. Harga produk menggunakan mata uang Rupiah (IDR).
2. Batas harga minimum dan maksimum bersifat inklusif.
3. Pencarian kata kunci tidak membedakan huruf besar dan kecil serta mencakup nama dan deskripsi produk.
4. Filter kategori dan rentang harga mempersempit hasil yang telah dicari; jika beberapa filter aktif, sebuah produk harus memenuhi semuanya.
5. Pengurutan hanya mengubah urutan produk dalam hasil, bukan kriteria produk yang disertakan.
6. Setiap produk memiliki identitas unik agar pemilihan dan tampilan detailnya tidak ambigu.
7. Informasi ketersediaan, jika ditampilkan, tidak berarti layanan ini bertanggung jawab memperbarui atau mengelola stok.

## 10. Product Quality Expectations

- **Accuracy:** hasil pencarian, filter, dan pengurutan sesuai dengan kriteria yang dipilih pengguna.
- **Consistency:** hasil katalog dan detail merujuk pada informasi produk yang sama.
- **Clarity:** kondisi hasil kosong dan masukan rentang harga yang tidak valid dijelaskan dengan jelas.
- **Simplicity:** kemampuan katalog mudah dipahami dan tidak memasukkan proses bisnis di luar scope Product.

Target performa, format error, kontrak API, dan detail operasional bukan keputusan PRD ini; kebutuhan tersebut akan ditentukan jika diperlukan pada tahap desain teknis.

## 11. Demo Data Expectations

Untuk memungkinkan semua kebutuhan MVP diperagakan dan diuji, dataset contoh sebaiknya:

- Memuat setidaknya delapan produk.
- Mencakup setidaknya tiga kategori.
- Memiliki variasi nama, deskripsi, dan harga yang cukup untuk menguji pencarian, filter, dan pengurutan.
- Memuat beberapa produk dalam kategori yang sama agar filter kategori dapat diperlihatkan.
- Memuat produk dengan harga minimum dan maksimum yang berbeda agar filter harga dapat diperlihatkan.
- Setiap produk memiliki URL foto produk yang valid.
- Setiap produk memiliki informasi variasi (warna/ukuran) dengan quantity yang berbeda-beda untuk menunjukkan keragaman stok.

Data ini disiapkan untuk exercise dan bukan berarti produk memerlukan fitur manajemen data dalam MVP.

## 12. Definition of Product Acceptance

Kebutuhan produk dinyatakan terpenuhi ketika:

- [ ] Pengguna dapat melihat daftar dan detail produk.
- [ ] Pengguna dapat menemukan produk berdasarkan kata kunci dalam nama atau deskripsi.
- [ ] Pengguna dapat memfilter berdasarkan kategori dan rentang harga.
- [ ] Pengguna dapat mengurutkan berdasarkan nama dan harga pada kedua arah yang ditentukan.
- [ ] Pencarian, filter kategori, filter harga, dan pengurutan dapat dikombinasikan dengan hasil yang benar.
- [ ] Hasil kosong serta rentang harga yang tidak valid ditangani dengan feedback yang jelas.
- [ ] Perilaku katalog telah diverifikasi terhadap kriteria penerimaan, bukan hanya diasumsikan benar karena implementasi berhasil dibuat.

## 13. Optional Extensions

Extension hanya dikerjakan setelah seluruh kebutuhan MVP dipenuhi.

### Extension A — Product Management

Memungkinkan pihak yang berwenang menambah, mengubah, dan menghapus informasi produk. Extension ini memerlukan kebutuhan dan aturan bisnis tersendiri sebelum implementasi.

### Extension B — Frontend Integration

Menghubungkan katalog ke antarmuka sederhana agar fitur browse, search, filter, sort, dan detail dapat dicoba melalui UI. Frontend tetap opsional dan tidak boleh menggeser fokus utama kelas dari backend.

### Extension C — Persistent Product Data

Menyimpan data produk secara persisten, sehingga data tidak bergantung pada dataset demo selama proses berjalan. Pilihan teknologi penyimpanan ditentukan dalam desain teknis.

## 14. Assumptions

- Exercise hanya mencakup domain Product, bukan seluruh alur e-commerce.
- Informasi produk sudah tersedia sebagai data demo; pengelolaan produk bukan bagian dari MVP.
- Katalog digunakan oleh aplikasi client atau tool pengujian; frontend visual bukan prasyarat penerimaan.
- Spesifikasi teknis akan menerjemahkan kebutuhan produk ini menjadi kontrak API, aturan validasi input, desain komponen, dan urutan implementasi.

## 15. Relationship to Development Specifications

PRD ini menjadi acuan kebutuhan produk. Dokumen development berikut menerjemahkan kebutuhan tersebut ke keputusan yang lebih operasional:

- `requirements.md` — memecah kebutuhan produk menjadi requirement dan acceptance criteria yang dapat digunakan selama implementasi dan verifikasi.
- `design.md` — menentukan kontrak API, bentuk request/response, struktur aplikasi, strategi penyimpanan data, dan keputusan teknis lain yang diperlukan.
- `task.md` — membagi pekerjaan menjadi task kecil yang bisa diimplementasikan serta diverifikasi secara bertahap.

Untuk kelas yang berfokus pada tahap development, dokumen tersebut dapat disediakan sebagai context awal. Fokus student adalah memahami dokumen yang relevan, memilih context yang sesuai dengan task, menggunakan AI secara terarah, dan memverifikasi output-nya.
