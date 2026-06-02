async function renderCheckout(qs) {
  const discount = parseFloat(qs.get('discount') || '0');
  const coupon = qs.get('coupon') || '';
  const user = Store.get('user');
  if (!user) { Router.navigate('/login'); return; }
  const items = Store.get('cartItems');
  if (!items.length) { Router.navigate('/cart'); return; }

  const subtotal = items.reduce((s,i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal - discount + shipping;

  let addresses = [], selAddress = null, payMethod = 'cod', showForm = false;
  addresses = await api.get('/addresses').catch(() => []);
  const def = addresses.find(a => a.is_default) || addresses[0];
  if (def) selAddress = def.id;
  else showForm = true;

  const states = ['Andhra Pradesh','Assam','Bihar','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];

  function render() {
    document.getElementById('main').innerHTML = `
      <div class="checkout-page">
        <div class="container">
          <h1 style="font-size:28px;margin-bottom:32px">Checkout</h1>
          <div class="checkout-layout">
            <div>
              <div class="checkout-section">
                <h2>1. Delivery Address</h2>
                ${addresses.map(a => `
                  <label class="address-card ${selAddress === a.id ? 'selected' : ''}">
                    <input type="radio" name="address" value="${a.id}" ${selAddress === a.id ? 'checked' : ''}/>
                    <div><strong>${a.name}</strong><span>${a.phone}</span><p>${a.address_line1}${a.address_line2 ? ', '+a.address_line2 : ''}</p><p>${a.city}, ${a.state} – ${a.pincode}</p></div>
                  </label>`).join('')}
                ${!showForm ? `<button class="btn-add-address" id="addAddrBtn">+ Add New Address</button>` : ''}
                ${showForm ? `
                <div class="address-form-box">
                  <div class="form-row">
                    <div class="form-group"><label>Full Name *</label><input id="addrName" value="${user.name}"/></div>
                    <div class="form-group"><label>Phone *</label><input id="addrPhone"/></div>
                  </div>
                  <div class="form-group"><label>Address Line 1 *</label><input id="addrLine1"/></div>
                  <div class="form-group"><label>Address Line 2</label><input id="addrLine2"/></div>
                  <div class="form-row">
                    <div class="form-group"><label>City *</label><input id="addrCity"/></div>
                    <div class="form-group"><label>State *</label><select id="addrState"><option value="">Select State</option>${states.map(s => `<option value="${s}">${s}</option>`).join('')}</select></div>
                    <div class="form-group"><label>Pincode *</label><input id="addrPincode"/></div>
                  </div>
                  <div style="display:flex;gap:12px">
                    <button class="btn-primary" id="saveAddrBtn" style="padding:12px 24px">Save Address</button>
                    ${addresses.length > 0 ? `<button class="btn-outline" id="cancelAddrBtn" style="padding:12px 24px">Cancel</button>` : ''}
                  </div>
                </div>` : ''}
              </div>
              <div class="checkout-section">
                <h2>2. Payment Method</h2>
                ${[['cod','Cash on Delivery','Pay when you receive'],['upi','UPI','PhonePe, GPay, Paytm'],['card','Credit / Debit Card','All major cards accepted'],['netbanking','Net Banking','All major banks']].map(([val, label, desc]) => `
                  <label class="payment-option ${payMethod === val ? 'selected' : ''}">
                    <input type="radio" name="payment" value="${val}" ${payMethod === val ? 'checked' : ''}/>
                    <div><strong>${label}</strong><span>${desc}</span></div>
                  </label>`).join('')}
              </div>
            </div>
            <div class="order-summary">
              <h2>Order Summary</h2>
              <div class="order-items-summary">
                ${items.map(i => `<div class="order-summary-item"><img src="${i.primary_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100'}" alt="${i.name}" style="width:60px;height:72px;object-fit:cover"/><div><p style="font-size:13px;font-weight:500">${i.name}</p>${i.color ? `<span style="font-size:11px;color:var(--mid-gray)">${i.color}${i.size && i.size !== 'Free Size' ? ' / '+i.size : ''}</span><br>` : ''}<span style="font-size:11px;color:var(--mid-gray)">Qty: ${i.quantity}</span></div><strong style="font-size:13px">${formatPrice(i.price * i.quantity)}</strong></div>`).join('')}
              </div>
              <div style="display:flex;flex-direction:column;gap:10px;padding:16px 0;border-top:1px solid var(--border);margin-bottom:20px">
                <div class="total-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
                ${discount > 0 ? `<div class="total-row text-success"><span>Discount</span><span>−${formatPrice(discount)}</span></div>` : ''}
                <div class="total-row"><span>Shipping</span><span>${shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
                <div class="total-row grand"><span>Total</span><span>${formatPrice(total)}</span></div>
              </div>
              <button class="btn-place-order" id="placeOrderBtn">Place Order — ${formatPrice(total)}</button>
              <p class="secure-note">🔒 Secure & encrypted checkout</p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.querySelectorAll('input[name=address]').forEach(inp => inp.addEventListener('change', () => selAddress = inp.value));
    document.querySelectorAll('input[name=payment]').forEach(inp => inp.addEventListener('change', () => { payMethod = inp.value; render(); }));
    document.querySelectorAll('.address-card').forEach(card => {
      card.addEventListener('click', () => { selAddress = card.querySelector('input[type=radio]')?.value; render(); });
    });
    document.getElementById('addAddrBtn')?.addEventListener('click', () => { showForm = true; render(); });
    document.getElementById('cancelAddrBtn')?.addEventListener('click', () => { showForm = false; render(); });
    document.getElementById('saveAddrBtn')?.addEventListener('click', async () => {
      try {
        await api.post('/addresses', { name: document.getElementById('addrName').value, phone: document.getElementById('addrPhone').value, address_line1: document.getElementById('addrLine1').value, address_line2: document.getElementById('addrLine2').value, city: document.getElementById('addrCity').value, state: document.getElementById('addrState').value, pincode: document.getElementById('addrPincode').value, is_default: addresses.length === 0 });
        addresses = await api.get('/addresses');
        selAddress = addresses[addresses.length - 1].id;
        showForm = false;
        Toast.success('Address saved');
        render();
      } catch(e) { Toast.error('Failed to save address'); }
    });
    document.getElementById('placeOrderBtn')?.addEventListener('click', async () => {
      if (!selAddress) { Toast.error('Please select a delivery address'); return; }
      document.getElementById('placeOrderBtn').disabled = true;
      document.getElementById('placeOrderBtn').textContent = 'Placing Order...';
      try {
        const data = await api.post('/orders', { address_id: selAddress, payment_method: payMethod, coupon_code: coupon || undefined });
        await CartAPI.clear();
        Router.navigate('/order-success/' + data.order_id);
      } catch(e) {
        Toast.error(e.response?.data?.error || 'Order failed');
        document.getElementById('placeOrderBtn').disabled = false;
        document.getElementById('placeOrderBtn').textContent = `Place Order — ${formatPrice(total)}`;
      }
    });
  }
  render();
}
