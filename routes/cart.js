const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

const getItems = (uid) => db.prepare(`
  SELECT ci.*, p.name, p.price, p.slug,
    pi.image_url as primary_image, pv.color, pv.size, pv.color_hex
  FROM cart_items ci JOIN products p ON ci.product_id=p.id
  LEFT JOIN product_images pi ON pi.product_id=p.id AND pi.is_primary=1
  LEFT JOIN product_variants pv ON ci.variant_id=pv.id
  WHERE ci.user_id=?`).all(uid);

router.get('/', (req, res) => {
  const items = getItems(req.user.id);
  res.json({ items, subtotal: items.reduce((s,i) => s+i.price*i.quantity, 0), count: items.reduce((s,i) => s+i.quantity, 0) });
});

router.post('/add', (req, res) => {
  const { product_id, variant_id, quantity=1 } = req.body;
  if (!product_id) return res.status(400).json({ error: 'product_id required' });
  if (!db.prepare('SELECT id FROM products WHERE id=?').get(product_id)) return res.status(404).json({ error: 'Product not found' });
  const existing = db.prepare('SELECT * FROM cart_items WHERE user_id=? AND product_id=? AND variant_id IS ?').get(req.user.id, product_id, variant_id || null);
  if (existing) db.prepare('UPDATE cart_items SET quantity=quantity+? WHERE id=?').run(quantity, existing.id);
  else db.prepare('INSERT INTO cart_items (id,user_id,product_id,variant_id,quantity) VALUES (?,?,?,?,?)').run(uuidv4(), req.user.id, product_id, variant_id || null, quantity);
  const items = getItems(req.user.id);
  res.json({ items, count: items.reduce((s,i) => s+i.quantity, 0) });
});

router.put('/:id', (req, res) => {
  const { quantity } = req.body;
  if (quantity < 1) db.prepare('DELETE FROM cart_items WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  else db.prepare('UPDATE cart_items SET quantity=? WHERE id=? AND user_id=?').run(quantity, req.params.id, req.user.id);
  const items = getItems(req.user.id);
  res.json({ items, count: items.reduce((s,i) => s+i.quantity, 0) });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  const items = getItems(req.user.id);
  res.json({ items, count: items.reduce((s,i) => s+i.quantity, 0) });
});

router.delete('/', (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id=?').run(req.user.id);
  res.json({ items: [], count: 0 });
});

module.exports = router;
