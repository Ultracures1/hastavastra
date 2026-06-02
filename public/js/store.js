// Simple reactive store
const Store = (() => {
  const state = {
    user: null,
    token: null,
    cartItems: [],
    cartCount: 0,
    wishlistItems: [],
  };

  try {
    state.token = localStorage.getItem('token');
    state.user = JSON.parse(localStorage.getItem('user') || 'null');
  } catch(e) {}

  const listeners = {};

  function on(event, fn) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
  }

  function emit(event, data) {
    (listeners[event] || []).forEach(fn => fn(data));
  }

  function get(key) { return state[key]; }

  function set(key, val) {
    state[key] = val;
    emit('change:' + key, val);
    emit('change', { key, val });
  }

  function setUser(user, token) {
    state.user = user; state.token = token;
    if (user) { localStorage.setItem('user', JSON.stringify(user)); localStorage.setItem('token', token); }
    else { localStorage.removeItem('user'); localStorage.removeItem('token'); }
    emit('change:user', user);
  }

  function logout() { setUser(null, null); set('cartItems', []); set('cartCount', 0); set('wishlistItems', []); }

  return { get, set, on, emit, setUser, logout };
})();
