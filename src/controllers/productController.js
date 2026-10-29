// HTTP adapter: konversi request/response, tanpa menyentuh dataset.
const { AppError } = require("../domain/errors");

function createProductController(service) {
  function respond(res, operation, status = 200) {
    try {
      return res.status(status).json(operation());
    } catch (error) {
      if (!(error instanceof AppError)) throw error;
      const statusCode = error.code === "NOT_FOUND" ? 404 : 400;
      const response = { message: error.message };
      if (error.errors) response.errors = error.errors;
      return res.status(statusCode).json(response);
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
