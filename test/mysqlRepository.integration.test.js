// Pengujian integrasi MySQL repository.
// Memerlukan .env yang valid dan database product_catalog yang berjalan.
// Jalankan dengan: npm run test:integration
//
// PENTING: Pengujian ini TIDAK menghapus sembilan produk seed.
// Hanya data yang dibuat oleh pengujian ini yang di-cleanup setelahnya.

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");

// Muat dotenv sebelum pool diinisialisasi.
require("dotenv/config");

const { createMysqlProductRepository } = require("../src/repositories/mysqlProductRepository");
const pool = require("../src/db/pool");

const repo = createMysqlProductRepository();

// ID produk yang dibuat selama pengujian — untuk cleanup setelah selesai.
const createdIds = [];

const testProduct = () => ({
  name: "Integration Test Product",
  description: "Produk sementara yang dibuat oleh integration test.",
  category: "TestCategory",
  price: 99999,
  image: "https://picsum.photos/seed/integration-test/400/400",
  variants: {
    colorOrSize: ["TestRed", "TestBlue"],
    quantity: 7,
  },
});

after(async () => {
  // Hapus hanya produk yang dibuat oleh pengujian ini.
  for (const id of createdIds) {
    try {
      await repo.remove(id);
    } catch {
      // Abaikan jika sudah terhapus sebelumnya.
    }
  }
  await pool.end();
});

test("list() mengembalikan setidaknya 9 produk seed awal", async () => {
  const products = await repo.list();
  assert.ok(products.length >= 9, `Expected >= 9 products, got ${products.length}`);
});

test("list() mengembalikan produk dengan bentuk yang benar", async () => {
  const products = await repo.list();
  const first = products[0];
  assert.equal(typeof first.id, "number");
  assert.equal(typeof first.name, "string");
  assert.equal(typeof first.price, "number");
  assert.ok(Array.isArray(first.variants.colorOrSize));
  assert.equal(typeof first.variants.quantity, "number");
});

test("findById() mengembalikan produk yang ada", async () => {
  const product = await repo.findById(1);
  assert.ok(product !== null);
  assert.equal(product.id, 1);
  assert.equal(typeof product.price, "number");
  assert.ok(product.variants.colorOrSize.length > 0);
});

test("findById() mengembalikan null untuk id yang tidak ada", async () => {
  const product = await repo.findById(99999);
  assert.equal(product, null);
});

test("insert() membuat produk baru dengan id dari AUTO_INCREMENT", async () => {
  const created = await repo.insert(testProduct());
  assert.ok(created.id > 0, "ID harus lebih dari 0");
  assert.equal(typeof created.id, "number");
  assert.equal(created.name, "Integration Test Product");
  assert.equal(created.price, 99999);
  assert.deepEqual(created.variants.colorOrSize.sort(), ["TestBlue", "TestRed"]);
  assert.equal(created.variants.quantity, 7);
  createdIds.push(created.id);
});

test("findById() menemukan produk yang baru di-insert", async () => {
  assert.ok(createdIds.length > 0, "Jalankan tes insert terlebih dahulu");
  const id = createdIds[createdIds.length - 1];
  const found = await repo.findById(id);
  assert.ok(found !== null);
  assert.equal(found.id, id);
  assert.equal(found.name, "Integration Test Product");
});

test("replace() memperbarui produk yang ada", async () => {
  assert.ok(createdIds.length > 0, "Jalankan tes insert terlebih dahulu");
  const id = createdIds[createdIds.length - 1];
  const updatedData = {
    id,
    name: "Updated Integration Product",
    description: "Deskripsi diperbarui",
    category: "TestCategory",
    price: 55555,
    image: "https://picsum.photos/seed/integration-updated/400/400",
    variants: {
      colorOrSize: ["UpdatedGreen"],
      quantity: 3,
    },
  };
  const result = await repo.replace(id, updatedData);
  assert.ok(result !== null);
  assert.equal(result.name, "Updated Integration Product");
  assert.equal(result.price, 55555);
  assert.deepEqual(result.variants.colorOrSize, ["UpdatedGreen"]);
  assert.equal(result.variants.quantity, 3);
});

test("replace() mengembalikan null untuk id yang tidak ada", async () => {
  const result = await repo.replace(99999, testProduct());
  assert.equal(result, null);
});

test("remove() menghapus produk yang ada dan mengembalikan snapshot-nya", async () => {
  // Buat produk baru khusus untuk tes delete ini.
  const toDelete = await repo.insert({
    ...testProduct(),
    name: "Product To Delete",
  });
  createdIds.push(toDelete.id);

  const deleted = await repo.remove(toDelete.id);
  assert.ok(deleted !== null);
  assert.equal(deleted.id, toDelete.id);

  // Konfirmasi sudah terhapus.
  const notFound = await repo.findById(toDelete.id);
  assert.equal(notFound, null);

  // Hapus dari daftar cleanup karena sudah terhapus.
  const idx = createdIds.indexOf(toDelete.id);
  if (idx !== -1) createdIds.splice(idx, 1);
});

test("remove() mengembalikan null untuk id yang tidak ada", async () => {
  const result = await repo.remove(99999);
  assert.equal(result, null);
});

test("9 produk seed asli tetap ada setelah semua operasi", async () => {
  const products = await repo.list();
  const seedIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (const id of seedIds) {
    const found = products.find((p) => p.id === id);
    assert.ok(found, `Produk seed id=${id} harus tetap ada`);
  }
});
