const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticate, adminOnly } = require('../middleware/auth');

router.use(authenticate);

router.get('/', (req, res) => {
  res.json(db.prepare(`SELECT o.*,COUNT(oi.id) as item_count FROM orders o LEFT JOIN order_items oi ON o.id=oi.order_id WHERE o.user_id=? GROUP BY o.id ORDER BY o.created_at DESC`).all(req.user.id));
});

router.get('/admin/all', adminOnly, (req, res) => {
  res.json(db.prepare(`SELECT o.*,u.name as user_name,u.email as user_email,COUNT(oi.id) as item_count FROM orders o JOIN users u ON o.user_id=u.id LEFT JOIN order_items oi ON o.id=oi.order_id GROUP BY o.id ORDER BY o.created_at DESC LIMIT 100`).all());
});

router.get('/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id=? AND user_id=?').get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.items = db.prepare(`SELECT oi.*,p.name,p.slug,pi.image_url as primary_image,pv.color,pv.size FROM order_items oi JOIN products p ON oi.product_id=p.id LEFT JOIN product_images pi ON pi.product_id=p.id AND pi.is_primary=1 LEFT JOIN product_variants pv ON oi.variant_id=pv.id WHERE oi.order_id=?`).all(order.id);
  order.address = order.address_id ? db.prepare('SELECT * FROM addresses WHERE id=?').get(order.address_id) : null;
  res.json(order);
});

router.post('/', (req, res) => {
  const { address_id, payment_method='cod', coupon_code, notes } = req.body;
  const cart = db.prepare('SELECT ci.*,p.price FROM cart_items ci JOIN products p ON ci.product_id=p.id WHERE ci.user_id=?').all(req.user.id);
  if (!cart.length) return res.status(400).json({ error: 'Cart is empty' });
  let subtotal = cart.reduce((s,i) => s+i.price*i.quantity, 0);
  let discount = 0;
  const shipping = subtotal >= 999 ? 0 : 99;
  if (coupon_code) {
    const c = db.prepare('SELECT * FROM coupons WHERE code=? AND is_active=1').get(coupon_code);
    if (c) { discount = c.discount_type === 'percentage' ? subtotal*c.discount_value/100 : c.discount_value; db.prepare('UPDATE coupons SET used_count=used_count+1 WHERE id=?').run(c.id); }
  }
  const total = subtotal - discount + shipping;
  const oid = uuidv4();
  db.prepare('INSERT INTO orders (id,user_id,address_id,total_amount,discount_amount,shipping_amount,payment_method,coupon_code,notes) VALUES (?,?,?,?,?,?,?,?,?)').run(oid, req.user.id, address_id||null, total, discount, shipping, payment_method, coupon_code||null, notes||null);
  cart.forEach(i => db.prepare('INSERT INTO order_items (id,order_id,product_id,variant_id,quantity,price) VALUES (?,?,?,?,?,?)').run(uuidv4(), oid, i.product_id, i.variant_id, i.quantity, i.price));
  db.prepare('DELETE FROM cart_items WHERE user_id=?').run(req.user.id);
  res.status(201).json({ order_id: oid, total, message: 'Order placed successfully' });
});

module.exports = router;
