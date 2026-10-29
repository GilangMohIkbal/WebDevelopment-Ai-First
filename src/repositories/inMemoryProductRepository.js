// Adapter penyimpanan: implementasi in-memory. Dapat diganti tanpa mengubah service.
// Setiap instance menyimpan salinan seed agar test/server baru tidak berbagi state.
//
// insert() membuat id secara otomatis (max id yang ada + 1, atau 1 jika kosong),
// sama seperti MySQL AUTO_INCREMENT, sehingga service tidak perlu menghitung id.
function createInMemoryProductRepository(initialProducts) {
  const data = structuredClone(initialProducts);

  return {
    list() {
      return structuredClone(data);
    },
    findById(id) {
      const product = data.find((item) => item.id === id);
      return product ? structuredClone(product) : null;
    },
    insert(product) {
      // Hasilkan id baru: max(id yang ada) + 1, atau 1 jika dataset kosong.
      const nextId = data.length ? Math.max(...data.map((p) => p.id)) + 1 : 1;
      const newProduct = structuredClone({ ...product, id: nextId });
      data.push(newProduct);
      return structuredClone(newProduct);
    },
    replace(id, product) {
      const index = data.findIndex((item) => item.id === id);
      if (index === -1) return null;
      data[index] = structuredClone(product);
      return structuredClone(data[index]);
    },
    remove(id) {
      const index = data.findIndex((item) => item.id === id);
      if (index === -1) return null;
      return structuredClone(data.splice(index, 1)[0]);
    },
  };
}

module.exports = { createInMemoryProductRepository };
