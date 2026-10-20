// Router untuk endpoint produk (CRUD).
// Scope:
//   GET    /api/products       -> daftar + search + filter + sort (PR-001..PR-005, PR-007)
//   GET    /api/products/:id   -> detail produk (PR-006)
//   POST   /api/products       -> tambah produk baru
//   PUT    /api/products/:id   -> perbarui produk (partial update)
//   DELETE /api/products/:id   -> hapus produk

const express = require("express");
const products = require("../data/products");
const { validateProduct } = require("../utils/validateProduct");

const router = express.Router();

// Nilai sort yang valid.
const VALID_SORTS = ["name_asc", "name_desc", "price_asc", "price_desc"];

// GET /api/products
// Menampilkan daftar produk dengan dukungan pencarian, filter, dan sorting.
//
// Query parameters (semua opsional, bisa dikombinasikan):
// - q        : kata kunci pencarian. Dicocokkan ke field `name` dan `description`.
//              Case-insensitive dan mendukung kecocokan sebagian (partial match).
// - category : filter berdasarkan kategori (case-insensitive, pencocokan persis).
//              Contoh kategori: Fashion, Footwear, Electronics, Accessories.
// - minPrice : batas harga minimum dalam Rupiah (IDR), inklusif.
// - maxPrice : batas harga maksimum dalam Rupiah (IDR), inklusif.
// - sort     : pengurutan hasil. Nilai yang diterima:
//                name_asc    -> nama A-Z
//                name_desc   -> nama Z-A
//                price_asc   -> harga termurah -> termahal
//                price_desc  -> harga termahal -> termurah
//
// Response sukses (200):
//   { data: [...], total: <number> }
//   Jika hasil kosong, ditambahkan field `message` supaya jelas.
//
// Response error (400):
//   { message: "..." } untuk input harga atau sort yang tidak valid.
router.get("/", (req, res) => {
  const { q, category, minPrice, maxPrice, sort } = req.query;

  // Semua query parameter harus berupa satu string, bukan array/objek.
  // Contoh: ?q=sepatu&q=kaos atau ?q[x]=y tidak boleh membuat server error.
  for (const [key, value] of Object.entries({ q, category, minPrice, maxPrice, sort })) {
    if (value !== undefined && typeof value !== "string") {
      return res.status(400).json({
        message: `Parameter ${key} harus berupa satu nilai teks`,
      });
    }
  }

  // --- Validasi input harga ---
  let min;
  let max;

  if (minPrice !== undefined && minPrice !== "") {
    min = Number(minPrice);
    if (!Number.isFinite(min)) {
      return res.status(400).json({
        message: `minPrice harus berupa angka yang valid (diterima: '${minPrice}')`,
      });
    }
  }

  if (maxPrice !== undefined && maxPrice !== "") {
    max = Number(maxPrice);
    if (!Number.isFinite(max)) {
      return res.status(400).json({
        message: `maxPrice harus berupa angka yang valid (diterima: '${maxPrice}')`,
      });
    }
  }

  // Jika kedua batas diisi, min tidak boleh lebih besar dari max (PR-004).
  if (min !== undefined && max !== undefined && min > max) {
    return res.status(400).json({
      message: `minPrice (${min}) tidak boleh lebih besar dari maxPrice (${max})`,
    });
  }

  // --- Validasi sort ---
  if (sort !== undefined && !VALID_SORTS.includes(sort)) {
    return res.status(400).json({
      message: `Nilai sort tidak valid: '${sort}'. Gunakan salah satu: ${VALID_SORTS.join(", ")}`,
    });
  }

  // --- Filtering (search -> category -> price), sebuah produk harus memenuhi semua ---
  let result = [...products];

  // Pencarian kata kunci pada name + description (case-insensitive, partial match).
  if (q && q.trim() !== "") {
    const keyword = q.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(keyword) ||
        p.description.toLowerCase().includes(keyword)
    );
  }

  // Filter kategori (case-insensitive, pencocokan persis nama kategori).
  if (category && category.trim() !== "") {
    const cat = category.toLowerCase();
    result = result.filter((p) => p.category.toLowerCase() === cat);
  }

  // Filter harga (inklusif: harga sama dengan batas tetap masuk hasil).
  if (min !== undefined) {
    result = result.filter((p) => p.price >= min);
  }
  if (max !== undefined) {
    result = result.filter((p) => p.price <= max);
  }

  // --- Sorting (hanya mengubah urutan, bukan anggota hasil) ---
  if (sort) {
    switch (sort) {
      case "name_asc":
        result.sort((a, b) =>
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );
        break;
      case "name_desc":
        result.sort((a, b) =>
          b.name.toLowerCase().localeCompare(a.name.toLowerCase())
        );
        break;
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
    }
  }

  // --- Response ---
  const response = {
    data: result,
    total: result.length,
  };

  // Hasil kosong dibuat jelas dengan menambahkan pesan.
  if (result.length === 0) {
    response.message =
      "Tidak ada produk yang cocok dengan kriteria pencarian dan filter yang diberikan";
  }

  return res.status(200).json(response);
});

// GET /api/products/:id
// Mengembalikan detail satu produk berdasarkan id.
// Jika produk tidak ditemukan, kembalikan HTTP 404 dengan pesan yang jelas.
router.get("/:id", (req, res) => {
  const productId = Number(req.params.id);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).json({
      message: `Product dengan id ${req.params.id} tidak ditemukan`,
    });
  }

  return res.status(200).json(product);
});

// POST /api/products
// Menambahkan produk baru. Id dibuat otomatis (max id + 1).
//
// Body (JSON): { name, description, category, price, image, variants: { colorOrSize, quantity } }
// Response sukses: 201 dengan produk yang baru dibuat.
// Response error: 400 dengan daftar error jika data tidak valid.
router.post("/", (req, res) => {
  const errors = validateProduct(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ message: "Data produk tidak valid", errors });
  }

  const newId =
    products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

  const newProduct = {
    id: newId,
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    price: req.body.price,
    image: req.body.image,
    variants: {
      colorOrSize: req.body.variants.colorOrSize,
      quantity: req.body.variants.quantity,
    },
  };

  products.push(newProduct);
  return res.status(201).json(newProduct);
});

// PUT /api/products/:id
// Memperbarui produk yang sudah ada (partial update: hanya field yang dikirim
// yang diperbarui; field lain tetap). Id tidak boleh diubah lewat body.
//
// Body (JSON): sebagian atau seluruh field produk.
// Response sukses: 200 dengan produk yang sudah diperbarui.
// Response error: 404 jika produk tidak ditemukan, 400 jika data tidak valid.
router.put("/:id", (req, res) => {
  const productId = Number(req.params.id);
  const index = products.findIndex((p) => p.id === productId);

  if (index === -1) {
    return res.status(404).json({
      message: `Product dengan id ${req.params.id} tidak ditemukan`,
    });
  }

  const errors = validateProduct(req.body, { partial: true });
  if (errors.length > 0) {
    return res.status(400).json({ message: "Data produk tidak valid", errors });
  }

  const existing = products[index];
  const updated = { ...existing };

  // Perbarui field skalar jika dikirim.
  for (const field of ["name", "description", "category", "price", "image"]) {
    if (req.body[field] !== undefined) {
      updated[field] = req.body[field];
    }
  }

  // Merge variants sebagian: field yang tidak dikirim tetap memakai nilai lama.
  if (req.body.variants !== undefined) {
    updated.variants = {
      colorOrSize:
        req.body.variants.colorOrSize ?? existing.variants.colorOrSize,
      quantity: req.body.variants.quantity ?? existing.variants.quantity,
    };
  }

  // Id tidak boleh diubah lewat body.
  updated.id = existing.id;

  products[index] = updated;
  return res.status(200).json(updated);
});

// DELETE /api/products/:id
// Menghapus produk berdasarkan id.
// Response sukses: 200 dengan pesan dan data produk yang dihapus.
// Response error: 404 jika produk tidak ditemukan.
router.delete("/:id", (req, res) => {
  const productId = Number(req.params.id);
  const index = products.findIndex((p) => p.id === productId);

  if (index === -1) {
    return res.status(404).json({
      message: `Product dengan id ${req.params.id} tidak ditemukan`,
    });
  }

  const deleted = products.splice(index, 1)[0];
  return res.status(200).json({
    message: `Product dengan id ${productId} berhasil dihapus`,
    data: deleted,
  });
});

module.exports = router;
