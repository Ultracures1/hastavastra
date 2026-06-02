function renderLogin() {
  document.getElementById('main').innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header"><h1>Welcome Back</h1><p>Sign in to your Hastavastra account</p></div>
        <form class="auth-form" id="loginForm">
          <div class="form-group"><label>Email Address</label><input type="email" id="loginEmail" class="form-input" placeholder="you@example.com" required/></div>
          <div class="form-group"><label>Password</label><input type="password" id="loginPassword" class="form-input" placeholder="••••••••" required/></div>
          <button type="submit" class="btn-auth btn-primary" style="width:100%;padding:14px">Sign In</button>
        </form>
        <div class="demo-hint"><p><strong>Demo credentials:</strong></p><p>Email: test@example.com | Password: test123</p></div>
        <p class="switch-auth">Don't have an account? <a data-link href="/register">Create one</a></p>
      </div>
    </div>`;
  Router.bindLinks();
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true; btn.textContent = 'Signing in...';
    try {
      const data = await api.post('/auth/login', { email: document.getElementById('loginEmail').value, password: document.getElementById('loginPassword').value });
      Store.setUser(data.user, data.token);
      await CartAPI.load(); await WishlistAPI.load();
      Router.navigate('/');
    } catch(err) {
      Toast.error(err.response?.data?.error || 'Login failed');
      btn.disabled = false; btn.textContent = 'Sign In';
    }
  });
}

function renderRegister() {
  document.getElementById('main').innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header"><h1>Create Account</h1><p>Join the Hastavastra family</p></div>
        <form class="auth-form" id="registerForm">
          <div class="form-group"><label>Full Name</label><input id="regName" class="form-input" placeholder="Your name" required/></div>
          <div class="form-group"><label>Email Address</label><input type="email" id="regEmail" class="form-input" placeholder="you@example.com" required/></div>
          <div class="form-group"><label>Phone (optional)</label><input id="regPhone" class="form-input" placeholder="+91 98765 43210"/></div>
          <div class="form-group"><label>Password</label><input type="password" id="regPassword" class="form-input" placeholder="Min 6 characters" required minlength="6"/></div>
          <button type="submit" class="btn-auth btn-primary" style="width:100%;padding:14px">Create Account</button>
        </form>
        <p class="switch-auth">Already have an account? <a data-link href="/login">Sign in</a></p>
      </div>
    </div>`;
  Router.bindLinks();
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true; btn.textContent = 'Creating account...';
    try {
      const data = await api.post('/auth/register', { name: document.getElementById('regName').value, email: document.getElementById('regEmail').value, password: document.getElementById('regPassword').value, phone: document.getElementById('regPhone').value });
      Store.setUser(data.user, data.token);
      Toast.success('Account created!');
      Router.navigate('/');
    } catch(err) {
      Toast.error(err.response?.data?.error || 'Registration failed');
      btn.disabled = false; btn.textContent = 'Create Account';
    }
  });
}
