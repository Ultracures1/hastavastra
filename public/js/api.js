const API_BASE = '/api';

async function apiRequest(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = Store.get('token');
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API_BASE + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { response: { data, status: res.status } });
  return data;
}

const api = {
  get: (path) => apiRequest('GET', path),
  post: (path, body) => apiRequest('POST', path, body),
  put: (path, body) => apiRequest('PUT', path, body),
  delete: (path) => apiRequest('DELETE', path),
};

// Cart helpers
const CartAPI = {
  async load() {
    if (!Store.get('user')) { Store.set('cartItems', []); Store.set('cartCount', 0); return; }
    try {
      const data = await api.get('/cart');
      Store.set('cartItems', data.items);
      Store.set('cartCount', data.count);
    } catch(e) {}
  },
  async add(productId, variantId, qty = 1) {
    if (!Store.get('user')) { Toast.info('Please login to add items to cart'); return; }
    try {
      const data = await api.post('/cart/add', { product_id: productId, variant_id: variantId, quantity: qty });
      Store.set('cartItems', data.items);
      Store.set('cartCount', data.count);
      Toast.success('Added to cart!');
    } catch(e) { Toast.error(e.response?.data?.error || 'Failed to add to cart'); }
  },
  async update(itemId, qty) {
    try {
      const data = await api.put(`/cart/${itemId}`, { quantity: qty });
      Store.set('cartItems', data.items);
      Store.set('cartCount', data.count);
    } catch(e) {}
  },
  async remove(itemId) {
    try {
      const data = await api.delete(`/cart/${itemId}`);
      Store.set('cartItems', data.items);
      Store.set('cartCount', data.count);
      Toast.success('Item removed');
    } catch(e) {}
  },
  async clear() {
    try { await api.delete('/cart'); Store.set('cartItems', []); Store.set('cartCount', 0); } catch(e) {}
  }
};

// Wishlist helpers
const WishlistAPI = {
  async load() {
    if (!Store.get('user')) { Store.set('wishlistItems', []); return; }
    try { const data = await api.get('/wishlist'); Store.set('wishlistItems', data); } catch(e) {}
  },
  async toggle(productId) {
    if (!Store.get('user')) { Toast.info('Please login first'); return false; }
    try {
      const data = await api.post('/wishlist/toggle', { product_id: productId });
      await WishlistAPI.load();
      return data.wishlisted;
    } catch(e) { return false; }
  },
  isWishlisted(productId) {
    return Store.get('wishlistItems').some(i => i.product_id === productId);
  }
};
