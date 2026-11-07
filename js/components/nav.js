/**
 * Ventriloc Navigation Bar Component
 * Floating pill capsule with smooth bubble switch animation and brand settings link.
 */

import { store } from '../store.js';

export function renderHeader(currentPath = '/dashboard') {
  const user = store.user;
  const isAuth = !!user;

  return `
    <header class="site-header">
      <div class="container header-container">
        <!-- Brand Identity -->
        <a href="/dashboard" class="brand-identity" data-link>
          <span class="brand-wordmark">
            MindMarket
            <span class="brand-ember-dot"></span>
          </span>
          <span class="brand-descriptor">Consumer Intelligence &amp; Ad Testing</span>
        </a>

        <!-- Floating Nav Pill Container (Requirement 1 & 2: smooth bubble switch & Brand & Profile replacement) -->
        ${isAuth ? `
          <nav class="nav-pill-container" aria-label="Main Navigation">
            <a href="/dashboard" class="nav-pill-link ${currentPath === '/dashboard' ? 'active' : ''}" data-link>Dashboard</a>
            <a href="/analysis/new" class="nav-pill-link ${currentPath === '/analysis/new' ? 'active' : ''}" data-link>+ New Analysis</a>
            <a href="/settings" class="nav-pill-link ${currentPath === '/settings' ? 'active' : ''}" data-link>Brand &amp; Profile</a>
          </nav>
        ` : `
          <nav class="nav-pill-container" aria-label="Public Navigation">
            <a href="/login" class="nav-pill-link active" data-link>Evaluator Portal</a>
          </nav>
        `}

        <!-- Header Actions: User Badge displays live updated username & role -->
        <div class="header-actions">
          ${isAuth ? `
            <a href="/settings" class="user-badge" title="Click to manage profile &amp; brand details" data-link>
              <span class="judge-indicator"></span>
              <span id="header-user-display-name">${user.name || 'Evaluator'} (${user.role || 'Evaluator'})</span>
            </a>
            <button id="btn-signout" class="btn btn-ghost btn-sm" title="End Session">Sign Out</button>
          ` : `
            <a href="/login" class="btn btn-primary btn-sm" data-link>Sign In</a>
          `}
        </div>
      </div>
    </header>
  `;
}

export function bindHeaderEvents(router) {
  const signOutBtn = document.getElementById('btn-signout');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
      store.signOut();
      router.navigate('/login');
    });
  }
}
