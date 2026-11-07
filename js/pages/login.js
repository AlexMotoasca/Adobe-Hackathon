/**
 * PAGE 1: User Authentication (/login)
 * Clean authentication screen with zero-friction bypass and Google Sign-In.
 */

import { store } from '../store.js';

export function renderLoginPage(container, router) {
  let isRegisterTab = false;
  let showPassword = false;

  function render() {
    container.innerHTML = `
      <div class="login-page-wrap">
        <div class="login-card-container">
          
          <!-- Brand Identity Header -->
          <div style="text-align: center; margin-bottom: var(--spacing-32);">
            <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-family: var(--font-polysans); font-size: 28px; font-weight: 400; letter-spacing: -0.02em;">MindMarket</span>
              <span class="brand-ember-dot" style="width: 8px; height: 8px;"></span>
            </div>
            <p style="font-size: 14px; color: var(--color-steel);">Consumer Intelligence &amp; Ad Testing Platform</p>
          </div>

          <!-- Auth Card Container -->
          <div class="login-auth-card">
            
            <!-- Standard Tab/Toggle: Sign In vs Register -->
            <div class="login-tabs-toggle">
              <button id="tab-signin" class="login-tab-btn ${!isRegisterTab ? 'active' : ''}">Sign In</button>
              <button id="tab-register" class="login-tab-btn ${isRegisterTab ? 'active' : ''}">Register</button>
            </div>

            <!-- 1. Sign In With Google Option -->
            <button type="button" id="btn-google-signin" class="btn-google">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div class="auth-bypass-divider" style="margin: 16px 0;">
              <span>or sign in with email</span>
            </div>

            <!-- Form -->
            <form id="auth-form" novalidate>
              <div class="form-group">
                <label class="form-label" for="auth-email">Work Email</label>
                <input 
                  type="email" 
                  id="auth-email" 
                  class="form-input" 
                  placeholder="analyst@brand.com"
                  autocomplete="email"
                />
                <div id="email-error" class="form-error-msg" style="display: none;">Please enter a valid business email address.</div>
              </div>

              <div class="form-group">
                <label class="form-label" for="auth-password">Password</label>
                <div class="password-input-wrap">
                  <input 
                    type="${showPassword ? 'text' : 'password'}" 
                    id="auth-password" 
                    class="form-input" 
                    placeholder="••••••••••••"
                    autocomplete="current-password"
                  />
                  <button type="button" id="btn-toggle-password" class="password-toggle-btn">
                    ${showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
                <div id="password-error" class="form-error-msg" style="display: none;">Password must be at least 6 characters.</div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-20); font-size: 13px;">
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--color-steel);">
                  <input type="checkbox" checked style="accent-color: var(--color-graphite);" />
                  Remember this device
                </label>
                <a href="#" class="link-ember" style="font-size: 12px;" onclick="event.preventDefault(); alert('Reset password link sent to mock email.');">Forgot password?</a>
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">
                ${isRegisterTab ? 'Create Workspace Account' : 'Sign In to Workspace'}
              </button>
            </form>

            <!-- Evaluator Fast Track Divider -->
            <div class="auth-bypass-divider">
              <span>Adobe Hackathon Evaluator Access</span>
            </div>

            <!-- One-Click Hackathon Evaluator Bypass (Crucial) -->
            <div class="bypass-card">
              <span class="bypass-card-tag">Fast-Track Demo Access</span>
              <p style="font-size: 12px; color: var(--color-steel); margin-bottom: 12px;">
                Instant zero-friction authentication bypass configured for judges and evaluators. No credentials required.
              </p>
              <button id="btn-judge-bypass" class="btn btn-evaluator" style="width: 100%; justify-content: center;">
                ⚡ Quick Demo Access (Judge / Evaluator)
              </button>
            </div>

          </div>

          <!-- Subtle Footer Disclaimer -->
          <div style="text-align: center; margin-top: var(--spacing-24);">
            <p class="text-caption">Built for Adobe Hackathon 2026 • Local Sandbox Mode</p>
          </div>

        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Google Sign-In Click
    const googleBtn = container.querySelector('#btn-google-signin');
    if (googleBtn) {
      googleBtn.addEventListener('click', () => {
        store.saveUser({
          id: "google-" + Date.now(),
          name: "Alex Mercer",
          email: "alex.mercer@gmail.com",
          role: "Evaluator",
          brandName: "AuraSound",
          brandTagline: "Next-Gen Acoustic Hardware",
          brandCategory: "Consumer Electronics",
          brandLogo: "assets/images/aurawave-pro.svg",
          websiteUrl: "https://aurasound.audio",
          isEvaluator: true,
          authenticatedAt: new Date().toISOString()
        });
        window.showToast?.('Signed in with Google Account');
        router.navigate('/dashboard');
      });
    }

    // Tab switching
    const tabSignIn = container.querySelector('#tab-signin');
    const tabRegister = container.querySelector('#tab-register');
    if (tabSignIn && tabRegister) {
      tabSignIn.addEventListener('click', () => {
        isRegisterTab = false;
        render();
      });
      tabRegister.addEventListener('click', () => {
        isRegisterTab = true;
        render();
      });
    }

    // Password toggle
    const togglePassBtn = container.querySelector('#btn-toggle-password');
    if (togglePassBtn) {
      togglePassBtn.addEventListener('click', () => {
        showPassword = !showPassword;
        const passInput = container.querySelector('#auth-password');
        if (passInput) {
          passInput.type = showPassword ? 'text' : 'password';
          togglePassBtn.textContent = showPassword ? 'HIDE' : 'SHOW';
        }
      });
    }

    // Evaluator Bypass Click
    const bypassBtn = container.querySelector('#btn-judge-bypass');
    if (bypassBtn) {
      bypassBtn.addEventListener('click', (e) => {
        e.preventDefault();
        store.quickDemoLogin();
        window.showToast?.('Authenticated as Adobe Hackathon Judge');
        router.navigate('/dashboard');
      });
    }

    // Standard Form Submit with validation
    const form = container.querySelector('#auth-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = container.querySelector('#auth-email');
        const passInput = container.querySelector('#auth-password');
        const emailErr = container.querySelector('#email-error');
        const passErr = container.querySelector('#password-error');

        let isValid = true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
          emailInput.classList.add('has-error');
          emailErr.style.display = 'block';
          isValid = false;
        } else {
          emailInput.classList.remove('has-error');
          emailErr.style.display = 'none';
        }

        if (!passInput.value.trim() || passInput.value.trim().length < 6) {
          passInput.classList.add('has-error');
          passErr.style.display = 'block';
          isValid = false;
        } else {
          passInput.classList.remove('has-error');
          passErr.style.display = 'none';
        }

        if (isValid) {
          store.signIn(emailInput.value.trim(), passInput.value.trim());
          window.showToast?.(`Welcome back, ${emailInput.value.split('@')[0]}`);
          router.navigate('/dashboard');
        }
      });
    }
  }

  render();
}
