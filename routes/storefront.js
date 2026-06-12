// Public endpoint: everything the storefront needs in one request.
const express = require("express");
const db = require("../db");
const { safeParse, toProduct, toCategory, toTestimonial } = require("./helpers");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const [productRows, categoryRows, testimonialRows, settingRows] =
      await Promise.all([
        db.query(
          "SELECT * FROM products WHERE active = 1 ORDER BY sort_order, id"
        ),
        db.query(
          "SELECT * FROM categories WHERE active = 1 ORDER BY sort_order, id"
        ),
        db.query(
          "SELECT * FROM testimonials WHERE active = 1 ORDER BY sort_order, id"
        ),
        db.query("SELECT * FROM settings"),
      ]);

    const products = {};
    for (const row of productRows) {
      const p = toProduct(row);
      (products[p.section] ||= []).push(p);
    }

    const settings = {};
    for (const row of settingRows) {
      settings[row.skey] = safeParse(row.svalue, null);
    }

    res.json({
      settings,
      products,
      categories: categoryRows.map(toCategory).filter((c) => c.kind === "circle"),
      featuredCategories: categoryRows
        .map(toCategory)
        .filter((c) => c.kind === "featured"),
      testimonials: testimonialRows.map(toTestimonial),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
