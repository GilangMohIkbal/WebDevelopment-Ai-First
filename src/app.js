// Composition root: susun dependency aplikasi, tanpa logika bisnis.
const express = require("express");
const seedProducts = require("./data/products");
const { createInMemoryProductRepository } = require("./repositories/inMemoryProductRepository");
const { createProductService } = require("./services/productService");
const { createProductController } = require("./controllers/productController");
const { createProductsRouter } = require("./routes/products");

function createApp({ initialProducts = seedProducts } = {}) {
  const app = express();
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

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  createApp().listen(PORT, () => {
    console.log(`Product Catalog Service berjalan di http://localhost:${PORT}`);
  });
}

module.exports = { createApp };
