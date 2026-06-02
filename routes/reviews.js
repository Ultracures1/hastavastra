const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/database');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, async (req, res) => {
  try {
    const { product_id, rating, title, body } = req.body;
    if (!product_id || !rating) return res.status(400).json({ error: 'product_id and rating required' });
    await pool.query('INSERT INTO reviews (id,product_id,user_id,rating,title,body) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE rating=VALUES(rating),title=VALUES(title),body=VALUES(body)', [uuidv4(), product_id, req.user.id, rating, title, body]);
    res.status(201).json({ message: 'Review submitted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:product_id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT r.*,u.name as user_name FROM reviews r JOIN users u ON r.user_id=u.id WHERE r.product_id=? ORDER BY r.created_at DESC', [req.params.product_id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
