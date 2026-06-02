require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'hastavastra',
  waitForConnections: true,
  connectionLimit: 10,
});

async function initDB() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL, role VARCHAR(50) DEFAULT 'customer', phone VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS addresses (
        id VARCHAR(36) PRIMARY KEY, user_id VARCHAR(36) NOT NULL, name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL, address_line1 TEXT NOT NULL, address_line2 TEXT,
        city VARCHAR(255) NOT NULL, state VARCHAR(255) NOT NULL, pincode VARCHAR(20) NOT NULL,
        is_default TINYINT(1) DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(36) PRIMARY KEY, name VARCHAR(255) NOT NULL, slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT, image_url TEXT
      )
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(36) PRIMARY KEY, name VARCHAR(255) NOT NULL, slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT, price DECIMAL(10,2) NOT NULL, original_price DECIMAL(10,2),
        category_id VARCHAR(36), fabric VARCHAR(255), care_instructions TEXT,
        is_featured TINYINT(1) DEFAULT 0, is_new_arrival TINYINT(1) DEFAULT 0,
        stock INT DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id VARCHAR(36) PRIMARY KEY, product_id VARCHAR(36) NOT NULL, image_url TEXT NOT NULL,
        is_primary TINYINT(1) DEFAULT 0, sort_order INT DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id VARCHAR(36) PRIMARY KEY, product_id VARCHAR(36) NOT NULL, size VARCHAR(50),
        color VARCHAR(100), color_hex VARCHAR(20), stock INT DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id VARCHAR(36) PRIMARY KEY, user_id VARCHAR(36) NOT NULL, product_id VARCHAR(36) NOT NULL,
        variant_id VARCHAR(36), quantity INT DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id VARCHAR(36) PRIMARY KEY, user_id VARCHAR(36) NOT NULL, product_id VARCHAR(36) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (product_id) REFERENCES products(id),
        UNIQUE KEY uq_wishlist (user_id, product_id)
      )
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(36) PRIMARY KEY, user_id VARCHAR(36) NOT NULL, address_id VARCHAR(36),
        total_amount DECIMAL(10,2) NOT NULL, discount_amount DECIMAL(10,2) DEFAULT 0,
        shipping_amount DECIMAL(10,2) DEFAULT 0, status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50) DEFAULT 'cod', payment_status VARCHAR(50) DEFAULT 'pending',
        coupon_code VARCHAR(50), notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(36) PRIMARY KEY, order_id VARCHAR(36) NOT NULL, product_id VARCHAR(36) NOT NULL,
        variant_id VARCHAR(36), quantity INT NOT NULL, price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id), FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id VARCHAR(36) PRIMARY KEY, code VARCHAR(100) UNIQUE NOT NULL, discount_type VARCHAR(50) NOT NULL,
        discount_value DECIMAL(10,2) NOT NULL, min_order_amount DECIMAL(10,2) DEFAULT 0,
        max_uses INT DEFAULT -1, used_count INT DEFAULT 0,
        expires_at DATETIME, is_active TINYINT(1) DEFAULT 1
      )
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(36) PRIMARY KEY, product_id VARCHAR(36) NOT NULL, user_id VARCHAR(36) NOT NULL,
        rating INT NOT NULL, title VARCHAR(255), body TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id), FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('Database tables ready.');
  } finally {
    conn.release();
  }
}

module.exports = { pool, initDB };
