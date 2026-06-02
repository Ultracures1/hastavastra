async function renderWishlist() {
  const user = Store.get('user');
  if (!user) { Router.navigate('/login'); return; }

  function render() {
    const items = Store.get('wishlistItems');
    document.getElementById('main').innerHTML = items.length === 0 ? `
      <div class="empty-state">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <h2>Your wishlist is empty</h2>
        <p>Save your favourite pieces here.</p>
        <a data-link href="/shop" class="btn-primary">Explore Collection</a>
      </div>` : `
      <div class="wishlist-page"><div class="container">
        <h1>My Wishlist (${items.length})</h1>
        <div class="wishlist-grid">
          ${items.map(item => {
            const disc = getDiscount(item.price, item.original_price);
            return `<div class="wishlist-card">
              <div class="wishlist-img-wrap">
                <a data-link href="/product/${item.slug}"><img src="${item.primary_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'}" alt="${item.name}"/></a>
                <button class="btn-remove-wishlist" data-remove="${item.product_id}">✕</button>
              </div>
              <a data-link href="/product/${item.slug}" style="font-size:14px;font-weight:500;margin:12px 0 6px;display:block;color:var(--dark-gray)">${item.name}</a>
              <div style="display:flex;gap:8px;align-items:baseline;margin-bottom:12px">
                <span class="price">${formatPrice(item.price)}</span>
                ${disc > 0 ? `<span class="original-price">${formatPrice(item.original_price)}</span>` : ''}
              </div>
              <button class="btn-add-to-bag" data-add="${item.product_id}">Add to Bag</button>
            </div>`;
          }).join('')}
        </div>
      </div></div>`;
    Router.bindLinks();
    document.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', async () => { await WishlistAPI.toggle(btn.dataset.remove); render(); });
    });
    document.querySelectorAll('[data-add]').forEach(btn => {
      btn.addEventListener('click', () => CartAPI.add(btn.dataset.add));
    });
  }
  render();
  Store.on('change:wishlistItems', render);
}
