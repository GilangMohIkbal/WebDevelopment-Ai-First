-- Schema definitions untuk Product Catalog Service.
-- Jalankan sekali pada database baru; IF NOT EXISTS mencegah error pada schema yang sudah ada.
-- JANGAN jalankan ulang jika data sudah ada (gunakan seed_product_catalog.sql terpisah).

CREATE TABLE IF NOT EXISTS products (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name        VARCHAR(255)    NOT NULL,
    description TEXT            NOT NULL,
    category    VARCHAR(100)    NOT NULL,
    price       DECIMAL(12, 2)  NOT NULL,
    image       TEXT            NOT NULL,
    quantity    INT UNSIGNED    NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_variant_options (
    id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    product_id   BIGINT UNSIGNED NOT NULL,
    option_value VARCHAR(100)    NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_product_option (product_id, option_value),
    CONSTRAINT fk_variant_product
        FOREIGN KEY (product_id)
        REFERENCES products (id)
        ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
