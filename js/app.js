/**
 * MindMarket Core Application Orchestrator
 * Bootstraps client router, global toast notification, and page rendering.
 */

import { Router } from './router.js';
import { store } from './store.js';
import { renderLoginPage } from './pages/login.js';
import { renderDashboardPage } from './pages/dashboard.js';
import { renderNewAnalysisPage } from './pages/new-analysis.js';
import { renderReportPage } from './pages/report.js';
import { renderSettingsPage } from './pages/settings.js';

// Global toast notification system
window.showToast = function(message) {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-ember-dot"></span>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'opacity 0.2s, transform 0.2s';
    setTimeout(() => toast.remove(), 200);
  }, 2800);
};

// Application Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');

  const routes = [
    {
      path: '/login',
      render: (params) => {
        renderLoginPage(appContainer, router);
      }
    },
    {
      path: '/dashboard',
      render: (params) => {
        if (!store.isAuthenticated()) {
          store.quickDemoLogin();
        }
        renderDashboardPage(appContainer, router);
      }
    },
    {
      path: '/analysis/new',
      render: (params) => {
        if (!store.isAuthenticated()) {
          store.quickDemoLogin();
        }
        renderNewAnalysisPage(appContainer, router);
      }
    },
    {
      path: '/analysis/:id',
      render: (params) => {
        if (!store.isAuthenticated()) {
          store.quickDemoLogin();
        }
        renderReportPage(appContainer, router, params);
      }
    },
    {
      path: '/settings',
      render: (params) => {
        if (!store.isAuthenticated()) {
          store.quickDemoLogin();
        }
        renderSettingsPage(appContainer, router);
      }
    }
  ];

  const defaultRoute = store.isAuthenticated() ? '/dashboard' : '/login';
  const router = new Router(routes, defaultRoute);
  
  window.__router = router;
  router.init();
});
