-- Product Catalog CRUD - Data awal sesuai src/data/products.js
-- Database: product_catalog
-- Prasyarat: tabel products dan product_variant_options sudah dibuat.
-- Jalankan sekali pada kedua tabel yang masih kosong.
-- Jika muncul error Duplicate entry, jangan menjalankannya ulang tanpa memeriksa data.

USE product_catalog;
START TRANSACTION;

-- Memasukkan sembilan produk (quantity adalah stok total per produk).
INSERT INTO products
    (id, name, description, category, price, image, quantity)
VALUES
    (1, 'Kaos Polos Cotton', 'Kaos polos berbahan cotton combed 24s, nyaman dipakai sehari-hari.', 'Fashion', 75000, 'https://picsum.photos/seed/kaos-polos-cotton/400/400', 25),
    (2, 'Kemeja Flanel', 'Kemeja flanel lengan panjang dengan potongan slim fit, cocok untuk acara semi-formal.', 'Fashion', 120000, 'https://picsum.photos/seed/kemeja-flanel/400/400', 15),
    (3, 'Hoodie Oversize', 'Hoodie oversize berbahan fleece, hangat dan stylish untuk cuaca dingin.', 'Fashion', 180000, 'https://picsum.photos/seed/hoodie-oversize/400/400', 10),
    (4, 'Sepatu Sneakers', 'Sepatu sneakers kasual dengan sol karet empuk, cocok untuk aktivitas sehari-hari.', 'Footwear', 350000, 'https://picsum.photos/seed/sepatu-sneakers/400/400', 8),
    (5, 'Sepatu Running', 'Sepatu running ringan dengan teknologi cushioning, dirancang untuk lari jarak jauh.', 'Footwear', 450000, 'https://picsum.photos/seed/sepatu-running/400/400', 6),
    (6, 'Headphone Wireless', 'Headphone wireless dengan noise cancelling dan baterai tahan hingga 20 jam.', 'Electronics', 550000, 'https://picsum.photos/seed/headphone-wireless/400/400', 12),
    (7, 'Smartwatch', 'Smartwatch dengan layar AMOLED, monitor detak jantung, dan tahan air.', 'Electronics', 850000, 'https://picsum.photos/seed/smartwatch/400/400', 5),
    (8, 'Tote Bag Canvas', 'Tote bag berbahan canvas tebal, kapasitas besar untuk kebutuhan harian.', 'Accessories', 60000, 'https://picsum.photos/seed/tote-bag-canvas/400/400', 30),
    (9, 'Kacamata Hitam', 'Kacamata hitam dengan lensa polarized dan UV protection, gaya klasik.', 'Accessories', 95000, 'https://picsum.photos/seed/kacamata-hitam/400/400', 18);

-- Pilihan warna atau ukuran terpisah, ditautkan melalui product_id.
INSERT INTO product_variant_options (product_id, option_value)
VALUES
    (1, 'S'),
    (1, 'M'),
    (1, 'L'),
    (1, 'XL'),
    (2, 'M'),
    (2, 'L'),
    (2, 'XL'),
    (3, 'Black'),
    (3, 'Grey'),
    (3, 'Navy'),
    (4, '39'),
    (4, '40'),
    (4, '41'),
    (4, '42'),
    (4, '43'),
    (5, '40'),
    (5, '41'),
    (5, '42'),
    (5, '43'),
    (5, '44'),
    (6, 'Black'),
    (6, 'White'),
    (6, 'Blue'),
    (7, 'Black'),
    (7, 'Silver'),
    (8, 'Natural'),
    (8, 'Black'),
    (8, 'Olive'),
    (9, 'Black'),
    (9, 'Tortoise');

COMMIT;

-- Verifikasi jumlah data yang masuk.
SELECT COUNT(*) AS total_products FROM products;
SELECT COUNT(*) AS total_variant_options FROM product_variant_options;
SELECT p.id, p.name, p.category, p.price, p.quantity,
       COUNT(v.id) AS jumlah_pilihan_varian
FROM products p
LEFT JOIN product_variant_options v ON v.product_id = p.id
GROUP BY p.id, p.name, p.category, p.price, p.quantity
ORDER BY p.id;
