// Entry point aplikasi Product Catalog Service.
// Menggunakan Express tanpa database; data produk disimpan in-memory.

const express = require("express");
const productsRouter = require("./routes/products");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk parsing JSON body (dipersiapkan untuk endpoint berikutnya).
app.use(express.json());

// Route utama untuk modul produk.
app.use("/api/products", productsRouter);

app.listen(PORT, () => {
  console.log(`Product Catalog Service berjalan di http://localhost:${PORT}`);
});
