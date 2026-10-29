// HTTP routing saja. Tidak membaca/menulis dataset atau melakukan bisnis logic.
const express = require("express");

function createProductsRouter(controller) {
  const router = express.Router();
  router.get("/", controller.list);
  router.get("/:id", controller.detail);
  router.post("/", controller.create);
  router.put("/:id", controller.put);
  router.patch("/:id", controller.patch);
  router.delete("/:id", controller.remove);
  return router;
}

module.exports = { createProductsRouter };
