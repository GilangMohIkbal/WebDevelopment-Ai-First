// HTTP adapter: konversi request/response, tanpa menyentuh dataset.
// respond() adalah async agar dapat menggunakan await pada service calls (MySQL repository).
// AppError → 400/404; unexpected error → 500 tanpa detail internal.
const { AppError } = require("../domain/errors");

function createProductController(service) {
  async function respond(res, operation, status = 200) {
    try {
      const result = await operation();
      return res.status(status).json(result);
    } catch (error) {
      if (error instanceof AppError) {
        const statusCode = error.code === "NOT_FOUND" ? 404 : 400;
        const response = { message: error.message };
        if (error.errors) response.errors = error.errors;
        return res.status(statusCode).json(response);
      }
      // Kesalahan tak terduga (mis. koneksi database) — jangan bocorkan detail.
      console.error("[ProductController] Unexpected error:", error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  return {
    list(req, res) { return respond(res, () => service.list(req.query)); },
    detail(req, res) { return respond(res, () => service.getById(req.params.id)); },
    create(req, res) { return respond(res, () => service.create(req.body), 201); },
    put(req, res) { return respond(res, () => service.update(req.params.id, req.body)); },
    patch(req, res) { return respond(res, () => service.update(req.params.id, req.body)); },
    remove(req, res) { return respond(res, () => service.remove(req.params.id)); },
  };
}

module.exports = { createProductController };
