const router = require('express').Router();
const { pool } = require('../db/database');

async function enrichFull(p) {
  const [images]   = await pool.query('SELECT * FROM product_images WHERE product_id=? ORDER BY sort_order', [p.id]);
  const [variants] = await pool.query('SELECT * FROM product_variants WHERE product_id=?', [p.id]);
  const [[category]] = p.category_id ? await pool.query('SELECT * FROM categories WHERE id=?', [p.category_id]) : [[null]];
  const [revs]     = await pool.query('SELECT r.*,u.name as user_name FROM reviews r JOIN users u ON r.user_id=u.id WHERE r.product_id=? ORDER BY r.created_at DESC', [p.id]);
  p.images = images;
  p.variants = variants;
  p.category = category || null;
  p.reviews = revs;
  p.avg_rating = revs.length ? +(revs.reduce((s,r) => s+r.rating, 0)/revs.length).toFixed(1) : 0;
  p.review_count = revs.length;
  return p;
}

router.get('/', async (req, res) => {
  try {
    const { category, search, featured, new_arrival, sort='created_at', order='desc', page=1, limit=12, min_price, max_price } = req.query;
    const sorts = { price:'p.price', name:'p.name', created_at:'p.created_at' };
    const sortCol = sorts[sort] || 'p.created_at';
    const dir = order === 'asc' ? 'ASC' : 'DESC';
    let base = 'FROM products p';
    const conds = [], params = [];
    if (category) { base += ' JOIN categories c ON p.category_id=c.id'; conds.push('c.slug=?'); params.push(category); }
    if (search)   { conds.push('(p.name LIKE ? OR p.description LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (featured === 'true')    conds.push('p.is_featured=1');
    if (new_arrival === 'true') conds.push('p.is_new_arrival=1');
    if (min_price) { conds.push('p.price>=?'); params.push(+min_price); }
    if (max_price) { conds.push('p.price<=?'); params.push(+max_price); }
    const where = conds.length ? ' WHERE ' + conds.join(' AND ') : '';
    const [[{ c: total }]] = await pool.query(`SELECT COUNT(*) as c ${base}${where}`, params);
    const offset = (+page-1) * +limit;
    const [products] = await pool.query(`SELECT p.* ${base}${where} ORDER BY ${sortCol} ${dir} LIMIT ? OFFSET ?`, [...params, +limit, offset]);
    for (const p of products) {
      const [[img]] = await pool.query('SELECT image_url FROM product_images WHERE product_id=? AND is_primary=1', [p.id]);
      const [[rv]]  = await pool.query('SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE product_id=?', [p.id]);
      p.primary_image = img?.image_url || null;
      p.avg_rating = +(rv.avg || 0).toFixed(1);
      p.review_count = rv.cnt;
    }
    res.json({ products, total, page: +page, limit: +limit });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:slug', async (req, res) => {
  try {
    const [[p]] = await pool.query('SELECT * FROM products WHERE slug=?', [req.params.slug]);
    if (!p) return res.status(404).json({ error: 'Product not found' });
    res.json(await enrichFull(p));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
