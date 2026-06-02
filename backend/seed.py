import uuid, hashlib, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from database import get_db, init_db

def hash_password(password):
    salt = os.urandom(32)
    key = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
    return salt.hex() + ':' + key.hex()

init_db()
conn = get_db()

categories = [
    (str(uuid.uuid4()), 'Sarees', 'sarees', 'Handcrafted Indian sarees', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'),
    (str(uuid.uuid4()), 'Kurtas', 'kurtas', 'Elegant kurtas for women', 'https://images.unsplash.com/photo-1583391733981-8498408ee4b6?w=600'),
    (str(uuid.uuid4()), 'Dupattas', 'dupattas', 'Beautiful dupattas', 'https://images.unsplash.com/photo-1617627143233-1b5e2e69e6c0?w=600'),
    (str(uuid.uuid4()), 'Suits', 'suits', 'Salwar suits and sets', 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600'),
    (str(uuid.uuid4()), 'Bottoms', 'bottoms', 'Palazzo, skirts and more', 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=600'),
]
for c in categories:
    conn.execute('INSERT OR IGNORE INTO categories (id, name, slug, description, image_url) VALUES (?, ?, ?, ?, ?)', c)

conn.commit()
cat_map = {row['slug']: row['id'] for row in conn.execute('SELECT id, slug FROM categories').fetchall()}

products = [
    {
        'name': 'Chanderi Silk Saree', 'slug': 'chanderi-silk-saree',
        'desc': 'A timeless Chanderi silk saree with intricate zari work. Perfect for festive occasions and weddings. The lightweight fabric ensures comfort while the rich texture speaks volumes about craftsmanship.',
        'price': 3499, 'orig': 4999, 'cat': 'sarees', 'fabric': 'Chanderi Silk', 'care': 'Dry clean only',
        'featured': 1, 'new': 1, 'stock': 50,
        'colors': [('Rose Pink','#FF69B4'), ('Sage Green','#8FBC8F'), ('Ivory','#FFFFF0')],
        'sizes': ['Free Size'],
        'images': ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800','https://images.unsplash.com/photo-1617627143233-1b5e2e69e6c0?w=800'],
    },
    {
        'name': 'Cotton Linen Kurta', 'slug': 'cotton-linen-kurta',
        'desc': 'Breezy cotton linen kurta perfect for everyday wear. Features delicate hand-block prints using natural dyes. Pair with palazzo or straight pants for a complete ethnic look.',
        'price': 1299, 'orig': 1899, 'cat': 'kurtas', 'fabric': 'Cotton Linen', 'care': 'Machine wash cold',
        'featured': 1, 'new': 0, 'stock': 80,
        'colors': [('Indigo Blue','#4B0082'), ('Terracotta','#E2725B'), ('Mustard','#FFDB58')],
        'sizes': ['XS','S','M','L','XL','XXL'],
        'images': ['https://images.unsplash.com/photo-1583391733981-8498408ee4b6?w=800','https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800'],
    },
    {
        'name': 'Handloom Cotton Saree', 'slug': 'handloom-cotton-saree',
        'desc': 'Authentic handloom cotton saree woven by master weavers. Each piece is unique with traditional motifs. Ideal for daily wear and casual outings.',
        'price': 2199, 'orig': 2999, 'cat': 'sarees', 'fabric': 'Handloom Cotton', 'care': 'Hand wash recommended',
        'featured': 0, 'new': 1, 'stock': 35,
        'colors': [('Navy Blue','#000080'), ('Brick Red','#CB4154')],
        'sizes': ['Free Size'],
        'images': ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800'],
    },
    {
        'name': 'Embroidered Dupatta', 'slug': 'embroidered-dupatta',
        'desc': 'Exquisitely hand-embroidered dupatta using traditional techniques. The fine thread work adds elegance to any outfit.',
        'price': 899, 'orig': 1299, 'cat': 'dupattas', 'fabric': 'Georgette', 'care': 'Dry clean only',
        'featured': 1, 'new': 1, 'stock': 60,
        'colors': [('Peach','#FFDAB9'), ('Sky Blue','#87CEEB'), ('Lavender','#E6E6FA')],
        'sizes': ['Free Size'],
        'images': ['https://images.unsplash.com/photo-1617627143233-1b5e2e69e6c0?w=800'],
    },
    {
        'name': 'Palazzo Pants Set', 'slug': 'palazzo-pants-set',
        'desc': 'Flowy palazzo pants in premium cotton blend. Comes with a matching kurta. The wide-leg silhouette ensures comfort while the print makes it perfect for casual and semi-formal occasions.',
        'price': 1799, 'orig': 2499, 'cat': 'suits', 'fabric': 'Cotton Blend', 'care': 'Machine wash',
        'featured': 0, 'new': 1, 'stock': 45,
        'colors': [('Teal','#008080'), ('Coral','#FF7F50')],
        'sizes': ['S','M','L','XL'],
        'images': ['https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800'],
    },
    {
        'name': 'Banarasi Silk Saree', 'slug': 'banarasi-silk-saree',
        'desc': 'Royal Banarasi silk saree with gold zari weaving. A prized possession for weddings and celebrations.',
        'price': 8999, 'orig': 12999, 'cat': 'sarees', 'fabric': 'Banarasi Silk', 'care': 'Dry clean only',
        'featured': 1, 'new': 0, 'stock': 20,
        'colors': [('Deep Red','#8B0000'), ('Royal Purple','#7B2FBE'), ('Gold','#FFD700')],
        'sizes': ['Free Size'],
        'images': ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800'],
    },
    {
        'name': 'Block Print Skirt', 'slug': 'block-print-skirt',
        'desc': 'Vibrant hand-block printed flared skirt. Made from soft cotton with natural dyes.',
        'price': 1099, 'orig': 1499, 'cat': 'bottoms', 'fabric': 'Cotton', 'care': 'Machine wash cold',
        'featured': 0, 'new': 1, 'stock': 55,
        'colors': [('Rust','#B7410E'), ('Forest Green','#228B22')],
        'sizes': ['XS','S','M','L','XL'],
        'images': ['https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800'],
    },
    {
        'name': 'Ikat Silk Dupatta', 'slug': 'ikat-silk-dupatta',
        'desc': 'Authentic Ikat woven silk dupatta with geometric patterns. Each thread is individually dyed before weaving.',
        'price': 1499, 'orig': 2199, 'cat': 'dupattas', 'fabric': 'Ikat Silk', 'care': 'Dry clean only',
        'featured': 1, 'new': 0, 'stock': 30,
        'colors': [('Black & White','#808080'), ('Blue & White','#4169E1')],
        'sizes': ['Free Size'],
        'images': ['https://images.unsplash.com/photo-1617627143233-1b5e2e69e6c0?w=800'],
    },
]

import random
for p in products:
    pid = str(uuid.uuid4())
    conn.execute('INSERT OR IGNORE INTO products (id, name, slug, description, price, original_price, category_id, fabric, care_instructions, is_featured, is_new_arrival, stock) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
        (pid, p['name'], p['slug'], p['desc'], p['price'], p['orig'], cat_map.get(p['cat']), p['fabric'], p['care'], p['featured'], p['new'], p['stock']))
    for i, img in enumerate(p['images']):
        conn.execute('INSERT OR IGNORE INTO product_images (id, product_id, image_url, is_primary, sort_order) VALUES (?,?,?,?,?)',
            (str(uuid.uuid4()), pid, img, 1 if i==0 else 0, i))
    for color, hex_val in p['colors']:
        for size in p['sizes']:
            conn.execute('INSERT OR IGNORE INTO product_variants (id, product_id, size, color, color_hex, stock) VALUES (?,?,?,?,?,?)',
                (str(uuid.uuid4()), pid, size, color, hex_val, random.randint(5, 20)))

conn.commit()

# Admin + test user
for email, name, pwd, role in [('admin@hastavastra.com','Admin User','admin123','admin'), ('test@example.com','Test User','test123','customer')]:
    conn.execute('INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES (?,?,?,?,?)',
        (str(uuid.uuid4()), name, email, hash_password(pwd), role))

# Coupons
for code, dtype, val, min_amt in [('WELCOME10','percentage',10,500), ('FLAT200','fixed',200,1000), ('FIRST15','percentage',15,0)]:
    conn.execute('INSERT OR IGNORE INTO coupons (id, code, discount_type, discount_value, min_order_amount) VALUES (?,?,?,?,?)',
        (str(uuid.uuid4()), code, dtype, val, min_amt))

conn.commit()
conn.close()
print("Database seeded successfully!")
