const router = require('express').Router();
const { pool } = require('../db/database');

router.get('/', async (req, res) => {
  try {
    const [cats] = await pool.query('SELECT * FROM categories');
    for (const c of cats) {
      const [[{ n }]] = await pool.query('SELECT COUNT(*) as n FROM products WHERE category_id=?', [c.id]);
      c.product_count = n;
    }
    res.json(cats);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:slug', async (req, res) => {
  try {
    const [[cat]] = await pool.query('SELECT * FROM categories WHERE slug=?', [req.params.slug]);
    if (!cat) return res.status(404).json({ error: 'Not found' });
    res.json(cat);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
