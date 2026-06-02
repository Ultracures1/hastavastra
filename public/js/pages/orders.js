const STATUS_COLORS = { pending: '#F39C12', confirmed: '#3498DB', shipped: '#9B59B6', delivered: '#27AE60', cancelled: '#E74C3C' };

async function renderOrders() {
  const user = Store.get('user');
  if (!user) { Router.navigate('/login'); return; }
  document.getElementById('main').innerHTML = `<div class="orders-page"><div class="container"><h1>My Orders</h1><div class="spinner-wrap"><div class="spinner"></div></div></div></div>`;
  const orders = await api.get('/orders').catch(() => []);
  document.getElementById('main').innerHTML = `
    <div class="orders-page"><div class="container">
      <h1>My Orders</h1>
      ${!orders.length ? `<div class="empty-state"><p>You haven't placed any orders yet.</p><a data-link href="/shop" class="btn-primary" style="margin-top:16px">Start Shopping</a></div>` : `
      <div class="orders-list">
        ${orders.map(o => `
          <div class="order-card" data-order="${o.id}">
            <div class="order-card-header">
              <div><strong>Order #${o.id.slice(0,8).toUpperCase()}</strong><span class="order-date">${new Date(o.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</span></div>
              <span class="status-badge" style="color:${STATUS_COLORS[o.status]||'#333'};border-color:${STATUS_COLORS[o.status]||'#333'}">${o.status.charAt(0).toUpperCase()+o.status.slice(1)}</span>
            </div>
            <div class="order-card-meta">
              <span>${o.item_count} item${o.item_count !== 1 ? 's' : ''}</span>
              <strong>${formatPrice(o.total_amount)}</strong>
              <span class="pay-method-tag">${o.payment_method.toUpperCase()}</span>
            </div>
          </div>`).join('')}
      </div>`}
    </div></div>`;
  document.querySelectorAll('[data-order]').forEach(card => {
    card.addEventListener('click', () => Router.navigate('/order-success/' + card.dataset.order));
  });
  Router.bindLinks();
}

async function renderOrderDetail(qs, orderId) {
  const user = Store.get('user');
  if (!user) { Router.navigate('/login'); return; }
  document.getElementById('main').innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;
  let order;
  try { order = await api.get('/orders/' + orderId); }
  catch(e) { document.getElementById('main').innerHTML = '<div style="text-align:center;padding:80px"><h2>Order not found</h2><a data-link href="/orders" style="color:var(--accent)">View all orders</a></div>'; Router.bindLinks(); return; }

  document.getElementById('main').innerHTML = `
    <div class="success-page">
      <div class="success-card">
        <div class="success-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
        <h1>Order ${order.status === 'pending' ? 'Placed Successfully!' : '#' + order.id.slice(0,8).toUpperCase()}</h1>
        <p style="font-size:14px;color:var(--mid-gray);margin-bottom:28px">Thank you for shopping with Hastavastra.</p>
        <div class="order-ref"><span>Order ID:</span><strong>#${order.id.slice(0,8).toUpperCase()}</strong></div>
        <div class="order-info-grid">
          <div class="order-info-cell"><span>Total</span><strong>${formatPrice(order.total_amount)}</strong></div>
          <div class="order-info-cell"><span>Payment</span><strong>${order.payment_method.toUpperCase()}</strong></div>
          <div class="order-info-cell"><span>Status</span><strong style="color:${STATUS_COLORS[order.status]||'var(--success)'}">${order.status.charAt(0).toUpperCase()+order.status.slice(1)}</strong></div>
        </div>
        ${order.items?.length ? `
        <div style="text-align:left;border-top:1px solid var(--border);padding-top:20px;margin-bottom:24px;display:flex;flex-direction:column;gap:12px">
          ${order.items.map(item => `
            <div style="display:flex;gap:12px;align-items:center">
              <img src="${item.primary_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100'}" alt="${item.name}" style="width:56px;height:68px;object-fit:cover"/>
              <div><p style="font-size:13px;font-weight:500">${item.name}</p>${item.color ? `<span style="font-size:12px;color:var(--mid-gray)">${item.color}${item.size && item.size !== 'Free Size' ? ' / '+item.size : ''}</span><br>` : ''}<span style="font-size:12px;color:var(--mid-gray)">Qty: ${item.quantity} × ${formatPrice(item.price)}</span></div>
            </div>`).join('')}
        </div>` : ''}
        <div class="success-actions">
          <a data-link href="/orders" class="btn-primary">My Orders</a>
          <a data-link href="/shop" class="btn-outline">Continue Shopping</a>
        </div>
      </div>
    </div>`;
  Router.bindLinks();
}
