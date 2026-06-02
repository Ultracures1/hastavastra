const router = require('express').Router();
const db = require('../db/database');

const enrichFull = (p) => {
  if (!p) return null;
  p.images = db.prepare('SELECT * FROM product_images WHERE product_id=? ORDER BY sort_order').all(p.id);
  p.variants = db.prepare('SELECT * FROM product_variants WHERE product_id=?').all(p.id);
  p.category = p.category_id ? db.prepare('SELECT * FROM categories WHERE id=?').get(p.category_id) : null;
  const revs = db.prepare('SELECT r.*,u.name as user_name FROM reviews r JOIN users u ON r.user_id=u.id WHERE r.product_id=? ORDER BY r.created_at DESC').all(p.id);
  p.reviews = revs;
  p.avg_rating = revs.length ? +(revs.reduce((s,r) => s+r.rating, 0)/revs.length).toFixed(1) : 0;
  p.review_count = revs.length;
  return p;
};

router.get('/', (req, res) => {
  const { category, search, featured, new_arrival, sort='created_at', order='desc', page=1, limit=12, min_price, max_price } = req.query;
  const sorts = { price:'p.price', name:'p.name', created_at:'p.created_at' };
  const sortCol = sorts[sort] || 'p.created_at';
  const dir = order === 'asc' ? 'ASC' : 'DESC';
  let base = 'FROM products p';
  const conds = [], params = [];
  if (category) { base += ' JOIN categories c ON p.category_id=c.id'; conds.push('c.slug=?'); params.push(category); }
  if (search) { conds.push('(p.name LIKE ? OR p.description LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
  if (featured === 'true') conds.push('p.is_featured=1');
  if (new_arrival === 'true') conds.push('p.is_new_arrival=1');
  if (min_price) { conds.push('p.price>=?'); params.push(+min_price); }
  if (max_price) { conds.push('p.price<=?'); params.push(+max_price); }
  const where = conds.length ? ' WHERE ' + conds.join(' AND ') : '';
  const total = db.prepare(`SELECT COUNT(*) as c ${base}${where}`).get(...params).c;
  const offset = (+page-1) * +limit;
  const products = db.prepare(`SELECT p.* ${base}${where} ORDER BY ${sortCol} ${dir} LIMIT ? OFFSET ?`).all(...params, +limit, offset);
  products.forEach(p => {
    const img = db.prepare('SELECT image_url FROM product_images WHERE product_id=? AND is_primary=1').get(p.id);
    const rv = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE product_id=?').get(p.id);
    p.primary_image = img?.image_url || null;
    p.avg_rating = +(rv.avg || 0).toFixed(1);
    p.review_count = rv.cnt;
  });
  res.json({ products, total, page: +page, limit: +limit });
});

router.get('/:slug', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE slug=?').get(req.params.slug);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json(enrichFull(p));
});

module.exports = router;
