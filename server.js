const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Auto-seed on first run
try {
  const db = require('./db/database');
  const count = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  if (count === 0) {
    console.log('First run — seeding database...');
    require('./db/seed');
  }
} catch (e) {
  console.error('Seed error:', e.message);
}

app.use(cors());
app.use(express.json());

// API routes
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

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// SPA fallback — all non-API routes return index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Hastavastra running on http://localhost:${PORT}`);
});
