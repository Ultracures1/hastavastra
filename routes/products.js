// Admin product management.
const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { toProduct } = require("./helpers");

const router = express.Router();
router.use(requireAuth);

const SECTIONS = [
  "bestseller-sarees",
  "bestseller-blouses",
  "new-arrivals",
  "ready-to-wear",
];
const BADGES = ["BESTSELLER", "TOP_RATED", "NEW"];

function readBody(body) {
  const errors = [];
  const name = String(body.name || "").trim();
  if (!name) errors.push("Name is required");
  const price = Number(body.price);
  if (!Number.isFinite(price) || price < 0) errors.push("Price must be a positive number");
  const section = body.section || "bestseller-sarees";
  if (!SECTIONS.includes(section)) errors.push("Invalid section");
  const badge = body.badge || null;
  if (badge && !BADGES.includes(badge)) errors.push("Invalid badge");

  const originalPrice =
    body.originalPrice === "" || body.originalPrice == null
      ? null
      : Number(body.originalPrice);
  const sizes = Array.isArray(body.sizes)
    ? body.sizes.map((s) => String(s).trim()).filter(Boolean)
    : null;

  return {
    errors,
    values: [
      name,
      String(body.type || "").trim(),
      price,
      originalPrice,
      Number(body.rating) || 5,
      Number(body.reviews) || 0,
      badge,
      String(body.image || "").trim(),
      String(body.category || "saree").trim(),
      sizes && sizes.length ? JSON.stringify(sizes) : null,
      body.hasBlousePiece ? 1 : 0,
      section,
      Number(body.sortOrder) || 0,
      body.active === false ? 0 : 1,
    ],
  };
}

router.get("/", async (req, res, next) => {
  try {
    const rows = await db.query(
      "SELECT * FROM products ORDER BY section, sort_order, id"
    );
    res.json(rows.map(toProduct));
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { errors, values } = readBody(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors.join(", ") });
    const result = await db.run(
      `INSERT INTO products
         (name, type, price, original_price, rating, reviews, badge, image,
          category, sizes, has_blouse_piece, section, sort_order, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values
    );
    const rows = await db.query("SELECT * FROM products WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json(toProduct(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { errors, values } = readBody(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors.join(", ") });
    const result = await db.run(
      `UPDATE products SET
         name = ?, type = ?, price = ?, original_price = ?, rating = ?,
         reviews = ?, badge = ?, image = ?, category = ?, sizes = ?,
         has_blouse_piece = ?, section = ?, sort_order = ?, active = ?
       WHERE id = ?`,
      [...values, req.params.id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ error: "Product not found" });
    }
    const rows = await db.query("SELECT * FROM products WHERE id = ?", [
      req.params.id,
    ]);
    res.json(toProduct(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await db.run("DELETE FROM products WHERE id = ?", [
      req.params.id,
    ]);
    if (!result.affectedRows) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
