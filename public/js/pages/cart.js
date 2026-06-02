async function renderCart() {
  let discount = 0, couponApplied = '';
  function cartHTML() {
    const items = Store.get('cartItems');
    const subtotal = items.reduce((s,i) => s + i.price * i.quantity, 0);
    const shipping = subtotal >= 999 ? 0 : 99;
    const total = subtotal - discount + shipping;
    if (!items.length) {
      return `<div class="empty-state"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg><h2>Your bag is empty</h2><p>Add some beautiful pieces to your bag!</p><a data-link href="/shop" class="btn-primary">Continue Shopping</a></div>`;
    }
    return `
      <div class="cart-page">
        <div class="container">
          <h1 style="font-size:28px;margin-bottom:32px">Shopping Bag (${items.length})</h1>
          <div class="cart-layout">
            <div class="cart-items-list">
              ${items.map(item => `
                <div class="cart-item" data-item="${item.id}">
                  <a data-link href="/product/${item.slug}"><img src="${item.primary_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200'}" alt="${item.name}" style="width:100px;height:120px;object-fit:cover"/></a>
                  <div>
                    <a data-link href="/product/${item.slug}" style="font-size:15px;font-weight:500;display:block;margin-bottom:6px;color:var(--dark-gray)">${item.name}</a>
                    ${item.color ? `<p style="font-size:12px;color:var(--mid-gray);margin-bottom:14px">${item.color}${item.size && item.size !== 'Free Size' ? ' / ' + item.size : ''}</p>` : ''}
                    <div style="display:flex;align-items:center;gap:16px">
                      <div class="qty-ctrl">
                        <button data-qty="${item.id}" data-val="${item.quantity-1}">−</button>
                        <span>${item.quantity}</span>
                        <button data-qty="${item.id}" data-val="${item.quantity+1}">+</button>
                      </div>
                      <button class="item-remove" data-remove="${item.id}">Remove</button>
                    </div>
                  </div>
                  <div style="font-size:15px;font-weight:600">${formatPrice(item.price * item.quantity)}</div>
                </div>`).join('')}
            </div>
            <div class="order-summary">
              <h2>Order Summary</h2>
              <div class="coupon-row">
                <input id="couponInput" placeholder="Enter coupon code" value="${couponApplied}" style="text-transform:uppercase"/>
                <button id="applyCouponBtn">Apply</button>
              </div>
              ${couponApplied ? `<p class="coupon-success">✓ ${couponApplied} applied!</p>` : ''}
              <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
                <div class="total-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
                ${discount > 0 ? `<div class="total-row text-success"><span>Coupon Discount</span><span>−${formatPrice(discount)}</span></div>` : ''}
                <div class="total-row"><span>Shipping</span><span>${shipping === 0 ? '<strong class="text-free">FREE</strong>' : formatPrice(shipping)}</span></div>
                <div class="total-row grand"><span>Total</span><span>${formatPrice(total)}</span></div>
              </div>
              ${subtotal < 999 ? `<p class="free-ship-hint">Add ${formatPrice(999-subtotal)} more for free shipping!</p>` : ''}
              <button class="btn-primary" id="checkoutBtn" style="width:100%;padding:14px;margin-bottom:12px">Proceed to Checkout</button>
              <a data-link href="/shop" style="display:block;text-align:center;font-size:13px;color:var(--mid-gray);text-decoration:underline">← Continue Shopping</a>
            </div>
          </div>
        </div>
      </div>`;
  }

  const main = document.getElementById('main');
  function rerender() {
    main.innerHTML = cartHTML();
    Router.bindLinks();
    document.querySelectorAll('[data-qty]').forEach(btn => {
      btn.addEventListener('click', () => CartAPI.update(btn.dataset.qty, parseInt(btn.dataset.val)));
    });
    document.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => CartAPI.remove(btn.dataset.remove));
    });
    document.getElementById('applyCouponBtn')?.addEventListener('click', async () => {
      const code = document.getElementById('couponInput').value.trim();
      if (!code) return;
      const items = Store.get('cartItems');
      const subtotal = items.reduce((s,i) => s + i.price * i.quantity, 0);
      try {
        const data = await api.post('/coupons/validate', { code, cart_total: subtotal });
        discount = data.discount;
        couponApplied = code;
        Toast.success(`Coupon applied! You saved ${formatPrice(data.discount)}`);
        rerender();
      } catch(e) { Toast.error(e.response?.data?.error || 'Invalid coupon'); }
    });
    document.getElementById('checkoutBtn')?.addEventListener('click', () => {
      Router.navigate('/checkout?discount=' + discount + '&coupon=' + encodeURIComponent(couponApplied));
    });
  }

  rerender();
  Store.on('change:cartItems', rerender);
}
