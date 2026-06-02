const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', (req, res) => {
  res.json(db.prepare(`SELECT w.*,p.name,p.price,p.original_price,p.slug,pi.image_url as primary_image FROM wishlist w JOIN products p ON w.product_id=p.id LEFT JOIN product_images pi ON pi.product_id=p.id AND pi.is_primary=1 WHERE w.user_id=? ORDER BY w.created_at DESC`).all(req.user.id));
});

router.post('/toggle', (req, res) => {
  const { product_id } = req.body;
  const existing = db.prepare('SELECT id FROM wishlist WHERE user_id=? AND product_id=?').get(req.user.id, product_id);
  if (existing) { db.prepare('DELETE FROM wishlist WHERE id=?').run(existing.id); res.json({ wishlisted: false }); }
  else { db.prepare('INSERT INTO wishlist (id,user_id,product_id) VALUES (?,?,?)').run(uuidv4(), req.user.id, product_id); res.json({ wishlisted: true }); }
});

module.exports = router;
