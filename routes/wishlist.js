const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT w.*,p.name,p.price,p.original_price,p.slug,pi.image_url as primary_image
      FROM wishlist w JOIN products p ON w.product_id=p.id
      LEFT JOIN product_images pi ON pi.product_id=p.id AND pi.is_primary=1
      WHERE w.user_id=? ORDER BY w.created_at DESC`, [req.user.id]);
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/toggle', async (req, res) => {
  try {
    const { product_id } = req.body;
    const [[existing]] = await pool.query('SELECT id FROM wishlist WHERE user_id=? AND product_id=?', [req.user.id, product_id]);
    if (existing) { await pool.query('DELETE FROM wishlist WHERE id=?', [existing.id]); res.json({ wishlisted: false }); }
    else { await pool.query('INSERT INTO wishlist (id,user_id,product_id) VALUES (?,?,?)', [uuidv4(), req.user.id, product_id]); res.json({ wishlisted: true }); }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
