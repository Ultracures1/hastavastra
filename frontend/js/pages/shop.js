async function renderShop(qs) {
  const category = qs.get('category') || '';
  const search = qs.get('search') || '';
  const featured = qs.get('featured') || '';
  const newArrival = qs.get('new_arrival') || '';
  const sort = qs.get('sort') || 'created_at_desc';
  const page = parseInt(qs.get('page') || '1');
  const limit = 12;

  const main = document.getElementById('main');
  main.innerHTML = `
    <div class="shop-header"><div class="container"><h1 id="shopTitle">Shop</h1><p class="shop-count" id="shopCount">Loading...</p></div></div>
    <div class="container">
      <div class="shop-layout">
        <aside class="shop-sidebar" id="shopSidebar">
          <div class="sidebar-header"><h3>Filters</h3><button class="close-filter" id="closeFilter">✕</button></div>
          <div class="filter-group">
            <h4>Categories</h4>
            <button class="filter-btn ${!category ? 'active' : ''}" data-cat="">All</button>
            <div id="catFilters"><div class="skeleton-card" style="height:120px"></div></div>
          </div>
          <div class="filter-group">
            <h4>Price Range</h4>
            <div class="price-inputs">
              <input type="number" id="minPrice" placeholder="Min ₹" style="width:80px"/>
              <span>–</span>
              <input type="number" id="maxPrice" placeholder="Max ₹" style="width:80px"/>
            </div>
            <button class="filter-btn btn-apply" id="applyPrice">Apply</button>
          </div>
          <div class="filter-group">
            <h4>Collection</h4>
            <button class="filter-btn ${newArrival ? 'active' : ''}" data-toggle="new_arrival">New Arrivals</button>
            <button class="filter-btn ${featured ? 'active' : ''}" data-toggle="featured">Featured</button>
          </div>
        </aside>
        <main class="shop-main">
          <div class="shop-toolbar">
            <button class="filter-toggle" id="filterToggle">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
              Filters
            </button>
            <select class="sort-select" id="sortSelect">
              <option value="created_at_desc" ${sort==='created_at_desc'?'selected':''}>Newest First</option>
              <option value="price_asc" ${sort==='price_asc'?'selected':''}>Price: Low to High</option>
              <option value="price_desc" ${sort==='price_desc'?'selected':''}>Price: High to Low</option>
              <option value="name_asc" ${sort==='name_asc'?'selected':''}>Name: A–Z</option>
            </select>
          </div>
          <div class="shop-grid" id="shopGrid">
            ${Array(6).fill('<div class="skeleton-card"></div>').join('')}
          </div>
          <div id="shopPagination"></div>
        </main>
      </div>
    </div>
  `;

  Router.bindLinks();

  // Bind sidebar events
  document.getElementById('filterToggle').addEventListener('click', () => document.getElementById('shopSidebar').classList.add('open'));
  document.getElementById('closeFilter').addEventListener('click', () => document.getElementById('shopSidebar').classList.remove('open'));

  // Load categories
  const cats = await api.get('/categories').catch(() => []);
  document.getElementById('catFilters').innerHTML = cats.map(c => `
    <button class="filter-btn ${category === c.slug ? 'active' : ''}" data-cat="${c.slug}">${c.name} <span>${c.product_count}</span></button>
  `).join('');

  document.querySelectorAll('[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => updateFilter('category', btn.dataset.cat));
  });
  document.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.toggle;
      const cur = qs.get(key === 'new_arrival' ? 'new_arrival' : 'featured');
      updateFilter(key === 'new_arrival' ? 'new_arrival' : 'featured', cur ? '' : 'true');
    });
  });
  document.getElementById('applyPrice').addEventListener('click', () => {
    const min = document.getElementById('minPrice').value;
    const max = document.getElementById('maxPrice').value;
    const newQS = new URLSearchParams(qs.toString());
    min ? newQS.set('min_price', min) : newQS.delete('min_price');
    max ? newQS.set('max_price', max) : newQS.delete('max_price');
    newQS.delete('page');
    Router.navigate('/shop?' + newQS.toString());
  });
  document.getElementById('sortSelect').addEventListener('change', (e) => updateFilter('sort', e.target.value));

  function updateFilter(key, val) {
    const newQS = new URLSearchParams(qs.toString());
    val ? newQS.set(key, val) : newQS.delete(key);
    newQS.delete('page');
    Router.navigate('/shop?' + newQS.toString());
  }

  // Build sort/order
  const sortParts = sort.split('_');
  const sortOrder = sortParts.pop();
  const sortField = sortParts.join('_');
  const params = new URLSearchParams({ page, limit, sort: sortField, order: sortOrder });
  if (category) params.set('category', category);
  if (search) params.set('search', search);
  if (featured) params.set('featured', featured);
  if (newArrival) params.set('new_arrival', newArrival);
  const minP = qs.get('min_price'), maxP = qs.get('max_price');
  if (minP) params.set('min_price', minP);
  if (maxP) params.set('max_price', maxP);

  const data = await api.get('/products?' + params).catch(() => ({ products: [], total: 0 }));

  const title = search ? `Search: "${search}"` : category ? (cats.find(c => c.slug === category)?.name || 'Shop') : newArrival ? 'New Arrivals' : featured ? 'Featured' : 'All Products';
  document.getElementById('shopTitle').textContent = title;
  document.getElementById('shopCount').textContent = `${data.total} products`;

  const grid = document.getElementById('shopGrid');
  if (!data.products.length) {
    grid.innerHTML = '<div class="shop-empty" style="grid-column:1/-1"><p>No products found. Try adjusting your filters.</p></div>';
  } else {
    grid.innerHTML = data.products.map(productCardHTML).join('');
    bindProductCards(grid);
  }

  // Pagination
  const totalPages = Math.ceil(data.total / limit);
  if (totalPages > 1) {
    const pag = document.getElementById('shopPagination');
    pag.className = 'pagination';
    pag.innerHTML = `
      <button class="page-btn" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''}>← Prev</button>
      ${Array.from({ length: totalPages }, (_, i) => `<button class="page-btn ${page === i+1 ? 'active' : ''}" data-page="${i+1}">${i+1}</button>`).join('')}
      <button class="page-btn" data-page="${page + 1}" ${page === totalPages ? 'disabled' : ''}>Next →</button>
    `;
    pag.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!btn.disabled) { const newQS = new URLSearchParams(qs.toString()); newQS.set('page', btn.dataset.page); Router.navigate('/shop?' + newQS); }
      });
    });
  }
  Router.bindLinks();
}
