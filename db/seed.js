const db = require('./database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Skip if already seeded
const existing = db.prepare('SELECT COUNT(*) as c FROM products').get();
if (existing.c > 0) { console.log('Database already seeded.'); process.exit(0); }

console.log('Seeding database...');

const categories = [
  { id: uuidv4(), name: 'Sarees', slug: 'sarees', description: 'Handcrafted Indian sarees', image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
  { id: uuidv4(), name: 'Kurtas', slug: 'kurtas', description: 'Elegant kurtas for women', image_url: 'https://images.unsplash.com/photo-1583391733981-8498408ee4b6?w=600' },
  { id: uuidv4(), name: 'Dupattas', slug: 'dupattas', description: 'Beautiful dupattas', image_url: 'https://images.unsplash.com/photo-1617627143233-1b5e2e69e6c0?w=600' },
  { id: uuidv4(), name: 'Suits', slug: 'suits', description: 'Salwar suits and sets', image_url: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600' },
  { id: uuidv4(), name: 'Bottoms', slug: 'bottoms', description: 'Palazzo, skirts and more', image_url: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=600' },
];
const insertCat = db.prepare('INSERT OR IGNORE INTO categories (id,name,slug,description,image_url) VALUES (?,?,?,?,?)');
categories.forEach(c => insertCat.run(c.id, c.name, c.slug, c.description, c.image_url));

const catMap = {};
db.prepare('SELECT id, slug FROM categories').all().forEach(c => { catMap[c.slug] = c.id; });

const products = [
  { name:'Chanderi Silk Saree', slug:'chanderi-silk-saree', desc:'A timeless Chanderi silk saree with intricate zari work. Perfect for festive occasions and weddings. The lightweight fabric ensures comfort while the rich texture speaks volumes about craftsmanship.', price:3499, orig:4999, cat:'sarees', fabric:'Chanderi Silk', care:'Dry clean only', featured:1, isNew:1, stock:50, colors:[['Rose Pink','#FF69B4'],['Sage Green','#8FBC8F'],['Ivory','#FFFFF0']], sizes:['Free Size'], images:['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800','https://images.unsplash.com/photo-1617627143233-1b5e2e69e6c0?w=800'] },
  { name:'Cotton Linen Kurta', slug:'cotton-linen-kurta', desc:'Breezy cotton linen kurta perfect for everyday wear. Features delicate hand-block prints using natural dyes. Pair with palazzo or straight pants for a complete ethnic look.', price:1299, orig:1899, cat:'kurtas', fabric:'Cotton Linen', care:'Machine wash cold', featured:1, isNew:0, stock:80, colors:[['Indigo Blue','#4B0082'],['Terracotta','#E2725B'],['Mustard','#FFDB58']], sizes:['XS','S','M','L','XL','XXL'], images:['https://images.unsplash.com/photo-1583391733981-8498408ee4b6?w=800','https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800'] },
  { name:'Handloom Cotton Saree', slug:'handloom-cotton-saree', desc:'Authentic handloom cotton saree woven by master weavers. Each piece is unique with traditional motifs. Ideal for daily wear and casual outings.', price:2199, orig:2999, cat:'sarees', fabric:'Handloom Cotton', care:'Hand wash recommended', featured:0, isNew:1, stock:35, colors:[['Navy Blue','#000080'],['Brick Red','#CB4154']], sizes:['Free Size'], images:['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800'] },
  { name:'Embroidered Dupatta', slug:'embroidered-dupatta', desc:'Exquisitely hand-embroidered dupatta using traditional techniques. The fine thread work adds elegance to any outfit. Perfect as a gift or personal indulgence.', price:899, orig:1299, cat:'dupattas', fabric:'Georgette', care:'Dry clean only', featured:1, isNew:1, stock:60, colors:[['Peach','#FFDAB9'],['Sky Blue','#87CEEB'],['Lavender','#E6E6FA']], sizes:['Free Size'], images:['https://images.unsplash.com/photo-1617627143233-1b5e2e69e6c0?w=800'] },
  { name:'Palazzo Pants Set', slug:'palazzo-pants-set', desc:'Flowy palazzo pants in premium cotton blend with a matching kurta. The wide-leg silhouette ensures comfort while the print makes it perfect for casual and semi-formal occasions.', price:1799, orig:2499, cat:'suits', fabric:'Cotton Blend', care:'Machine wash', featured:0, isNew:1, stock:45, colors:[['Teal','#008080'],['Coral','#FF7F50']], sizes:['S','M','L','XL'], images:['https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800'] },
  { name:'Banarasi Silk Saree', slug:'banarasi-silk-saree', desc:'Royal Banarasi silk saree with gold zari weaving. A prized possession for weddings and celebrations. The opulent fabric and intricate patterns reflect centuries of weaving tradition.', price:8999, orig:12999, cat:'sarees', fabric:'Banarasi Silk', care:'Dry clean only', featured:1, isNew:0, stock:20, colors:[['Deep Red','#8B0000'],['Royal Purple','#7B2FBE'],['Gold','#FFD700']], sizes:['Free Size'], images:['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800'] },
  { name:'Block Print Skirt', slug:'block-print-skirt', desc:'Vibrant hand-block printed flared skirt. Made from soft cotton with natural dyes. Style it with a plain kurta or crop top for a boho-chic look.', price:1099, orig:1499, cat:'bottoms', fabric:'Cotton', care:'Machine wash cold', featured:0, isNew:1, stock:55, colors:[['Rust','#B7410E'],['Forest Green','#228B22']], sizes:['XS','S','M','L','XL'], images:['https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800'] },
  { name:'Ikat Silk Dupatta', slug:'ikat-silk-dupatta', desc:"Authentic Ikat woven silk dupatta with geometric patterns. Each thread is individually dyed before weaving to create the distinctive blurred pattern. A collector's piece.", price:1499, orig:2199, cat:'dupattas', fabric:'Ikat Silk', care:'Dry clean only', featured:1, isNew:0, stock:30, colors:[['Black & White','#808080'],['Blue & White','#4169E1']], sizes:['Free Size'], images:['https://images.unsplash.com/photo-1617627143233-1b5e2e69e6c0?w=800'] },
];

const insertProduct = db.prepare('INSERT OR IGNORE INTO products (id,name,slug,description,price,original_price,category_id,fabric,care_instructions,is_featured,is_new_arrival,stock) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
const insertImage = db.prepare('INSERT OR IGNORE INTO product_images (id,product_id,image_url,is_primary,sort_order) VALUES (?,?,?,?,?)');
const insertVariant = db.prepare('INSERT OR IGNORE INTO product_variants (id,product_id,size,color,color_hex,stock) VALUES (?,?,?,?,?,?)');

products.forEach(p => {
  const pid = uuidv4();
  insertProduct.run(pid, p.name, p.slug, p.desc, p.price, p.orig, catMap[p.cat], p.fabric, p.care, p.featured, p.isNew, p.stock);
  p.images.forEach((img, i) => insertImage.run(uuidv4(), pid, img, i === 0 ? 1 : 0, i));
  p.colors.forEach(([color, hex]) => p.sizes.forEach(size => insertVariant.run(uuidv4(), pid, size, color, hex, Math.floor(Math.random() * 15) + 5)));
});

// Users
db.prepare('INSERT OR IGNORE INTO users (id,name,email,password,role) VALUES (?,?,?,?,?)').run(uuidv4(), 'Admin User', 'admin@hastavastra.com', bcrypt.hashSync('admin123', 10), 'admin');
db.prepare('INSERT OR IGNORE INTO users (id,name,email,password,role) VALUES (?,?,?,?,?)').run(uuidv4(), 'Test User', 'test@example.com', bcrypt.hashSync('test123', 10), 'customer');

// Coupons
const insertCoupon = db.prepare('INSERT OR IGNORE INTO coupons (id,code,discount_type,discount_value,min_order_amount) VALUES (?,?,?,?,?)');
insertCoupon.run(uuidv4(), 'WELCOME10', 'percentage', 10, 500);
insertCoupon.run(uuidv4(), 'FLAT200', 'fixed', 200, 1000);
insertCoupon.run(uuidv4(), 'FIRST15', 'percentage', 15, 0);

console.log('✓ Database seeded successfully!');
