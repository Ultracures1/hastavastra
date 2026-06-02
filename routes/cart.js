const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

async function getItems(uid) {
  const [items] = await pool.query(`
    SELECT ci.*, p.name, p.price, p.slug,
      pi.image_url as primary_image, pv.color, pv.size, pv.color_hex
    FROM cart_items ci JOIN products p ON ci.product_id=p.id
    LEFT JOIN product_images pi ON pi.product_id=p.id AND pi.is_primary=1
    LEFT JOIN product_variants pv ON ci.variant_id=pv.id
    WHERE ci.user_id=?`, [uid]);
  return items;
}

router.get('/', async (req, res) => {
  try {
    const items = await getItems(req.user.id);
    res.json({ items, subtotal: items.reduce((s,i) => s+i.price*i.quantity, 0), count: items.reduce((s,i) => s+i.quantity, 0) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/add', async (req, res) => {
  try {
    const { product_id, variant_id, quantity=1 } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id required' });
    const [[prod]] = await pool.query('SELECT id FROM products WHERE id=?', [product_id]);
    if (!prod) return res.status(404).json({ error: 'Product not found' });
    const [[existing]] = await pool.query('SELECT * FROM cart_items WHERE user_id=? AND product_id=? AND variant_id<=>?', [req.user.id, product_id, variant_id || null]);
    if (existing) await pool.query('UPDATE cart_items SET quantity=quantity+? WHERE id=?', [quantity, existing.id]);
    else await pool.query('INSERT INTO cart_items (id,user_id,product_id,variant_id,quantity) VALUES (?,?,?,?,?)', [uuidv4(), req.user.id, product_id, variant_id || null, quantity]);
    const items = await getItems(req.user.id);
    res.json({ items, count: items.reduce((s,i) => s+i.quantity, 0) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) await pool.query('DELETE FROM cart_items WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    else await pool.query('UPDATE cart_items SET quantity=? WHERE id=? AND user_id=?', [quantity, req.params.id, req.user.id]);
    const items = await getItems(req.user.id);
    res.json({ items, count: items.reduce((s,i) => s+i.quantity, 0) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    const items = await getItems(req.user.id);
    res.json({ items, count: items.reduce((s,i) => s+i.quantity, 0) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/', async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id=?', [req.user.id]);
    res.json({ items: [], count: 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
