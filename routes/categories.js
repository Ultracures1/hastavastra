const router = require('express').Router();
const db = require('../db/database');

router.get('/', (req, res) => {
  const cats = db.prepare('SELECT * FROM categories').all();
  cats.forEach(c => { c.product_count = db.prepare('SELECT COUNT(*) as n FROM products WHERE category_id=?').get(c.id).n; });
  res.json(cats);
});

router.get('/:slug', (req, res) => {
  const cat = db.prepare('SELECT * FROM categories WHERE slug=?').get(req.params.slug);
  if (!cat) return res.status(404).json({ error: 'Not found' });
  res.json(cat);
});

module.exports = router;
