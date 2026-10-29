// Repository MySQL untuk Product Catalog Service.
// Mengimplementasikan kontrak repository yang sama dengan inMemoryProductRepository
// sehingga service layer tidak perlu diubah.
//
// Kontrak: list(), findById(id), insert(product), replace(id, product), remove(id)
// Semua metode mengembalikan Promise.

const pool = require("../db/pool");

// Helper: ubah baris hasil query menjadi bentuk Product API.
// - price: DECIMAL datang sebagai string dari mysql2 → Number()
// - id: BIGINT, supportBigNumbers=true membuatnya number, tapi Number() untuk jaminan
// - colorOrSize: GROUP_CONCAT menghasilkan string "A,B,C" → split → array (atau [] jika NULL)
function rowToProduct(row) {
  return {
    id: Number(row.id),
    name: row.name,
    description: row.description,
    category: row.category,
    price: Number(row.price),
    image: row.image,
    variants: {
      colorOrSize: row.colorOrSize ? row.colorOrSize.split(",") : [],
      quantity: row.quantity,
    },
  };
}

// SQL dasar yang digunakan list() dan findById().
const SELECT_SQL = `
  SELECT p.id, p.name, p.description, p.category, p.price, p.image, p.quantity,
         GROUP_CONCAT(v.option_value ORDER BY v.option_value SEPARATOR ',') AS colorOrSize
  FROM products p
  LEFT JOIN product_variant_options v ON v.product_id = p.id
  GROUP BY p.id, p.name, p.description, p.category, p.price, p.image, p.quantity
`;

function createMysqlProductRepository() {
  // Mengembalikan semua produk, diurutkan berdasarkan id.
  async function list() {
    const [rows] = await pool.execute(`${SELECT_SQL} ORDER BY p.id`);
    return rows.map(rowToProduct);
  }

  // Mengembalikan satu produk berdasarkan id, atau null jika tidak ada.
  async function findById(id) {
    const [rows] = await pool.execute(`${SELECT_SQL} HAVING p.id = ?`, [id]);
    if (rows.length === 0) return null;
    return rowToProduct(rows[0]);
  }

  // Menyisipkan produk baru dalam satu transaksi.
  // ID baru ditentukan oleh AUTO_INCREMENT MySQL, bukan dari kalkulasi MAX(id).
  async function insert(product) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.execute(
        `INSERT INTO products (name, description, category, price, image, quantity)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          product.name,
          product.description,
          product.category,
          product.price,
          product.image,
          product.variants.quantity,
        ]
      );
      const newId = Number(result.insertId);

      if (product.variants.colorOrSize.length > 0) {
        const variantValues = product.variants.colorOrSize.map((v) => [newId, v]);
        await conn.query(
          `INSERT INTO product_variant_options (product_id, option_value) VALUES ?`,
          [variantValues]
        );
      }

      await conn.commit();
      return findById(newId);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  // Memperbarui produk yang sudah ada dalam satu transaksi.
  // Hapus semua variant lama dan sisipkan ulang dari data baru.
  async function replace(id, product) {
    const existing = await findById(id);
    if (!existing) return null;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.execute(
        `UPDATE products
         SET name = ?, description = ?, category = ?, price = ?, image = ?, quantity = ?
         WHERE id = ?`,
        [
          product.name,
          product.description,
          product.category,
          product.price,
          product.image,
          product.variants.quantity,
          id,
        ]
      );

      // Hapus semua variant lama dan sisipkan ulang.
      await conn.execute(
        `DELETE FROM product_variant_options WHERE product_id = ?`,
        [id]
      );

      if (product.variants.colorOrSize.length > 0) {
        const variantValues = product.variants.colorOrSize.map((v) => [id, v]);
        await conn.query(
          `INSERT INTO product_variant_options (product_id, option_value) VALUES ?`,
          [variantValues]
        );
      }

      await conn.commit();
      return findById(id);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  // Menghapus produk berdasarkan id.
  // product_variant_options dihapus otomatis oleh ON DELETE CASCADE.
  async function remove(id) {
    const existing = await findById(id);
    if (!existing) return null;

    await pool.execute(`DELETE FROM products WHERE id = ?`, [id]);
    return existing;
  }

  return { list, findById, insert, replace, remove };
}

module.exports = { createMysqlProductRepository };
