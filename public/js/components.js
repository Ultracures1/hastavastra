// ── Toast ────────────────────────────────────
const Toast = {
  show(msg, type = 'info') {
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = msg;
    document.getElementById('toast-container').appendChild(el);
    setTimeout(() => el.remove(), 3500);
  },
  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error'); },
  info(msg) { this.show(msg, 'info'); },
};

// ── Helpers ──────────────────────────────────
function formatPrice(p) { return '₹' + Number(p).toLocaleString('en-IN'); }
function getDiscount(price, orig) {
  if (!orig || orig <= price) return 0;
  return Math.round(((orig - price) / orig) * 100);
}
function starSVG(filled) {
  return `<svg width="12" height="12" viewBox="0 0 24 24" fill="${filled ? '#B8860B' : 'none'}" stroke="#B8860B" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
}
function starsHTML(avg) {
  return [1,2,3,4,5].map(s => starSVG(s <= Math.round(avg || 0))).join('');
}

// ── Product Card ─────────────────────────────
function productCardHTML(p) {
  const discount = getDiscount(p.price, p.original_price);
  const wishlisted = WishlistAPI.isWishlisted(p.id);
  const img = p.primary_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600';
  return `
    <div class="product-card fade-in" data-product-id="${p.id}">
      <div class="product-image-wrap">
        <a data-link href="/product/${p.slug}">
          <img src="${img}" alt="${p.name}" loading="lazy"/>
        </a>
        <div class="product-badges">
          ${discount > 0 ? `<span class="badge-discount">${discount}% off</span>` : ''}
          ${p.is_new_arrival === 1 ? '<span class="badge-new">New</span>' : ''}
        </div>
        <button class="wishlist-btn ${wishlisted ? 'wishlisted' : ''}" data-wishlist="${p.id}" title="Wishlist">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${wishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <button class="quick-add" data-add-cart="${p.id}">Quick Add</button>
      </div>
      <div class="product-info">
        <a class="product-name" data-link href="/product/${p.slug}">${p.name}</a>
        <div class="star-rating">${starsHTML(p.avg_rating)}${p.review_count > 0 ? `<span>(${p.review_count})</span>` : ''}</div>
        <div class="product-prices">
          <span class="price">${formatPrice(p.price)}</span>
          ${discount > 0 ? `<span class="original-price">${formatPrice(p.original_price)}</span>` : ''}
        </div>
      </div>
    </div>`;
}

function bindProductCards(container) {
  container.querySelectorAll('[data-wishlist]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault(); e.stopPropagation();
      const id = btn.dataset.wishlist;
      await WishlistAPI.toggle(id);
      const wishlisted = WishlistAPI.isWishlisted(id);
      btn.classList.toggle('wishlisted', wishlisted);
      btn.querySelector('svg').setAttribute('fill', wishlisted ? 'currentColor' : 'none');
    });
  });
  container.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault(); e.stopPropagation();
      await CartAPI.add(btn.dataset.addCart);
    });
  });
}

// ── Navbar ───────────────────────────────────
function renderNavbar() {
  const user = Store.get('user');
  const cartCount = Store.get('cartCount');
  const wishCount = Store.get('wishlistItems').length;
  const categories = [
    { name: 'Sarees', slug: 'sarees' }, { name: 'Kurtas', slug: 'kurtas' },
    { name: 'Dupattas', slug: 'dupattas' }, { name: 'Suits', slug: 'suits' }, { name: 'Bottoms', slug: 'bottoms' },
  ];
  document.getElementById('header').innerHTML = `
    <div class="top-bar">Free shipping on orders above ₹999 | Use code WELCOME10 for 10% off</div>
    <nav class="nav">
      <button class="menu-btn" id="menuBtn" aria-label="Menu"><span></span><span></span><span></span></button>
      <a data-link href="/" class="logo"><span class="logo-text">Hastavastra</span><span class="logo-sub">हस्तवस्त्र</span></a>
      <ul class="nav-links">
        <li><a data-link href="/shop">All</a></li>
        ${categories.map(c => `<li><a data-link href="/shop?category=${c.slug}">${c.name}</a></li>`).join('')}
        <li><a data-link href="/shop?new_arrival=true">New Arrivals</a></li>
      </ul>
      <div class="nav-actions">
        <button class="icon-btn" id="searchBtn" aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </button>
        ${user ? `<a data-link href="/wishlist" class="icon-btn" aria-label="Wishlist" style="position:relative">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          ${wishCount > 0 ? `<span class="badge">${wishCount}</span>` : ''}
        </a>` : ''}
        <div class="user-dropdown-wrap">
          ${user ? `<button class="icon-btn" id="userMenuBtn"><div class="user-avatar">${user.name[0].toUpperCase()}</div></button>` :
            `<a data-link href="/login" class="icon-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></a>`}
          ${user ? `<div class="user-dropdown" id="userDropdown" style="display:none">
            <div class="user-dropdown-header"><strong>${user.name}</strong><span>${user.email}</span></div>
            <a data-link href="/account">My Account</a>
            <a data-link href="/orders">My Orders</a>
            <a data-link href="/wishlist">Wishlist</a>
            ${user.role === 'admin' ? '<a data-link href="/admin">Admin Panel</a>' : ''}
            <button id="logoutBtn">Sign Out</button>
          </div>` : ''}
        </div>
        <button class="cart-btn" id="cartOpenBtn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          Bag
          ${cartCount > 0 ? `<span class="badge">${cartCount}</span>` : ''}
        </button>
      </div>
    </nav>
    <div class="mobile-menu" id="mobileMenu" style="display:none">
      <a data-link href="/shop">All Products</a>
      ${categories.map(c => `<a data-link href="/shop?category=${c.slug}">${c.name}</a>`).join('')}
      <a data-link href="/shop?new_arrival=true">New Arrivals</a>
      <a data-link href="/orders">My Orders</a>
      <a data-link href="/account">Account</a>
      ${!user ? `<a data-link href="/login">Sign In</a>` : `<button id="mobileLogoutBtn">Sign Out</button>`}
    </div>
  `;

  // Bind navbar events
  document.getElementById('menuBtn')?.addEventListener('click', () => {
    const m = document.getElementById('mobileMenu');
    m.style.display = m.style.display === 'none' ? 'flex' : 'none';
  });
  document.getElementById('cartOpenBtn')?.addEventListener('click', () => CartDrawerComponent.open());
  document.getElementById('userMenuBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const d = document.getElementById('userDropdown');
    d.style.display = d.style.display === 'none' ? 'block' : 'none';
  });
  document.getElementById('logoutBtn')?.addEventListener('click', () => { Store.logout(); Router.navigate('/'); });
  document.getElementById('mobileLogoutBtn')?.addEventListener('click', () => { Store.logout(); Router.navigate('/'); });
  document.getElementById('searchBtn')?.addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.innerHTML = `<div class="search-box"><form id="searchForm"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input id="searchInput" autofocus placeholder="Search sarees, kurtas, dupattas..."/><button type="button" id="closeSearch">✕</button></form></div>`;
    document.body.appendChild(overlay);
    document.getElementById('closeSearch').onclick = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.getElementById('searchForm').onsubmit = (e) => {
      e.preventDefault();
      const q = document.getElementById('searchInput').value.trim();
      if (q) { overlay.remove(); Router.navigate('/shop?search=' + encodeURIComponent(q)); }
    };
  });
  document.addEventListener('click', () => {
    const d = document.getElementById('userDropdown');
    if (d) d.style.display = 'none';
  });

  window.addEventListener('scroll', () => {
    document.getElementById('header').classList.toggle('scrolled', window.scrollY > 50);
  });
}

// ── Cart Drawer ───────────────────────────────
const CartDrawerComponent = {
  open() { this.render(); document.getElementById('cart-drawer').querySelector('.cart-drawer').classList.add('open'); },
  close() { document.getElementById('cart-drawer').querySelector('.cart-drawer')?.classList.remove('open'); },
  render() {
    const items = Store.get('cartItems');
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = subtotal >= 999 ? 0 : 99;
    const shippingProgress = Math.min(100, (subtotal / 999) * 100);

    const itemsHTML = items.map(item => `
      <div class="drawer-item" data-item-id="${item.id}">
        <img src="${item.primary_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200'}" alt="${item.name}"/>
        <div class="item-info">
          <a class="item-name" data-link href="/product/${item.slug}">${item.name}</a>
          ${item.color ? `<span class="item-variant">${item.color}${item.size && item.size !== 'Free Size' ? ' / ' + item.size : ''}</span>` : ''}
          <div class="item-bottom">
            <div class="qty-ctrl">
              <button data-qty="${item.id}" data-val="${item.quantity - 1}">−</button>
              <span>${item.quantity}</span>
              <button data-qty="${item.id}" data-val="${item.quantity + 1}">+</button>
            </div>
            <span class="item-price">${formatPrice(item.price * item.quantity)}</span>
          </div>
        </div>
        <button class="item-remove" data-remove="${item.id}">✕</button>
      </div>`).join('');

    document.getElementById('cart-drawer').innerHTML = `
      <div class="drawer-overlay" id="drawerOverlay"></div>
      <div class="cart-drawer ${document.getElementById('cart-drawer').querySelector('.cart-drawer.open') ? 'open' : ''}">
        <div class="drawer-header"><h2>Shopping Bag (${items.length})</h2><button class="drawer-close" id="drawerClose">✕</button></div>
        ${items.length === 0 ? `<div class="drawer-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <p>Your bag is empty</p>
          <button class="btn-shop" id="drawerShop">Start Shopping</button>
        </div>` : `
        <div class="drawer-items">${itemsHTML}</div>
        <div class="drawer-footer">
          ${subtotal < 999 ? `<div class="shipping-note">Add ${formatPrice(999 - subtotal)} more for free shipping<div class="shipping-progress"><div class="shipping-progress-bar" style="width:${shippingProgress}%"></div></div></div>` : ''}
          <div class="summary-rows">
            <div class="summary-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
            <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? '<strong style="color:var(--success)">FREE</strong>' : formatPrice(shipping)}</span></div>
            <div class="summary-row summary-total"><span>Total</span><span>${formatPrice(subtotal + shipping)}</span></div>
          </div>
          <a data-link href="/checkout" class="btn-checkout" id="drawerCheckout">Proceed to Checkout</a>
          <button class="btn-view-cart" id="drawerViewCart">View Full Cart</button>
        </div>`}
      </div>`;

    document.getElementById('drawerClose')?.addEventListener('click', () => this.close());
    document.getElementById('drawerOverlay')?.addEventListener('click', () => this.close());
    document.getElementById('drawerShop')?.addEventListener('click', () => { this.close(); Router.navigate('/shop'); });
    document.getElementById('drawerViewCart')?.addEventListener('click', () => { this.close(); Router.navigate('/cart'); });
    document.getElementById('drawerCheckout')?.addEventListener('click', () => { this.close(); Router.navigate('/checkout'); });
    document.querySelectorAll('[data-qty]').forEach(btn => {
      btn.addEventListener('click', () => CartAPI.update(btn.dataset.qty, parseInt(btn.dataset.val)));
    });
    document.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => CartAPI.remove(btn.dataset.remove));
    });
  }
};

// ── Footer ───────────────────────────────────
function renderFooter() {
  document.getElementById('footer').innerHTML = `
    <div class="footer-top">
      <div class="footer-brand">
        <h3 class="footer-logo">Hastavastra</h3>
        <p class="footer-tagline">हस्तवस्त्र</p>
        <p class="footer-desc">Celebrating the timeless art of Indian handcraft. Each piece is woven with love, tradition, and a story worth wearing.</p>
        <div class="footer-social">
          <a href="#" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a>
          <a href="#" aria-label="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
        </div>
      </div>
      <div class="footer-links">
        <div>
          <h4>Shop</h4>
          <a data-link href="/shop?category=sarees">Sarees</a>
          <a data-link href="/shop?category=kurtas">Kurtas</a>
          <a data-link href="/shop?category=dupattas">Dupattas</a>
          <a data-link href="/shop?category=suits">Suits</a>
          <a data-link href="/shop?new_arrival=true">New Arrivals</a>
        </div>
        <div>
          <h4>Help</h4>
          <a href="#">FAQ</a>
          <a href="#">Shipping Policy</a>
          <a href="#">Returns & Exchange</a>
          <a href="#">Size Guide</a>
          <a href="#">Contact Us</a>
        </div>
        <div>
          <h4>Company</h4>
          <a href="#">About Us</a>
          <a href="#">Sustainability</a>
          <a href="#">Our Artisans</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </div>
    <div class="footer-newsletter">
      <div><h4>Join the Hastavastra family</h4><p>Subscribe for stories of craftsmanship and exclusive offers.</p></div>
      <form onsubmit="event.preventDefault()"><input type="email" placeholder="Enter your email address"/><button type="submit">Subscribe</button></form>
    </div>
    <div class="footer-bottom">
      <p>© 2024 Hastavastra. All rights reserved. Handcrafted with ❤️ in India.</p>
      <div class="pay-icons"><span>We accept:</span><span class="pay-icon">Visa</span><span class="pay-icon">Mastercard</span><span class="pay-icon">UPI</span><span class="pay-icon">COD</span></div>
    </div>
  `;
}

// ── Re-render navbar when store changes ──────
Store.on('change:cartCount', () => renderNavbar());
Store.on('change:wishlistItems', () => renderNavbar());
Store.on('change:user', () => renderNavbar());
Store.on('change:cartItems', () => {
  if (document.getElementById('cart-drawer').querySelector('.cart-drawer.open')) CartDrawerComponent.render();
});
