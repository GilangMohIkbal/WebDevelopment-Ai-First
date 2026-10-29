// Use cases: tidak mengimpor Express, req, res, maupun modul penyimpanan konkret.
const { validateProduct } = require("../utils/validateProduct");
const { AppError } = require("../domain/errors");

const VALID_SORTS = ["name_asc", "name_desc", "price_asc", "price_desc"];
const SCALAR_FIELDS = ["name", "description", "category", "price", "image"];

function createProductService(repository) {
  function getById(rawId) {
    const product = repository.findById(Number(rawId));
    if (!product) {
      throw new AppError("NOT_FOUND", `Product dengan id ${rawId} tidak ditemukan`);
    }
    return product;
  }

  function list(query = {}) {
    const { q, category, minPrice, maxPrice, sort } = query;
    for (const [key, value] of Object.entries({ q, category, minPrice, maxPrice, sort })) {
      if (value !== undefined && typeof value !== "string") {
        throw new AppError("BAD_REQUEST", `Parameter ${key} harus berupa satu nilai teks`);
      }
    }

    let min;
    let max;
    if (minPrice !== undefined && minPrice !== "") {
      min = Number(minPrice);
      if (!Number.isFinite(min)) {
        throw new AppError("BAD_REQUEST", `minPrice harus berupa angka yang valid (diterima: '${minPrice}')`);
      }
    }
    if (maxPrice !== undefined && maxPrice !== "") {
      max = Number(maxPrice);
      if (!Number.isFinite(max)) {
        throw new AppError("BAD_REQUEST", `maxPrice harus berupa angka yang valid (diterima: '${maxPrice}')`);
      }
    }
    if (min !== undefined && max !== undefined && min > max) {
      throw new AppError("BAD_REQUEST", `minPrice (${min}) tidak boleh lebih besar dari maxPrice (${max})`);
    }
    if (sort !== undefined && !VALID_SORTS.includes(sort)) {
      throw new AppError("BAD_REQUEST", `Nilai sort tidak valid: '${sort}'. Gunakan salah satu: ${VALID_SORTS.join(", ")}`);
    }

    let result = repository.list();
    if (q && q.trim() !== "") {
      const keyword = q.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(keyword) || p.description.toLowerCase().includes(keyword));
    }
    if (category && category.trim() !== "") {
      const cat = category.toLowerCase();
      result = result.filter((p) => p.category.toLowerCase() === cat);
    }
    if (min !== undefined) result = result.filter((p) => p.price >= min);
    if (max !== undefined) result = result.filter((p) => p.price <= max);

    switch (sort) {
      case "name_asc":
        result.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
        break;
      case "name_desc":
        result.sort((a, b) => b.name.toLowerCase().localeCompare(a.name.toLowerCase()));
        break;
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
    }

    const response = { data: result, total: result.length };
    if (!result.length) {
      response.message = "Tidak ada produk yang cocok dengan kriteria pencarian dan filter yang diberikan";
    }
    return response;
  }

  function create(body) {
    const errors = validateProduct(body);
    if (errors.length) throw new AppError("VALIDATION", "Data produk tidak valid", errors);

    const existing = repository.list();
    const nextId = existing.length ? Math.max(...existing.map((p) => p.id)) + 1 : 1;
    const product = {
      id: nextId,
      name: body.name,
      description: body.description,
      category: body.category,
      price: body.price,
      image: body.image,
      variants: {
        colorOrSize: [...body.variants.colorOrSize],
        quantity: body.variants.quantity,
      },
    };
    return repository.insert(product);
  }

  // Legacy PUT adalah partial-update; PATCH memiliki kontrak partial-update yang sama.
  // Keduanya berbagi implementasi agar kompatibilitas Postman lama terjaga.
  function update(rawId, body) {
    const existing = getById(rawId);
    const errors = validateProduct(body, { partial: true });
    if (errors.length) throw new AppError("VALIDATION", "Data produk tidak valid", errors);

    const updated = { ...existing };
    for (const field of SCALAR_FIELDS) {
      if (body[field] !== undefined) updated[field] = body[field];
    }
    if (body.variants !== undefined) {
      updated.variants = {
        colorOrSize: body.variants.colorOrSize ?? existing.variants.colorOrSize,
        quantity: body.variants.quantity ?? existing.variants.quantity,
      };
    }
    updated.id = existing.id;
    return repository.replace(existing.id, updated);
  }

  function remove(rawId) {
    const existing = getById(rawId);
    const deleted = repository.remove(existing.id);
    return {
      message: `Product dengan id ${existing.id} berhasil dihapus`,
      data: deleted,
    };
  }

  return { list, getById, create, update, remove };
}

module.exports = { createProductService };
