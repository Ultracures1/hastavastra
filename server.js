require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/products',   require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart',       require('./routes/cart'));
app.use('/api/wishlist',   require('./routes/wishlist'));
app.use('/api/orders',     require('./routes/orders'));
app.use('/api/reviews',    require('./routes/reviews'));
app.use('/api/addresses',  require('./routes/addresses'));
app.use('/api/coupons',    require('./routes/coupons'));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'Hastavastra' }));

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function start() {
  const { initDB } = require('./db/database');
  await initDB();

  // Auto-seed on first run
  try {
    const { pool } = require('./db/database');
    const [[{ c }]] = await pool.query('SELECT COUNT(*) as c FROM products');
    if (c === 0) {
      console.log('First run — seeding database...');
      await require('./db/seed').run();
    }
  } catch (e) {
    console.error('Seed error:', e.message);
  }

  app.listen(PORT, () => console.log(`Hastavastra running on http://localhost:${PORT}`));
}

start().catch(err => { console.error('Startup error:', err); process.exit(1); });
