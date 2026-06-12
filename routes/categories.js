// Admin category management ("circle" = category circles row,
// "featured" = featured categories grid).
const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { toCategory } = require("./helpers");

const router = express.Router();
router.use(requireAuth);

function readBody(body) {
  const errors = [];
  const name = String(body.name || "").trim();
  if (!name) errors.push("Name is required");
  const kind = body.kind || "circle";
  if (!["circle", "featured"].includes(kind)) errors.push("Invalid kind");
  return {
    errors,
    values: [
      name,
      String(body.image || "").trim(),
      String(body.href || "#").trim() || "#",
      kind,
      Number(body.sortOrder) || 0,
      body.active === false ? 0 : 1,
    ],
  };
}

router.get("/", async (req, res, next) => {
  try {
    const rows = await db.query(
      "SELECT * FROM categories ORDER BY kind, sort_order, id"
    );
    res.json(rows.map(toCategory));
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { errors, values } = readBody(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors.join(", ") });
    const result = await db.run(
      "INSERT INTO categories (name, image, href, kind, sort_order, active) VALUES (?, ?, ?, ?, ?, ?)",
      values
    );
    const rows = await db.query("SELECT * FROM categories WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json(toCategory(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { errors, values } = readBody(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors.join(", ") });
    const result = await db.run(
      "UPDATE categories SET name = ?, image = ?, href = ?, kind = ?, sort_order = ?, active = ? WHERE id = ?",
      [...values, req.params.id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ error: "Category not found" });
    }
    const rows = await db.query("SELECT * FROM categories WHERE id = ?", [
      req.params.id,
    ]);
    res.json(toCategory(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await db.run("DELETE FROM categories WHERE id = ?", [
      req.params.id,
    ]);
    if (!result.affectedRows) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
