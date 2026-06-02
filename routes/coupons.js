const router = require('express').Router();
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');

router.post('/validate', authenticate, (req, res) => {
  const { code, cart_total=0 } = req.body;
  const c = db.prepare('SELECT * FROM coupons WHERE code=? AND is_active=1').get(code);
  if (!c) return res.status(404).json({ error: 'Invalid coupon code' });
  if (c.max_uses !== -1 && c.used_count >= c.max_uses) return res.status(400).json({ error: 'Coupon usage limit reached' });
  if (cart_total < c.min_order_amount) return res.status(400).json({ error: `Minimum order amount is ₹${c.min_order_amount}` });
  const discount = c.discount_type === 'percentage' ? cart_total*c.discount_value/100 : c.discount_value;
  res.json({ valid: true, discount, discount_type: c.discount_type, discount_value: c.discount_value });
});

module.exports = router;
