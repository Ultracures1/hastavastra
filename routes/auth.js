const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/database');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
    const [[existing]] = await pool.query('SELECT id FROM users WHERE email=?', [email]);
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const id = uuidv4();
    await pool.query('INSERT INTO users (id,name,email,password,phone) VALUES (?,?,?,?,?)', [id, name, email, bcrypt.hashSync(password, 10), phone || null]);
    const token = jwt.sign({ id, name, email, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id, name, email, role: 'customer' } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const [[user]] = await pool.query('SELECT * FROM users WHERE email=?', [email]);
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const [[user]] = await pool.query('SELECT id,name,email,role,phone,created_at FROM users WHERE id=?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone } = req.body;
    await pool.query('UPDATE users SET name=?,phone=? WHERE id=?', [name, phone, req.user.id]);
    res.json({ message: 'Profile updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [[user]] = await pool.query('SELECT * FROM users WHERE id=?', [req.user.id]);
    if (!bcrypt.compareSync(currentPassword, user.password)) return res.status(401).json({ error: 'Current password is wrong' });
    await pool.query('UPDATE users SET password=? WHERE id=?', [bcrypt.hashSync(newPassword, 10), req.user.id]);
    res.json({ message: 'Password changed' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
