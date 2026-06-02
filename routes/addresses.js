const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM addresses WHERE user_id=?', [req.user.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, phone, address_line1, address_line2, city, state, pincode, is_default } = req.body;
    if (is_default) await pool.query('UPDATE addresses SET is_default=0 WHERE user_id=?', [req.user.id]);
    const id = uuidv4();
    await pool.query('INSERT INTO addresses (id,user_id,name,phone,address_line1,address_line2,city,state,pincode,is_default) VALUES (?,?,?,?,?,?,?,?,?,?)', [id, req.user.id, name, phone, address_line1, address_line2||null, city, state, pincode, is_default?1:0]);
    res.status(201).json({ id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, phone, address_line1, address_line2, city, state, pincode, is_default } = req.body;
    if (is_default) await pool.query('UPDATE addresses SET is_default=0 WHERE user_id=?', [req.user.id]);
    await pool.query('UPDATE addresses SET name=?,phone=?,address_line1=?,address_line2=?,city=?,state=?,pincode=?,is_default=? WHERE id=? AND user_id=?', [name, phone, address_line1, address_line2||null, city, state, pincode, is_default?1:0, req.params.id, req.user.id]);
    res.json({ message: 'Updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM addresses WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
