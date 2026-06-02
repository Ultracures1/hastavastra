#!/usr/bin/env python3
"""Hastavastra API Server — pure Python, no external web framework."""
import json, os, sys, uuid, re
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

sys.path.insert(0, os.path.dirname(__file__))
from database import get_db, init_db
from auth_utils import hash_password, verify_password, create_token, verify_token

PORT = int(os.environ.get('PORT', 5000))

def row_to_dict(row):
    if row is None:
        return None
    return dict(row)

def rows_to_list(rows):
    return [dict(r) for r in rows]


class RequestHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(f"[API] {self.address_string()} - {fmt % args}")

    def send_json(self, data, status=200):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(body))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.end_headers()
        self.wfile.write(body)

    def get_body(self):
        length = int(self.headers.get('Content-Length', 0))
        if length == 0:
            return {}
        try:
            return json.loads(self.rfile.read(length))
        except Exception:
            return {}

    def get_user(self):
        auth = self.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return None
        return verify_token(auth[7:])

    def require_auth(self):
        user = self.get_user()
        if not user:
            self.send_json({'error': 'Authentication required'}, 401)
        return user

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.end_headers()

    def do_GET(self):
        self.route()

    def do_POST(self):
        self.route()

    def do_PUT(self):
        self.route()

    def do_DELETE(self):
        self.route()

    def route(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip('/')
        qs = parse_qs(parsed.query)
        method = self.command

        try:
            # Health
            if path == '/api/health' and method == 'GET':
                return self.send_json({'status': 'ok', 'app': 'Hastavastra API'})

            # Auth
            if path == '/api/auth/register' and method == 'POST':
                return self.auth_register()
            if path == '/api/auth/login' and method == 'POST':
                return self.auth_login()
            if path == '/api/auth/me' and method == 'GET':
                return self.auth_me()
            if path == '/api/auth/profile' and method == 'PUT':
                return self.auth_profile()
            if path == '/api/auth/change-password' and method == 'PUT':
                return self.auth_change_password()

            # Categories
            if path == '/api/categories' and method == 'GET':
                return self.get_categories()
            m = re.match(r'^/api/categories/([^/]+)$', path)
            if m and method == 'GET':
                return self.get_category(m.group(1))

            # Products
            if path == '/api/products' and method == 'GET':
                return self.get_products(qs)
            m = re.match(r'^/api/products/id/([^/]+)$', path)
            if m and method == 'GET':
                return self.get_product_by_id(m.group(1))
            m = re.match(r'^/api/products/([^/]+)$', path)
            if m and method == 'GET':
                return self.get_product_by_slug(m.group(1))

            # Cart
            if path == '/api/cart' and method == 'GET':
                return self.get_cart()
            if path == '/api/cart/add' and method == 'POST':
                return self.cart_add()
            if path == '/api/cart' and method == 'DELETE':
                return self.cart_clear()
            m = re.match(r'^/api/cart/([^/]+)$', path)
            if m:
                if method == 'PUT':
                    return self.cart_update(m.group(1))
                if method == 'DELETE':
                    return self.cart_remove(m.group(1))

            # Wishlist
            if path == '/api/wishlist' and method == 'GET':
                return self.get_wishlist()
            if path == '/api/wishlist/toggle' and method == 'POST':
                return self.wishlist_toggle()

            # Orders
            if path == '/api/orders' and method == 'GET':
                return self.get_orders()
            if path == '/api/orders' and method == 'POST':
                return self.create_order()
            m = re.match(r'^/api/orders/([^/]+)$', path)
            if m and method == 'GET':
                return self.get_order(m.group(1))

            # Reviews
            if path == '/api/reviews' and method == 'POST':
                return self.create_review()
            m = re.match(r'^/api/reviews/([^/]+)$', path)
            if m and method == 'GET':
                return self.get_reviews(m.group(1))

            # Addresses
            if path == '/api/addresses' and method == 'GET':
                return self.get_addresses()
            if path == '/api/addresses' and method == 'POST':
                return self.create_address()
            m = re.match(r'^/api/addresses/([^/]+)$', path)
            if m:
                if method == 'PUT':
                    return self.update_address(m.group(1))
                if method == 'DELETE':
                    return self.delete_address(m.group(1))

            # Coupons
            if path == '/api/coupons/validate' and method == 'POST':
                return self.validate_coupon()

            self.send_json({'error': 'Not found'}, 404)
        except Exception as e:
            import traceback
            traceback.print_exc()
            self.send_json({'error': str(e)}, 500)

    # ── Auth handlers ──────────────────────────────────────────────

    def auth_register(self):
        b = self.get_body()
        name, email, password = b.get('name'), b.get('email'), b.get('password')
        if not all([name, email, password]):
            return self.send_json({'error': 'Name, email and password required'}, 400)
        db = get_db()
        if db.execute('SELECT id FROM users WHERE email=?', (email,)).fetchone():
            db.close(); return self.send_json({'error': 'Email already registered'}, 409)
        uid = str(uuid.uuid4())
        db.execute('INSERT INTO users (id, name, email, password, phone) VALUES (?,?,?,?,?)',
            (uid, name, email, hash_password(password), b.get('phone')))
        db.commit(); db.close()
        token = create_token({'id': uid, 'name': name, 'email': email, 'role': 'customer'})
        self.send_json({'token': token, 'user': {'id': uid, 'name': name, 'email': email, 'role': 'customer'}}, 201)

    def auth_login(self):
        b = self.get_body()
        email, password = b.get('email'), b.get('password')
        if not email or not password:
            return self.send_json({'error': 'Email and password required'}, 400)
        db = get_db()
        user = row_to_dict(db.execute('SELECT * FROM users WHERE email=?', (email,)).fetchone())
        db.close()
        if not user or not verify_password(password, user['password']):
            return self.send_json({'error': 'Invalid credentials'}, 401)
        token = create_token({'id': user['id'], 'name': user['name'], 'email': user['email'], 'role': user['role']})
        self.send_json({'token': token, 'user': {'id': user['id'], 'name': user['name'], 'email': user['email'], 'role': user['role']}})

    def auth_me(self):
        user = self.require_auth()
        if not user: return
        db = get_db()
        u = row_to_dict(db.execute('SELECT id, name, email, role, phone, created_at FROM users WHERE id=?', (user['id'],)).fetchone())
        db.close()
        if not u: return self.send_json({'error': 'Not found'}, 404)
        self.send_json(u)

    def auth_profile(self):
        user = self.require_auth()
        if not user: return
        b = self.get_body()
        db = get_db()
        db.execute('UPDATE users SET name=?, phone=? WHERE id=?', (b.get('name'), b.get('phone'), user['id']))
        db.commit(); db.close()
        self.send_json({'message': 'Profile updated'})

    def auth_change_password(self):
        user = self.require_auth()
        if not user: return
        b = self.get_body()
        db = get_db()
        u = row_to_dict(db.execute('SELECT * FROM users WHERE id=?', (user['id'],)).fetchone())
        if not verify_password(b.get('currentPassword',''), u['password']):
            db.close(); return self.send_json({'error': 'Current password is wrong'}, 401)
        db.execute('UPDATE users SET password=? WHERE id=?', (hash_password(b.get('newPassword','')), user['id']))
        db.commit(); db.close()
        self.send_json({'message': 'Password changed'})

    # ── Category handlers ──────────────────────────────────────────

    def get_categories(self):
        db = get_db()
        cats = rows_to_list(db.execute('SELECT * FROM categories').fetchall())
        for c in cats:
            c['product_count'] = db.execute('SELECT COUNT(*) FROM products WHERE category_id=?', (c['id'],)).fetchone()[0]
        db.close()
        self.send_json(cats)

    def get_category(self, slug):
        db = get_db()
        cat = row_to_dict(db.execute('SELECT * FROM categories WHERE slug=?', (slug,)).fetchone())
        db.close()
        if not cat: return self.send_json({'error': 'Not found'}, 404)
        self.send_json(cat)

    # ── Product handlers ───────────────────────────────────────────

    def enrich_product_list(self, products, db):
        result = []
        for p in products:
            img = db.execute('SELECT image_url FROM product_images WHERE product_id=? AND is_primary=1', (p['id'],)).fetchone()
            rv = db.execute('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE product_id=?', (p['id'],)).fetchone()
            p['primary_image'] = img[0] if img else None
            p['avg_rating'] = round(rv[0] or 0, 1)
            p['review_count'] = rv[1]
            result.append(p)
        return result

    def get_products(self, qs):
        def q(key): return qs.get(key, [None])[0]
        category = q('category'); search = q('search'); featured = q('featured')
        new_arrival = q('new_arrival'); sort = q('sort') or 'created_at'
        order = q('order') or 'desc'; page = int(q('page') or 1); limit = int(q('limit') or 12)
        min_price = q('min_price'); max_price = q('max_price')

        allowed_sorts = {'price': 'p.price', 'name': 'p.name', 'created_at': 'p.created_at'}
        sort_col = allowed_sorts.get(sort, 'p.created_at')
        order_dir = 'ASC' if order == 'asc' else 'DESC'

        base = 'FROM products p'
        conds = []; params = []
        if category:
            base += ' JOIN categories c ON p.category_id = c.id'
            conds.append('c.slug = ?'); params.append(category)
        if search:
            conds.append('(p.name LIKE ? OR p.description LIKE ?)')
            params.extend([f'%{search}%', f'%{search}%'])
        if featured == 'true': conds.append('p.is_featured = 1')
        if new_arrival == 'true': conds.append('p.is_new_arrival = 1')
        if min_price: conds.append('p.price >= ?'); params.append(float(min_price))
        if max_price: conds.append('p.price <= ?'); params.append(float(max_price))

        where = (' WHERE ' + ' AND '.join(conds)) if conds else ''
        db = get_db()
        total_row = db.execute(f'SELECT COUNT(*) {base}{where}', params).fetchone()
        total = total_row[0] if total_row else 0
        offset = (page - 1) * limit
        rows = rows_to_list(db.execute(f'SELECT p.* {base}{where} ORDER BY {sort_col} {order_dir} LIMIT ? OFFSET ?', params + [limit, offset]).fetchall())
        rows = self.enrich_product_list(rows, db)
        db.close()
        self.send_json({'products': rows, 'total': total, 'page': page, 'limit': limit})

    def _get_product_full(self, product, db):
        pid = product['id']
        product['images'] = rows_to_list(db.execute('SELECT * FROM product_images WHERE product_id=? ORDER BY sort_order', (pid,)).fetchall())
        product['variants'] = rows_to_list(db.execute('SELECT * FROM product_variants WHERE product_id=?', (pid,)).fetchall())
        cat = row_to_dict(db.execute('SELECT * FROM categories WHERE id=?', (product['category_id'],)).fetchone()) if product.get('category_id') else None
        product['category'] = cat
        reviews = rows_to_list(db.execute('''
            SELECT r.*, u.name as user_name FROM reviews r
            JOIN users u ON r.user_id = u.id WHERE r.product_id=? ORDER BY r.created_at DESC
        ''', (pid,)).fetchall())
        product['reviews'] = reviews
        product['avg_rating'] = round(sum(r['rating'] for r in reviews) / len(reviews), 1) if reviews else 0
        product['review_count'] = len(reviews)
        return product

    def get_product_by_slug(self, slug):
        db = get_db()
        p = row_to_dict(db.execute('SELECT * FROM products WHERE slug=?', (slug,)).fetchone())
        if not p: db.close(); return self.send_json({'error': 'Not found'}, 404)
        self.send_json(self._get_product_full(p, db))
        db.close()

    def get_product_by_id(self, pid):
        db = get_db()
        p = row_to_dict(db.execute('SELECT * FROM products WHERE id=?', (pid,)).fetchone())
        if not p: db.close(); return self.send_json({'error': 'Not found'}, 404)
        self.send_json(self._get_product_full(p, db))
        db.close()

    # ── Cart handlers ──────────────────────────────────────────────

    def _cart_items(self, user_id, db):
        return rows_to_list(db.execute('''
            SELECT ci.*, p.name, p.price, p.slug,
                pi.image_url as primary_image, pv.color, pv.size, pv.color_hex
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
            LEFT JOIN product_variants pv ON ci.variant_id = pv.id
            WHERE ci.user_id = ?
        ''', (user_id,)).fetchall())

    def get_cart(self):
        user = self.require_auth()
        if not user: return
        db = get_db()
        items = self._cart_items(user['id'], db)
        db.close()
        subtotal = sum(i['price'] * i['quantity'] for i in items)
        count = sum(i['quantity'] for i in items)
        self.send_json({'items': items, 'subtotal': subtotal, 'count': count})

    def cart_add(self):
        user = self.require_auth()
        if not user: return
        b = self.get_body()
        pid = b.get('product_id'); vid = b.get('variant_id'); qty = b.get('quantity', 1)
        if not pid: return self.send_json({'error': 'product_id required'}, 400)
        db = get_db()
        if not db.execute('SELECT id FROM products WHERE id=?', (pid,)).fetchone():
            db.close(); return self.send_json({'error': 'Product not found'}, 404)
        existing = db.execute('SELECT * FROM cart_items WHERE user_id=? AND product_id=? AND variant_id IS ?', (user['id'], pid, vid)).fetchone()
        if existing:
            db.execute('UPDATE cart_items SET quantity = quantity + ? WHERE id=?', (qty, existing['id']))
        else:
            db.execute('INSERT INTO cart_items (id, user_id, product_id, variant_id, quantity) VALUES (?,?,?,?,?)',
                (str(uuid.uuid4()), user['id'], pid, vid, qty))
        db.commit()
        items = self._cart_items(user['id'], db)
        db.close()
        self.send_json({'items': items, 'count': sum(i['quantity'] for i in items)})

    def cart_update(self, item_id):
        user = self.require_auth()
        if not user: return
        b = self.get_body()
        qty = b.get('quantity', 1)
        db = get_db()
        if qty < 1:
            db.execute('DELETE FROM cart_items WHERE id=? AND user_id=?', (item_id, user['id']))
        else:
            db.execute('UPDATE cart_items SET quantity=? WHERE id=? AND user_id=?', (qty, item_id, user['id']))
        db.commit()
        items = self._cart_items(user['id'], db)
        db.close()
        self.send_json({'items': items, 'count': sum(i['quantity'] for i in items)})

    def cart_remove(self, item_id):
        user = self.require_auth()
        if not user: return
        db = get_db()
        db.execute('DELETE FROM cart_items WHERE id=? AND user_id=?', (item_id, user['id']))
        db.commit()
        items = self._cart_items(user['id'], db)
        db.close()
        self.send_json({'items': items, 'count': sum(i['quantity'] for i in items)})

    def cart_clear(self):
        user = self.require_auth()
        if not user: return
        db = get_db()
        db.execute('DELETE FROM cart_items WHERE user_id=?', (user['id'],))
        db.commit(); db.close()
        self.send_json({'items': [], 'count': 0})

    # ── Wishlist ───────────────────────────────────────────────────

    def get_wishlist(self):
        user = self.require_auth()
        if not user: return
        db = get_db()
        items = rows_to_list(db.execute('''
            SELECT w.*, p.name, p.price, p.original_price, p.slug,
                pi.image_url as primary_image
            FROM wishlist w JOIN products p ON w.product_id = p.id
            LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
            WHERE w.user_id=? ORDER BY w.created_at DESC
        ''', (user['id'],)).fetchall())
        db.close()
        self.send_json(items)

    def wishlist_toggle(self):
        user = self.require_auth()
        if not user: return
        pid = self.get_body().get('product_id')
        db = get_db()
        existing = db.execute('SELECT id FROM wishlist WHERE user_id=? AND product_id=?', (user['id'], pid)).fetchone()
        if existing:
            db.execute('DELETE FROM wishlist WHERE id=?', (existing['id'],))
            db.commit(); db.close()
            self.send_json({'wishlisted': False})
        else:
            db.execute('INSERT INTO wishlist (id, user_id, product_id) VALUES (?,?,?)', (str(uuid.uuid4()), user['id'], pid))
            db.commit(); db.close()
            self.send_json({'wishlisted': True})

    # ── Orders ─────────────────────────────────────────────────────

    def get_orders(self):
        user = self.require_auth()
        if not user: return
        db = get_db()
        orders = rows_to_list(db.execute('''
            SELECT o.*, COUNT(oi.id) as item_count FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id=? GROUP BY o.id ORDER BY o.created_at DESC
        ''', (user['id'],)).fetchall())
        db.close()
        self.send_json(orders)

    def get_order(self, order_id):
        user = self.require_auth()
        if not user: return
        db = get_db()
        order = row_to_dict(db.execute('SELECT * FROM orders WHERE id=? AND user_id=?', (order_id, user['id'])).fetchone())
        if not order: db.close(); return self.send_json({'error': 'Not found'}, 404)
        items = rows_to_list(db.execute('''
            SELECT oi.*, p.name, p.slug, pi.image_url as primary_image, pv.color, pv.size
            FROM order_items oi JOIN products p ON oi.product_id = p.id
            LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
            LEFT JOIN product_variants pv ON oi.variant_id = pv.id
            WHERE oi.order_id=?
        ''', (order_id,)).fetchall())
        address = row_to_dict(db.execute('SELECT * FROM addresses WHERE id=?', (order['address_id'],)).fetchone()) if order.get('address_id') else None
        db.close()
        order['items'] = items; order['address'] = address
        self.send_json(order)

    def create_order(self):
        user = self.require_auth()
        if not user: return
        b = self.get_body()
        db = get_db()
        cart = rows_to_list(db.execute('SELECT ci.*, p.price FROM cart_items ci JOIN products p ON ci.product_id=p.id WHERE ci.user_id=?', (user['id'],)).fetchall())
        if not cart: db.close(); return self.send_json({'error': 'Cart is empty'}, 400)

        subtotal = sum(i['price'] * i['quantity'] for i in cart)
        discount = 0
        shipping = 0 if subtotal >= 999 else 99
        coupon_code = b.get('coupon_code')

        if coupon_code:
            c = row_to_dict(db.execute('SELECT * FROM coupons WHERE code=? AND is_active=1', (coupon_code,)).fetchone())
            if c:
                discount = (subtotal * c['discount_value'] / 100) if c['discount_type'] == 'percentage' else c['discount_value']
                db.execute('UPDATE coupons SET used_count = used_count + 1 WHERE id=?', (c['id'],))

        total = subtotal - discount + shipping
        oid = str(uuid.uuid4())
        db.execute('INSERT INTO orders (id, user_id, address_id, total_amount, discount_amount, shipping_amount, payment_method, coupon_code, notes) VALUES (?,?,?,?,?,?,?,?,?)',
            (oid, user['id'], b.get('address_id'), total, discount, shipping, b.get('payment_method','cod'), coupon_code, b.get('notes')))
        for item in cart:
            db.execute('INSERT INTO order_items (id, order_id, product_id, variant_id, quantity, price) VALUES (?,?,?,?,?,?)',
                (str(uuid.uuid4()), oid, item['product_id'], item['variant_id'], item['quantity'], item['price']))
        db.execute('DELETE FROM cart_items WHERE user_id=?', (user['id'],))
        db.commit(); db.close()
        self.send_json({'order_id': oid, 'total': total, 'message': 'Order placed successfully'}, 201)

    # ── Reviews ────────────────────────────────────────────────────

    def create_review(self):
        user = self.require_auth()
        if not user: return
        b = self.get_body()
        if not b.get('product_id') or not b.get('rating'):
            return self.send_json({'error': 'product_id and rating required'}, 400)
        db = get_db()
        db.execute('INSERT OR REPLACE INTO reviews (id, product_id, user_id, rating, title, body) VALUES (?,?,?,?,?,?)',
            (str(uuid.uuid4()), b['product_id'], user['id'], b['rating'], b.get('title'), b.get('body')))
        db.commit(); db.close()
        self.send_json({'message': 'Review submitted'}, 201)

    def get_reviews(self, product_id):
        db = get_db()
        reviews = rows_to_list(db.execute('''
            SELECT r.*, u.name as user_name FROM reviews r
            JOIN users u ON r.user_id = u.id WHERE r.product_id=? ORDER BY r.created_at DESC
        ''', (product_id,)).fetchall())
        db.close()
        self.send_json(reviews)

    # ── Addresses ──────────────────────────────────────────────────

    def get_addresses(self):
        user = self.require_auth()
        if not user: return
        db = get_db()
        addrs = rows_to_list(db.execute('SELECT * FROM addresses WHERE user_id=?', (user['id'],)).fetchall())
        db.close(); self.send_json(addrs)

    def create_address(self):
        user = self.require_auth()
        if not user: return
        b = self.get_body()
        db = get_db()
        if b.get('is_default'):
            db.execute('UPDATE addresses SET is_default=0 WHERE user_id=?', (user['id'],))
        aid = str(uuid.uuid4())
        db.execute('INSERT INTO addresses (id, user_id, name, phone, address_line1, address_line2, city, state, pincode, is_default) VALUES (?,?,?,?,?,?,?,?,?,?)',
            (aid, user['id'], b.get('name'), b.get('phone'), b.get('address_line1'), b.get('address_line2'), b.get('city'), b.get('state'), b.get('pincode'), 1 if b.get('is_default') else 0))
        db.commit(); db.close()
        self.send_json({'id': aid}, 201)

    def update_address(self, aid):
        user = self.require_auth()
        if not user: return
        b = self.get_body()
        db = get_db()
        if b.get('is_default'):
            db.execute('UPDATE addresses SET is_default=0 WHERE user_id=?', (user['id'],))
        db.execute('UPDATE addresses SET name=?,phone=?,address_line1=?,address_line2=?,city=?,state=?,pincode=?,is_default=? WHERE id=? AND user_id=?',
            (b.get('name'), b.get('phone'), b.get('address_line1'), b.get('address_line2'), b.get('city'), b.get('state'), b.get('pincode'), 1 if b.get('is_default') else 0, aid, user['id']))
        db.commit(); db.close()
        self.send_json({'message': 'Updated'})

    def delete_address(self, aid):
        user = self.require_auth()
        if not user: return
        db = get_db()
        db.execute('DELETE FROM addresses WHERE id=? AND user_id=?', (aid, user['id']))
        db.commit(); db.close()
        self.send_json({'message': 'Deleted'})

    # ── Coupons ────────────────────────────────────────────────────

    def validate_coupon(self):
        user = self.require_auth()
        if not user: return
        b = self.get_body()
        code = b.get('code'); cart_total = b.get('cart_total', 0)
        db = get_db()
        c = row_to_dict(db.execute('SELECT * FROM coupons WHERE code=? AND is_active=1', (code,)).fetchone())
        db.close()
        if not c: return self.send_json({'error': 'Invalid coupon code'}, 404)
        if c['max_uses'] != -1 and c['used_count'] >= c['max_uses']:
            return self.send_json({'error': 'Coupon usage limit reached'}, 400)
        if cart_total < c['min_order_amount']:
            return self.send_json({'error': f"Minimum order amount is ₹{c['min_order_amount']}"}, 400)
        discount = (cart_total * c['discount_value'] / 100) if c['discount_type'] == 'percentage' else c['discount_value']
        self.send_json({'valid': True, 'discount': discount, 'discount_type': c['discount_type'], 'discount_value': c['discount_value']})


if __name__ == '__main__':
    init_db()
    print(f"Hastavastra API → http://localhost:{PORT}")
    server = HTTPServer(('0.0.0.0', PORT), RequestHandler)
    server.serve_forever()
