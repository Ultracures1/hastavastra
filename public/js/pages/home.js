async function renderHome() {
  const main = document.getElementById('main');
  main.innerHTML = `
    <section class="hero">
      <div class="hero-content">
        <p class="hero-sub">New Collection 2024</p>
        <h1 class="hero-title">Wear the Art<br>of India</h1>
        <p class="hero-desc">Handcrafted sarees, kurtas & more by skilled artisans across India. Each piece tells a story of tradition and craftsmanship.</p>
        <div class="hero-ctas">
          <a data-link href="/shop" class="btn-primary">Explore Collection</a>
          <a data-link href="/shop?new_arrival=true" class="btn-outline">New Arrivals</a>
        </div>
      </div>
      <div class="hero-image">
        <img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80" alt="Indian ethnic wear"/>
      </div>
    </section>
    <section class="features-strip">
      ${[
        ['<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>', 'Free Shipping', 'On orders above ₹999'],
        ['<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>', 'Handcrafted', 'By skilled artisans'],
        ['<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>', 'Made in India', 'Sustainable practices'],
        ['<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.77"/></svg>', 'Easy Returns', '15-day return policy'],
      ].map(([icon, t, s]) => `<div class="feature-item">${icon}<div><strong>${t}</strong><span>${s}</span></div></div>`).join('')}
    </section>
    <section class="section" id="categoriesSection">
      <div class="container">
        <div class="section-header"><h2>Shop by Category</h2><a data-link href="/shop">View All →</a></div>
        <div class="categories-grid" id="categoriesGrid">
          ${[1,2,3,4,5].map(() => '<div class="skeleton-card"></div>').join('')}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-header"><h2>Featured Pieces</h2><a data-link href="/shop?featured=true">View All →</a></div>
        <div class="product-grid" id="featuredGrid">
          ${[1,2,3,4].map(() => '<div class="skeleton-card"></div>').join('')}
        </div>
      </div>
    </section>
    <section class="banner-section">
      <div class="banner-content">
        <p class="sub">Handcrafted Collection</p>
        <h2>The Art of Indian Weaving</h2>
        <p class="banner-desc">From the looms of Varanasi to the block printers of Jaipur — every thread carries centuries of tradition.</p>
        <a data-link href="/shop" class="btn-banner">Discover Now</a>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-header"><h2>New Arrivals</h2><a data-link href="/shop?new_arrival=true">View All →</a></div>
        <div class="product-grid" id="newArrivalsGrid">
          ${[1,2,3,4].map(() => '<div class="skeleton-card"></div>').join('')}
        </div>
      </div>
    </section>
    <section class="testimonials-section">
      <div class="container">
        <h2 class="testimonials-title">What Our Customers Say</h2>
        <div class="testimonials-grid">
          ${[
            { name: 'Priya Sharma', text: 'The Chanderi saree I ordered is absolutely stunning. The quality is exceptional and delivery was prompt!', r: 5 },
            { name: 'Ananya Gupta', text: 'Love the block print kurta! The colors are vibrant and fabric is so soft. Will definitely order again.', r: 5 },
            { name: 'Meera Nair', text: 'Gorgeous collection with authentic Indian craftsmanship. The packaging was also very thoughtful.', r: 5 },
          ].map(t => `
            <div class="testimonial-card">
              <div class="stars-gold">${'★'.repeat(t.r)}</div>
              <p>"${t.text}"</p>
              <strong>— ${t.name}</strong>
            </div>`).join('')}
        </div>
      </div>
    </section>
  `;
  Router.bindLinks();

  // Load data
  const [catRes, featRes, newRes] = await Promise.all([
    api.get('/categories').catch(() => []),
    api.get('/products?featured=true&limit=4').catch(() => ({ products: [] })),
    api.get('/products?new_arrival=true&limit=4').catch(() => ({ products: [] })),
  ]);

  const catGrid = document.getElementById('categoriesGrid');
  if (catGrid) {
    catGrid.innerHTML = catRes.map(c => `
      <a data-link href="/shop?category=${c.slug}" class="category-card">
        <div class="category-img"><img src="${c.image_url}" alt="${c.name}" loading="lazy"/></div>
        <div class="category-info"><strong>${c.name}</strong><span>${c.product_count} Products</span></div>
      </a>`).join('');
  }

  const featGrid = document.getElementById('featuredGrid');
  if (featGrid) {
    featGrid.innerHTML = featRes.products.map(productCardHTML).join('');
    bindProductCards(featGrid);
  }
  const newGrid = document.getElementById('newArrivalsGrid');
  if (newGrid) {
    newGrid.innerHTML = newRes.products.map(productCardHTML).join('');
    bindProductCards(newGrid);
  }
  Router.bindLinks();
}
