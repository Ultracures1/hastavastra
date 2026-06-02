const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'hastavastra.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, role TEXT DEFAULT 'customer', phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS addresses (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, name TEXT NOT NULL,
    phone TEXT NOT NULL, address_line1 TEXT NOT NULL, address_line2 TEXT,
    city TEXT NOT NULL, state TEXT NOT NULL, pincode TEXT NOT NULL, is_default INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
    description TEXT, image_url TEXT
  );
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
    description TEXT, price REAL NOT NULL, original_price REAL, category_id TEXT,
    fabric TEXT, care_instructions TEXT, is_featured INTEGER DEFAULT 0,
    is_new_arrival INTEGER DEFAULT 0, stock INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );
  CREATE TABLE IF NOT EXISTS product_images (
    id TEXT PRIMARY KEY, product_id TEXT NOT NULL, image_url TEXT NOT NULL,
    is_primary INTEGER DEFAULT 0, sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
  CREATE TABLE IF NOT EXISTS product_variants (
    id TEXT PRIMARY KEY, product_id TEXT NOT NULL, size TEXT,
    color TEXT, color_hex TEXT, stock INTEGER DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
  CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, product_id TEXT NOT NULL,
    variant_id TEXT, quantity INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (product_id) REFERENCES products(id)
  );
  CREATE TABLE IF NOT EXISTS wishlist (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, product_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE(user_id, product_id)
  );
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, address_id TEXT,
    total_amount REAL NOT NULL, discount_amount REAL DEFAULT 0,
    shipping_amount REAL DEFAULT 0, status TEXT DEFAULT 'pending',
    payment_method TEXT DEFAULT 'cod', payment_status TEXT DEFAULT 'pending',
    coupon_code TEXT, notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY, order_id TEXT NOT NULL, product_id TEXT NOT NULL,
    variant_id TEXT, quantity INTEGER NOT NULL, price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id), FOREIGN KEY (product_id) REFERENCES products(id)
  );
  CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, discount_type TEXT NOT NULL,
    discount_value REAL NOT NULL, min_order_amount REAL DEFAULT 0,
    max_uses INTEGER DEFAULT -1, used_count INTEGER DEFAULT 0,
    expires_at DATETIME, is_active INTEGER DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY, product_id TEXT NOT NULL, user_id TEXT NOT NULL,
    rating INTEGER NOT NULL, title TEXT, body TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id), FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

module.exports = db;
