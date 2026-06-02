const Router = (() => {
  const routes = {};

  function register(path, handler) { routes[path] = handler; }

  function navigate(path, push = true) {
    if (push) history.pushState({}, '', path);
    render(path);
    window.scrollTo(0, 0);
  }

  function render(fullPath) {
    const [path, search] = fullPath.split('?');
    const qs = new URLSearchParams(search || '');

    // Match static
    if (routes[path]) { routes[path](qs); return; }

    // Match dynamic /segment/:param
    for (const [pattern, handler] of Object.entries(routes)) {
      const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '([^/]+)') + '$');
      const match = path.match(regex);
      if (match) { handler(qs, ...match.slice(1)); return; }
    }

    // 404 fallback
    document.getElementById('main').innerHTML = '<div style="text-align:center;padding:80px 24px"><h2>Page not found</h2><a data-link href="/" style="color:var(--accent)">Go home</a></div>';
    bindLinks();
  }

  function bindLinks() {
    document.querySelectorAll('[data-link]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const href = el.getAttribute('href');
        if (href) navigate(href);
      });
    });
  }

  window.addEventListener('popstate', () => render(location.pathname + location.search));

  return { register, navigate, render, bindLinks };
})();
