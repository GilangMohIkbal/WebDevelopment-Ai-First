// Adapter penyimpanan: implementasi in-memory. Dapat diganti tanpa mengubah service.
// Setiap instance menyimpan salinan seed agar test/server baru tidak berbagi state.
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
      data.push(structuredClone(product));
      return structuredClone(product);
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
