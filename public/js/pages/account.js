function renderAccount() {
  const user = Store.get('user');
  if (!user) { Router.navigate('/login'); return; }
  let tab = 'profile';

  function render() {
    document.getElementById('main').innerHTML = `
      <div class="account-page"><div class="container">
        <div class="account-layout">
          <aside class="account-sidebar">
            <div class="account-user-info">
              <div class="account-avatar">${user.name[0].toUpperCase()}</div>
              <div><strong>${user.name}</strong><span>${user.email}</span></div>
            </div>
            <nav class="account-nav">
              <button class="account-nav-item ${tab==='profile'?'active':''}" data-tab="profile">My Profile</button>
              <button class="account-nav-item ${tab==='security'?'active':''}" data-tab="security">Password</button>
              <a data-link href="/orders" class="account-nav-item">My Orders</a>
              <a data-link href="/wishlist" class="account-nav-item">Wishlist</a>
              <button class="account-nav-item logout" id="accountLogout">Sign Out</button>
            </nav>
          </aside>
          <main class="account-main">
            ${tab === 'profile' ? `
              <h2>My Profile</h2>
              <form id="profileForm" style="display:flex;flex-direction:column;gap:20px;max-width:440px">
                <div class="form-group"><label>Full Name</label><input id="profName" class="form-input" value="${user.name}"/></div>
                <div class="form-group"><label>Email</label><input class="form-input" value="${user.email}" disabled style="background:var(--cream);color:var(--mid-gray)"/></div>
                <div class="form-group"><label>Phone</label><input id="profPhone" class="form-input" placeholder="+91 98765 43210"/></div>
                <button type="submit" class="btn-primary" style="width:fit-content;padding:12px 24px">Save Changes</button>
              </form>` : `
              <h2>Change Password</h2>
              <form id="pwForm" style="display:flex;flex-direction:column;gap:20px;max-width:440px">
                <div class="form-group"><label>Current Password</label><input type="password" id="curPw" class="form-input" required/></div>
                <div class="form-group"><label>New Password</label><input type="password" id="newPw" class="form-input" required minlength="6"/></div>
                <div class="form-group"><label>Confirm New Password</label><input type="password" id="confPw" class="form-input" required/></div>
                <button type="submit" class="btn-primary" style="width:fit-content;padding:12px 24px">Change Password</button>
              </form>`}
          </main>
        </div>
      </div></div>`;
    Router.bindLinks();
    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => { tab = btn.dataset.tab; render(); });
    });
    document.getElementById('accountLogout').addEventListener('click', () => { Store.logout(); Router.navigate('/'); });
    document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try { await api.put('/auth/profile', { name: document.getElementById('profName').value, phone: document.getElementById('profPhone').value }); Toast.success('Profile updated!'); }
      catch(err) { Toast.error('Failed to update'); }
    });
    document.getElementById('pwForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (document.getElementById('newPw').value !== document.getElementById('confPw').value) { Toast.error('Passwords do not match'); return; }
      try { await api.put('/auth/change-password', { currentPassword: document.getElementById('curPw').value, newPassword: document.getElementById('newPw').value }); Toast.success('Password changed!'); document.getElementById('pwForm').reset(); }
      catch(err) { Toast.error(err.response?.data?.error || 'Failed'); }
    });
  }
  render();
}
