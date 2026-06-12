// Admin testimonial management.
const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { toTestimonial } = require("./helpers");

const router = express.Router();
router.use(requireAuth);

function readBody(body) {
  const errors = [];
  const text = String(body.text || "").trim();
  if (!text) errors.push("Text is required");
  let rating = Number(body.rating) || 5;
  rating = Math.min(5, Math.max(1, Math.round(rating)));
  return {
    errors,
    values: [
      text,
      String(body.customer || "").trim(),
      String(body.date || "").trim(),
      String(body.product || "").trim(),
      rating,
      String(body.image || "").trim(),
      Number(body.sortOrder) || 0,
      body.active === false ? 0 : 1,
    ],
  };
}

router.get("/", async (req, res, next) => {
  try {
    const rows = await db.query(
      "SELECT * FROM testimonials ORDER BY sort_order, id"
    );
    res.json(rows.map(toTestimonial));
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { errors, values } = readBody(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors.join(", ") });
    const result = await db.run(
      "INSERT INTO testimonials (text, customer, date, product, rating, image, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      values
    );
    const rows = await db.query("SELECT * FROM testimonials WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json(toTestimonial(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { errors, values } = readBody(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors.join(", ") });
    const result = await db.run(
      "UPDATE testimonials SET text = ?, customer = ?, date = ?, product = ?, rating = ?, image = ?, sort_order = ?, active = ? WHERE id = ?",
      [...values, req.params.id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ error: "Testimonial not found" });
    }
    const rows = await db.query("SELECT * FROM testimonials WHERE id = ?", [
      req.params.id,
    ]);
    res.json(toTestimonial(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await db.run("DELETE FROM testimonials WHERE id = ?", [
      req.params.id,
    ]);
    if (!result.affectedRows) {
      return res.status(404).json({ error: "Testimonial not found" });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
