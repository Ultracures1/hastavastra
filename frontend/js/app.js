// ── Routes ─────────────────────────────────────
Router.register('/', renderHome);
Router.register('/shop', renderShop);
Router.register('/product/:slug', renderProduct);
Router.register('/cart', renderCart);
Router.register('/checkout', renderCheckout);
Router.register('/order-success/:id', renderOrderDetail);
Router.register('/orders', renderOrders);
Router.register('/orders/:id', renderOrderDetail);
Router.register('/login', renderLogin);
Router.register('/register', renderRegister);
Router.register('/account', renderAccount);
Router.register('/wishlist', renderWishlist);

// ── Boot ────────────────────────────────────────
async function boot() {
  renderNavbar();
  renderFooter();
  Router.bindLinks();

  // Load cart & wishlist if logged in
  await CartAPI.load();
  await WishlistAPI.load();

  // Render current page
  Router.render(location.pathname + location.search);
}

boot();
