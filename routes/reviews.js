const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, (req, res) => {
  const { product_id, rating, title, body } = req.body;
  if (!product_id || !rating) return res.status(400).json({ error: 'product_id and rating required' });
  db.prepare('INSERT OR REPLACE INTO reviews (id,product_id,user_id,rating,title,body) VALUES (?,?,?,?,?,?)').run(uuidv4(), product_id, req.user.id, rating, title, body);
  res.status(201).json({ message: 'Review submitted' });
});

router.get('/:product_id', (req, res) => {
  res.json(db.prepare('SELECT r.*,u.name as user_name FROM reviews r JOIN users u ON r.user_id=u.id WHERE r.product_id=? ORDER BY r.created_at DESC').all(req.params.product_id));
});

module.exports = router;
