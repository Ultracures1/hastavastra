const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', (req, res) => res.json(db.prepare('SELECT * FROM addresses WHERE user_id=?').all(req.user.id)));

router.post('/', (req, res) => {
  const { name, phone, address_line1, address_line2, city, state, pincode, is_default } = req.body;
  if (is_default) db.prepare('UPDATE addresses SET is_default=0 WHERE user_id=?').run(req.user.id);
  const id = uuidv4();
  db.prepare('INSERT INTO addresses (id,user_id,name,phone,address_line1,address_line2,city,state,pincode,is_default) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id, req.user.id, name, phone, address_line1, address_line2||null, city, state, pincode, is_default?1:0);
  res.status(201).json({ id });
});

router.put('/:id', (req, res) => {
  const { name, phone, address_line1, address_line2, city, state, pincode, is_default } = req.body;
  if (is_default) db.prepare('UPDATE addresses SET is_default=0 WHERE user_id=?').run(req.user.id);
  db.prepare('UPDATE addresses SET name=?,phone=?,address_line1=?,address_line2=?,city=?,state=?,pincode=?,is_default=? WHERE id=? AND user_id=?').run(name, phone, address_line1, address_line2||null, city, state, pincode, is_default?1:0, req.params.id, req.user.id);
  res.json({ message: 'Updated' });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM addresses WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
