// Helper validasi field produk.
// Dipakai oleh POST (mode full: semua field wajib), PUT dan PATCH (mode partial:
// hanya memvalidasi field yang dikirim).
//
// Mengembalikan array pesan error (kosong berarti valid).

// Memeriksa bentuk URL; tidak memeriksa apakah server gambar dapat diakses.
function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function validateProduct(data, { partial = false } = {}) {
  const errors = [];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return ["Body request harus berupa objek JSON"];
  }

  // Helper: validasi field string non-kosong.
  const requireString = (value, field) => {
    if (value !== undefined) {
      if (typeof value !== "string" || value.trim() === "") {
        errors.push(`${field} harus berupa string yang tidak kosong`);
      }
    } else if (!partial) {
      errors.push(`${field} wajib diisi`);
    }
  };

  requireString(data.name, "name");
  requireString(data.description, "description");
  requireString(data.category, "category");
  requireString(data.image, "image");

  // Foto harus berupa URL HTTP/HTTPS, baik saat create maupun update.
  if (
    typeof data.image === "string" &&
    data.image.trim() !== "" &&
    !isValidHttpUrl(data.image)
  ) {
    errors.push("image harus berupa URL HTTP/HTTPS yang valid");
  }

  // price: angka >= 0.
  if (data.price !== undefined) {
    if (typeof data.price !== "number" || !Number.isFinite(data.price) || data.price < 0) {
      errors.push("price harus berupa angka (number) >= 0");
    }
  } else if (!partial) {
    errors.push("price wajib diisi");
  }

  // variants: object dengan colorOrSize (array string) dan quantity (angka >= 0).
  if (data.variants !== undefined) {
    if (
      typeof data.variants !== "object" ||
      data.variants === null ||
      Array.isArray(data.variants)
    ) {
      errors.push("variants harus berupa object");
    } else {
      // colorOrSize: divalidasi hanya jika dikirim; di mode full wajib ada.
      if (data.variants.colorOrSize !== undefined) {
        const colorOrSize = data.variants.colorOrSize;
        if (
          !Array.isArray(colorOrSize) ||
          colorOrSize.length === 0 ||
          !colorOrSize.every((v) => typeof v === "string" && v.trim() !== "")
        ) {
          errors.push(
            "variants.colorOrSize harus berupa array string yang tidak kosong"
          );
        }
      } else if (!partial) {
        errors.push("variants.colorOrSize wajib diisi");
      }

      // quantity: divalidasi hanya jika dikirim; di mode full wajib ada.
      if (data.variants.quantity !== undefined) {
        if (
          !Number.isInteger(data.variants.quantity) ||
          data.variants.quantity < 0
        ) {
          errors.push("variants.quantity harus berupa bilangan bulat (integer) >= 0");
        }
      } else if (!partial) {
        errors.push("variants.quantity wajib diisi");
      }
    }
  } else if (!partial) {
    errors.push("variants wajib diisi");
  }

  return errors;
}

module.exports = { validateProduct };
