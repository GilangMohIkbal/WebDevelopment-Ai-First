// Composition root: susun dependency aplikasi, tanpa logika bisnis.
// - NODE_ENV === 'test'  → in-memory repository (tidak perlu database)
// - NODE_ENV !== 'test'  → MySQL repository (pool dikonfirmasi sebelum server berjalan)

require("dotenv/config");

const express = require("express");
const seedProducts = require("./data/products");
const { createInMemoryProductRepository } = require("./repositories/inMemoryProductRepository");
const { createProductService } = require("./services/productService");
const { createProductController } = require("./controllers/productController");
const { createProductsRouter } = require("./routes/products");

function createApp({ initialProducts = seedProducts } = {}) {
  const app = express();

  // Selalu gunakan in-memory ketika createApp dipanggil langsung (unit test).
  const repository = createInMemoryProductRepository(initialProducts);
  const service = createProductService(repository);
  const controller = createProductController(service);

  app.use(express.json());
  app.use("/api/products", createProductsRouter(controller));

  // Body JSON tidak valid: jangan kirim stack trace kepada klien.
  app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
      return res.status(400).json({ message: "Format JSON tidak valid" });
    }
    return next(error);
  });

  return app;
}

// Entry point runtime (NODE_ENV !== 'test').
// Menggunakan MySQL repository; verifikasi koneksi sebelum menerima request.
async function startServer() {
  const pool = require("./db/pool");
  const { createMysqlProductRepository } = require("./repositories/mysqlProductRepository");

  // Verifikasi koneksi database sebelum menerima request.
  let conn;
  try {
    conn = await pool.getConnection();
  } catch (err) {
    // Log pesan aman — jangan bocorkan password, host, atau detail stack.
    console.error("[Startup] Koneksi database gagal. Periksa konfigurasi .env dan pastikan MySQL berjalan.");
    console.error("[Startup] Detail:", err.code || err.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
  }

  const repository = createMysqlProductRepository();
  const service = createProductService(repository);
  const controller = createProductController(service);

  const app = express();
  app.use(express.json());
  app.use("/api/products", createProductsRouter(controller));

  app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
      return res.status(400).json({ message: "Format JSON tidak valid" });
    }
    return next(error);
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Product Catalog Service berjalan di http://localhost:${PORT} (MySQL)`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { createApp };
