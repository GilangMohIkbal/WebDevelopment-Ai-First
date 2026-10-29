// Error aplikasi tidak bergantung kepada framework HTTP / Express.
class AppError extends Error {
  constructor(code, message, errors) {
    super(message);
    this.name = "AppError";
    this.code = code;
    if (errors) this.errors = errors;
  }
}

module.exports = { AppError };
