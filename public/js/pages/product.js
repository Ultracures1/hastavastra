async function renderProduct(qs, slug) {
  const main = document.getElementById('main');
  main.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;

  let product;
  try { product = await api.get('/products/' + slug); }
  catch(e) { main.innerHTML = '<div style="text-align:center;padding:80px"><h2>Product not found</h2><a data-link href="/shop" style="color:var(--accent)">Back to Shop</a></div>'; Router.bindLinks(); return; }

  const colors = [...new Set(product.variants.map(v => v.color))];
  const sizes = [...new Set(product.variants.map(v => v.size))];
  let selColor = colors[0] || null;
  let selSize = sizes[0] || null;
  let selVariant = null;
  let qty = 1;
  let activeImg = 0;
  let reviewRating = 5;

  function findVariant() {
    return product.variants.find(v => v.color === selColor && v.size === selSize) || null;
  }
  function colorHex(color) {
    return product.variants.find(v => v.color === color)?.color_hex || '#ccc';
  }
  function discount() { return getDiscount(product.price, product.original_price); }

  function render() {
    const disc = discount();
    const wishlisted = WishlistAPI.isWishlisted(product.id);
    selVariant = findVariant();
    const imgSrc = product.images[activeImg]?.image_url || product.images[0]?.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800';

    main.innerHTML = `
      <div class="product-page">
        <div class="breadcrumb">
          <a data-link href="/">Home</a> / <a data-link href="/shop">Shop</a>
          ${product.category ? ` / <a data-link href="/shop?category=${product.category.slug}">${product.category.name}</a>` : ''} / <span>${product.name}</span>
        </div>
        <div class="product-layout">
          <div class="gallery">
            <div class="thumbnails">
              ${product.images.map((img, i) => `<button class="thumb ${i === activeImg ? 'active' : ''}" data-thumb="${i}"><img src="${img.image_url}" alt="${product.name} ${i+1}"/></button>`).join('')}
            </div>
            <div class="main-image">
              <img src="${imgSrc}" alt="${product.name}" id="mainProductImg"/>
              ${disc > 0 ? `<span class="discount-badge">${disc}% OFF</span>` : ''}
            </div>
          </div>
          <div class="product-info-panel">
            ${product.category ? `<p class="cat-label">${product.category.name}</p>` : ''}
            <h1 class="product-title">${product.name}</h1>
            <div class="star-rating" style="margin-bottom:16px">
              ${starsHTML(product.avg_rating)}
              <span style="font-size:13px;color:var(--mid-gray);margin-left:6px">${product.avg_rating ? product.avg_rating.toFixed(1) : 'No reviews'} ${product.review_count > 0 ? `(${product.review_count} reviews)` : ''}</span>
            </div>
            <div class="price-row">
              <span class="price-large">${formatPrice(product.price)}</span>
              ${disc > 0 ? `<span class="original-price" style="font-size:16px">${formatPrice(product.original_price)}</span><span class="save-badge">Save ${disc}%</span>` : ''}
            </div>
            ${colors.length ? `
            <div class="option-group">
              <div class="option-label">Colour: <strong>${selColor || ''}</strong></div>
              <div class="color-options">
                ${colors.map(c => `<button class="color-swatch ${selColor === c ? 'selected' : ''}" style="background:${colorHex(c)}" data-color="${c}" title="${c}"></button>`).join('')}
              </div>
            </div>` : ''}
            ${sizes.length && sizes[0] !== 'Free Size' ? `
            <div class="option-group">
              <div class="option-label">Size: <strong>${selSize || ''}</strong></div>
              <div class="size-options">
                ${sizes.map(s => `<button class="size-btn ${selSize === s ? 'selected' : ''}" data-size="${s}">${s}</button>`).join('')}
              </div>
              <a href="#" class="size-guide-link">Size Guide →</a>
            </div>` : ''}
            <div class="qty-row">
              <div class="qty-selector">
                <button id="qtyDown">−</button><span id="qtyVal">${qty}</span><button id="qtyUp">+</button>
              </div>
              <button class="btn-add-cart" id="addToCartBtn">Add to Bag</button>
              <button class="btn-wishlist ${wishlisted ? 'wishlisted' : ''}" id="wishlistBtn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="${wishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
            </div>
            <div class="delivery-info">
              <div><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg><span>Free delivery on orders above ₹999</span></div>
              <div><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.77"/></svg><span>Easy 15-day returns & exchanges</span></div>
            </div>
          </div>
        </div>
        <div class="tabs">
          <button class="tab active" data-tab="description">Description</button>
          <button class="tab" data-tab="details">Details & Care</button>
          <button class="tab" data-tab="reviews">Reviews (${product.review_count})</button>
        </div>
        <div class="tab-content" id="tabContent"></div>
        ${product.category ? `<div class="related-section" id="relatedSection"><h2>You May Also Like</h2><div class="related-grid" id="relatedGrid">${Array(4).fill('<div class="skeleton-card"></div>').join('')}</div></div>` : ''}
      </div>
    `;

    showTab('description');
    bindEvents();
    Router.bindLinks();

    // Load related
    if (product.category) {
      api.get(`/products?category=${product.category.slug}&limit=5`).then(data => {
        const related = data.products.filter(p => p.id !== product.id).slice(0, 4);
        const rg = document.getElementById('relatedGrid');
        if (rg) { rg.innerHTML = related.map(productCardHTML).join(''); bindProductCards(rg); Router.bindLinks(); }
      }).catch(() => {});
    }
  }

  function showTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    const tc = document.getElementById('tabContent');
    if (tab === 'description') {
      tc.innerHTML = `<p class="product-desc">${product.description || ''}</p>`;
    } else if (tab === 'details') {
      tc.innerHTML = `<div class="details-grid">
        ${product.fabric ? `<div class="detail-item"><dt>Fabric</dt><dd>${product.fabric}</dd></div>` : ''}
        ${product.care_instructions ? `<div class="detail-item"><dt>Care Instructions</dt><dd>${product.care_instructions}</dd></div>` : ''}
      </div>`;
    } else {
      const user = Store.get('user');
      tc.innerHTML = `
        <div class="reviews-list">
          ${product.reviews.map(r => `
            <div class="review-item">
              <div class="review-header">
                <div><strong>${r.user_name}</strong><div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div></div>
                <span class="review-date">${new Date(r.created_at).toLocaleDateString('en-IN')}</span>
              </div>
              ${r.title ? `<p class="review-title">${r.title}</p>` : ''}
              ${r.body ? `<p class="review-body">${r.body}</p>` : ''}
            </div>`).join('') || '<p style="color:var(--mid-gray);font-size:14px">No reviews yet. Be the first to review!</p>'}
        </div>
        ${user ? `
        <form class="review-form" id="reviewForm">
          <h3>Write a Review</h3>
          <div class="rating-input" id="ratingInput">
            ${[1,2,3,4,5].map(s => `<button type="button" data-star="${s}" style="color:${s<=reviewRating?'var(--gold)':'#ccc'}">★</button>`).join('')}
          </div>
          <input class="form-input" id="reviewTitle" placeholder="Review title"/>
          <textarea class="form-input" id="reviewBody" rows="4" placeholder="Share your experience..."></textarea>
          <button type="submit" class="btn-primary">Submit Review</button>
        </form>` : ''}
      `;
      document.getElementById('ratingInput')?.querySelectorAll('[data-star]').forEach(btn => {
        btn.addEventListener('click', () => {
          reviewRating = parseInt(btn.dataset.star);
          document.querySelectorAll('#ratingInput [data-star]').forEach(b => {
            b.style.color = parseInt(b.dataset.star) <= reviewRating ? 'var(--gold)' : '#ccc';
          });
        });
      });
      document.getElementById('reviewForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          await api.post('/reviews', { product_id: product.id, rating: reviewRating, title: document.getElementById('reviewTitle').value, body: document.getElementById('reviewBody').value });
          Toast.success('Review submitted!');
          product = await api.get('/products/' + slug);
          showTab('reviews');
        } catch(err) { Toast.error(err.response?.data?.error || 'Failed'); }
      });
    }
  }

  function bindEvents() {
    document.getElementById('qtyDown')?.addEventListener('click', () => { if (qty > 1) { qty--; document.getElementById('qtyVal').textContent = qty; } });
    document.getElementById('qtyUp')?.addEventListener('click', () => { qty++; document.getElementById('qtyVal').textContent = qty; });
    document.getElementById('addToCartBtn')?.addEventListener('click', () => {
      if (sizes.length > 1 && !selSize) { Toast.error('Please select a size'); return; }
      CartAPI.add(product.id, selVariant?.id, qty);
    });
    document.getElementById('wishlistBtn')?.addEventListener('click', async () => {
      const w = await WishlistAPI.toggle(product.id);
      const btn = document.getElementById('wishlistBtn');
      if (btn) { btn.classList.toggle('wishlisted', w); btn.querySelector('svg').setAttribute('fill', w ? 'currentColor' : 'none'); }
    });
    document.querySelectorAll('.thumb').forEach(btn => {
      btn.addEventListener('click', () => { activeImg = parseInt(btn.dataset.thumb); render(); });
    });
    document.querySelectorAll('[data-color]').forEach(btn => {
      btn.addEventListener('click', () => { selColor = btn.dataset.color; render(); });
    });
    document.querySelectorAll('[data-size]').forEach(btn => {
      btn.addEventListener('click', () => { selSize = btn.dataset.size; render(); });
    });
    document.querySelectorAll('.tab').forEach(btn => {
      btn.addEventListener('click', () => showTab(btn.dataset.tab));
    });
  }

  render();
}
