/**
 * MindMarket Client Router
 * Supports both HTML5 History API and Hash routing fallback.
 */

export class Router {
  constructor(routes, defaultRoute = '/dashboard') {
    this.routes = routes;
    this.defaultRoute = defaultRoute;
    this.currentRoute = null;
    this.currentParams = {};

    window.addEventListener('popstate', () => this.handleLocationChange());
    window.addEventListener('hashchange', () => this.handleLocationChange());

    // Intercept clicks on links with data-link
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-link]');
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        this.navigate(href);
      }
    });
  }

  getCurrentPath() {
    // If hash routing is used (e.g. #/dashboard or file:// protocol)
    if (window.location.protocol === 'file:' || window.location.hash) {
      const hash = window.location.hash.slice(1);
      return hash ? (hash.startsWith('/') ? hash : '/' + hash) : '/';
    }
    // Clean pathname
    return window.location.pathname || '/';
  }

  navigate(url) {
    // Normalize url
    if (!url.startsWith('/')) {
      url = '/' + url;
    }

    this.currentRenderedPath = null;

    if (window.location.protocol === 'file:') {
      // Use hash routing for local file protocol
      if (window.location.hash !== '#' + url) {
        window.location.hash = url;
      }
      this.handleLocationChange();
    } else {
      // HTML5 pushState
      window.history.pushState(null, '', url);
      this.handleLocationChange();
    }
  }

  matchRoute(path) {
    for (const route of this.routes) {
      const paramNames = [];
      const regexPath = route.path
        .replace(/\[([^\]]+)\]/g, (_, param) => {
          paramNames.push(param);
          return '([^/]+)';
        })
        .replace(/:([^/]+)/g, (_, param) => {
          paramNames.push(param);
          return '([^/]+)';
        });

      const regex = new RegExp(`^${regexPath}$`);
      const match = path.match(regex);

      if (match) {
        const params = {};
        paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });
        return { route, params };
      }
    }
    return null;
  }

  handleLocationChange() {
    let path = this.getCurrentPath();
    if (path === '' || path === '/') {
      path = this.defaultRoute;
      if (window.location.protocol === 'file:') {
        if (window.location.hash !== '#' + path) {
          window.location.hash = path;
        }
      } else {
        try { window.history.replaceState(null, '', path); } catch (e) {}
      }
    }

    if (this.currentRenderedPath === path) {
      return;
    }

    const matched = this.matchRoute(path);

    if (matched) {
      this.currentRenderedPath = path;
      this.currentRoute = matched.route;
      this.currentParams = matched.params;
      matched.route.render(matched.params);
    } else {
      // Fallback
      console.warn(`Route ${path} not found. Redirecting to ${this.defaultRoute}`);
      this.currentRenderedPath = null;
      this.navigate(this.defaultRoute);
    }

    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  init() {
    this.handleLocationChange();
  }
}
