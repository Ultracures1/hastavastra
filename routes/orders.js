const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/database');
const { authenticate, adminOnly } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT o.*,COUNT(oi.id) as item_count FROM orders o LEFT JOIN order_items oi ON o.id=oi.order_id WHERE o.user_id=? GROUP BY o.id ORDER BY o.created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/admin/all', adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT o.*,u.name as user_name,u.email as user_email,COUNT(oi.id) as item_count FROM orders o JOIN users u ON o.user_id=u.id LEFT JOIN order_items oi ON o.id=oi.order_id GROUP BY o.id ORDER BY o.created_at DESC LIMIT 100');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [[order]] = await pool.query('SELECT * FROM orders WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const [items] = await pool.query('SELECT oi.*,p.name,p.slug,pi.image_url as primary_image,pv.color,pv.size FROM order_items oi JOIN products p ON oi.product_id=p.id LEFT JOIN product_images pi ON pi.product_id=p.id AND pi.is_primary=1 LEFT JOIN product_variants pv ON oi.variant_id=pv.id WHERE oi.order_id=?', [order.id]);
    const [[address]] = order.address_id ? await pool.query('SELECT * FROM addresses WHERE id=?', [order.address_id]) : [[null]];
    order.items = items;
    order.address = address || null;
    res.json(order);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { address_id, payment_method='cod', coupon_code, notes } = req.body;
    const [cart] = await conn.query('SELECT ci.*,p.price FROM cart_items ci JOIN products p ON ci.product_id=p.id WHERE ci.user_id=?', [req.user.id]);
    if (!cart.length) { await conn.rollback(); return res.status(400).json({ error: 'Cart is empty' }); }
    let subtotal = cart.reduce((s,i) => s+i.price*i.quantity, 0);
    let discount = 0;
    const shipping = subtotal >= 999 ? 0 : 99;
    if (coupon_code) {
      const [[c]] = await conn.query('SELECT * FROM coupons WHERE code=? AND is_active=1', [coupon_code]);
      if (c) { discount = c.discount_type === 'percentage' ? subtotal*c.discount_value/100 : c.discount_value; await conn.query('UPDATE coupons SET used_count=used_count+1 WHERE id=?', [c.id]); }
    }
    const total = subtotal - discount + shipping;
    const oid = uuidv4();
    await conn.query('INSERT INTO orders (id,user_id,address_id,total_amount,discount_amount,shipping_amount,payment_method,coupon_code,notes) VALUES (?,?,?,?,?,?,?,?,?)', [oid, req.user.id, address_id||null, total, discount, shipping, payment_method, coupon_code||null, notes||null]);
    for (const i of cart) await conn.query('INSERT INTO order_items (id,order_id,product_id,variant_id,quantity,price) VALUES (?,?,?,?,?,?)', [uuidv4(), oid, i.product_id, i.variant_id, i.quantity, i.price]);
    await conn.query('DELETE FROM cart_items WHERE user_id=?', [req.user.id]);
    await conn.commit();
    res.status(201).json({ order_id: oid, total, message: 'Order placed successfully' });
  } catch (e) { await conn.rollback(); res.status(500).json({ error: e.message }); }
  finally { conn.release(); }
});

module.exports = router;
