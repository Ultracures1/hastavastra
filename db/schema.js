// Table definitions shared by MySQL and SQLite. Only the auto-increment
// primary key syntax differs between the two dialects.
function getSchemaStatements(dialect) {
  const PK =
    dialect === "mysql"
      ? "INT AUTO_INCREMENT PRIMARY KEY"
      : "INTEGER PRIMARY KEY AUTOINCREMENT";

  return [
    `CREATE TABLE IF NOT EXISTS admins (
      id ${PK},
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id ${PK},
      name VARCHAR(255) NOT NULL,
      type VARCHAR(255) NOT NULL DEFAULT '',
      price DECIMAL(10,2) NOT NULL DEFAULT 0,
      original_price DECIMAL(10,2) NULL,
      rating DECIMAL(2,1) NOT NULL DEFAULT 5.0,
      reviews INT NOT NULL DEFAULT 0,
      badge VARCHAR(20) NULL,
      image VARCHAR(500) NOT NULL DEFAULT '',
      category VARCHAR(50) NOT NULL DEFAULT 'saree',
      sizes TEXT NULL,
      has_blouse_piece TINYINT NOT NULL DEFAULT 0,
      section VARCHAR(50) NOT NULL DEFAULT 'bestseller-sarees',
      sort_order INT NOT NULL DEFAULT 0,
      active TINYINT NOT NULL DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS categories (
      id ${PK},
      name VARCHAR(255) NOT NULL,
      image VARCHAR(500) NOT NULL DEFAULT '',
      href VARCHAR(500) NOT NULL DEFAULT '#',
      kind VARCHAR(20) NOT NULL DEFAULT 'circle',
      sort_order INT NOT NULL DEFAULT 0,
      active TINYINT NOT NULL DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS testimonials (
      id ${PK},
      text TEXT NOT NULL,
      customer VARCHAR(255) NOT NULL DEFAULT '',
      date VARCHAR(100) NOT NULL DEFAULT '',
      product VARCHAR(255) NOT NULL DEFAULT '',
      rating INT NOT NULL DEFAULT 5,
      image VARCHAR(500) NOT NULL DEFAULT '',
      sort_order INT NOT NULL DEFAULT 0,
      active TINYINT NOT NULL DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS settings (
      skey VARCHAR(100) PRIMARY KEY,
      svalue TEXT NOT NULL
    )`,
  ];
}

module.exports = { getSchemaStatements };
