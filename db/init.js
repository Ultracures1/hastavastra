// Creates tables if they don't exist and seeds initial content into empty
// tables. Safe to run on every server start.
require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./index");
const { getSchemaStatements } = require("./schema");
const seed = require("./seedData");

async function initDatabase() {
  for (const stmt of getSchemaStatements(db.dialect)) {
    await db.run(stmt);
  }

  // Initial admin account
  const [adminCount] = await db.query("SELECT COUNT(*) AS c FROM admins");
  if (Number(adminCount.c) === 0) {
    const email = process.env.ADMIN_EMAIL || "admin@hastavastra.com";
    const password = process.env.ADMIN_PASSWORD || "admin123";
    const hash = await bcrypt.hash(password, 10);
    await db.run("INSERT INTO admins (email, password_hash) VALUES (?, ?)", [
      email,
      hash,
    ]);
    console.log(`[db] created admin account: ${email}`);
  }

  const [productCount] = await db.query("SELECT COUNT(*) AS c FROM products");
  if (Number(productCount.c) === 0) {
    let order = 0;
    for (const p of seed.products) {
      await db.run(
        `INSERT INTO products
           (name, type, price, original_price, rating, reviews, badge, image,
            category, sizes, has_blouse_piece, section, sort_order, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          p.name,
          p.type,
          p.price,
          p.originalPrice ?? null,
          p.rating,
          p.reviews,
          p.badge ?? null,
          p.image,
          p.category,
          p.sizes ? JSON.stringify(p.sizes) : null,
          p.hasBlousePiece ? 1 : 0,
          p.section,
          order++,
        ]
      );
    }
    console.log(`[db] seeded ${seed.products.length} products`);
  }

  const [categoryCount] = await db.query("SELECT COUNT(*) AS c FROM categories");
  if (Number(categoryCount.c) === 0) {
    let order = 0;
    for (const c of seed.categories) {
      await db.run(
        "INSERT INTO categories (name, image, href, kind, sort_order, active) VALUES (?, ?, ?, ?, ?, 1)",
        [c.name, c.image, c.href, c.kind, order++]
      );
    }
    console.log(`[db] seeded ${seed.categories.length} categories`);
  }

  const [testimonialCount] = await db.query(
    "SELECT COUNT(*) AS c FROM testimonials"
  );
  if (Number(testimonialCount.c) === 0) {
    let order = 0;
    for (const t of seed.testimonials) {
      await db.run(
        "INSERT INTO testimonials (text, customer, date, product, rating, image, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)",
        [t.text, t.customer, t.date, t.product, t.rating, t.image, order++]
      );
    }
    console.log(`[db] seeded ${seed.testimonials.length} testimonials`);
  }

  // Insert only the setting keys that don't exist yet
  const existing = await db.query("SELECT skey FROM settings");
  const existingKeys = new Set(existing.map((r) => r.skey));
  for (const [key, value] of Object.entries(seed.settings)) {
    if (!existingKeys.has(key)) {
      await db.run("INSERT INTO settings (skey, svalue) VALUES (?, ?)", [
        key,
        JSON.stringify(value),
      ]);
    }
  }
}

module.exports = { initDatabase };

if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log(`[db] init complete (${db.dialect})`);
      process.exit(0);
    })
    .catch((err) => {
      console.error("[db] init failed:", err);
      process.exit(1);
    });
}
