/**
 * PAGE: Brand & Profile Workspace Landing Page (/settings)
 * Allows users to update their username (which updates top-right badge), brand name,
 * and upload custom files for the brand logo / creative mark.
 */

import { store } from '../store.js';
import { renderHeader, bindHeaderEvents } from '../components/nav.js';

export function renderSettingsPage(container, router) {
  let user = store.user || store.quickDemoLogin();

  let formState = {
    name: user.name || 'Adobe Hackathon Judge',
    email: user.email || 'judge@adobe-hackathon.org',
    role: user.role || 'Evaluator',
    brandName: user.brandName || 'AuraSound',
    brandTagline: user.brandTagline || 'Next-Gen Acoustic Hardware',
    brandCategory: user.brandCategory || 'Consumer Electronics',
    websiteUrl: user.websiteUrl || 'https://aurasound.audio',
    brandLogo: user.brandLogo || 'assets/images/aurawave-pro.svg',
    customLogoFileName: null
  };

  const presetLogos = [
    { id: 'logo-audio', name: 'Acoustic Wave', url: 'assets/images/aurawave-pro.svg' },
    { id: 'logo-dropper', name: 'Clinical Dropper', url: 'assets/images/lumina-skin.svg' },
    { id: 'logo-bottle', name: 'Precision Vessel', url: 'assets/images/veloce-bottle.svg' },
    { id: 'logo-bar', name: 'Energy Block', url: 'assets/images/nutribite-bar.svg' }
  ];

  function render() {
    container.innerHTML = `
      ${renderHeader('/settings')}

      <main class="main-content">
        <div class="container section-gap" style="margin-top: var(--spacing-40);">
          
          <div style="margin-bottom: var(--spacing-20);">
            <a href="/dashboard" class="link-ember" style="font-size: 13px;" data-link>← Back to Dashboard</a>
          </div>

          <div class="setup-page-header" style="margin-bottom: var(--spacing-36);">
            <span class="tag tag-brass" style="margin-bottom: 8px;">Workspace Customization</span>
            <h1 style="font-size: 38px; margin-top: 4px; margin-bottom: 8px;">Brand &amp; Profile Identity</h1>
            <p style="font-size: 15px; max-width: 720px;">
              Manage your analyst persona, brand assets, and custom logo marks. Changes immediately update your active session and header badges.
            </p>
          </div>

          <div class="settings-grid">
            
            <!-- Left Column: Settings Form -->
            <div>
              <form id="profile-settings-form" novalidate>
                
                <!-- Section 1: User Profile -->
                <div class="settings-card">
                  <h3 style="font-size: 20px; margin-bottom: 4px;">User Profile</h3>
                  <p style="font-size: 13px; color: var(--color-slate); margin-bottom: var(--spacing-24);">
                    This identity is displayed in the top-right navigation badge and signs off on generated ad reports.
                  </p>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-20);">
                    <div class="form-group">
                      <label class="form-label" for="setting-username">Display Name / Username</label>
                      <input 
                        type="text" 
                        id="setting-username" 
                        class="form-input" 
                        value="${formState.name}" 
                        placeholder="e.g. Radu Popescu"
                        required 
                      />
                      <span class="form-helper">Appears immediately in the top right badge.</span>
                    </div>

                    <div class="form-group">
                      <label class="form-label" for="setting-role">Evaluator Role / Title</label>
                      <select id="setting-role" class="form-select">
                        <option value="Evaluator" ${formState.role === 'Evaluator' ? 'selected' : ''}>Adobe Hackathon Judge (Evaluator)</option>
                        <option value="Creative Director" ${formState.role === 'Creative Director' ? 'selected' : ''}>Creative Director</option>
                        <option value="Growth Lead" ${formState.role === 'Growth Lead' ? 'selected' : ''}>Growth &amp; Performance Lead</option>
                        <option value="Consumer Insights" ${formState.role === 'Consumer Insights' ? 'selected' : ''}>Consumer Insights Analyst</option>
                        <option value="Founder" ${formState.role === 'Founder' ? 'selected' : ''}>Brand Founder / CEO</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="setting-email">Work Email</label>
                    <input 
                      type="email" 
                      id="setting-email" 
                      class="form-input" 
                      value="${formState.email}" 
                      placeholder="analyst@brand.com"
                    />
                  </div>
                </div>

                <!-- Section 2: Brand Identity -->
                <div class="settings-card">
                  <h3 style="font-size: 20px; margin-bottom: 4px;">Brand Workspace Details</h3>
                  <p style="font-size: 13px; color: var(--color-slate); margin-bottom: var(--spacing-24);">
                    Default brand assets and taxonomy used to calibrate AI persona pre-flight simulations.
                  </p>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-20);">
                    <div class="form-group">
                      <label class="form-label" for="setting-brandname">Brand Name</label>
                      <input 
                        type="text" 
                        id="setting-brandname" 
                        class="form-input" 
                        value="${formState.brandName}" 
                        placeholder="e.g. AuraSound"
                      />
                    </div>

                    <div class="form-group">
                      <label class="form-label" for="setting-category">Primary Category</label>
                      <select id="setting-category" class="form-select">
                        <option value="Consumer Electronics" ${formState.brandCategory === 'Consumer Electronics' ? 'selected' : ''}>Consumer Electronics</option>
                        <option value="Beauty" ${formState.brandCategory === 'Beauty' ? 'selected' : ''}>Beauty &amp; Skincare</option>
                        <option value="Apparel & Gear" ${formState.brandCategory === 'Apparel & Gear' ? 'selected' : ''}>Apparel &amp; Gear</option>
                        <option value="Food & Beverage" ${formState.brandCategory === 'Food & Beverage' ? 'selected' : ''}>Food &amp; Beverage</option>
                        <option value="SaaS" ${formState.brandCategory === 'SaaS' ? 'selected' : ''}>SaaS &amp; Digital</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="setting-tagline">Brand Descriptor / Mission</label>
                    <input 
                      type="text" 
                      id="setting-tagline" 
                      class="form-input" 
                      value="${formState.brandTagline}" 
                      placeholder="e.g. Next-Gen Acoustic Hardware"
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="setting-website">Website URL</label>
                    <input 
                      type="url" 
                      id="setting-website" 
                      class="form-input" 
                      value="${formState.websiteUrl}" 
                      placeholder="https://brand.com"
                    />
                  </div>

                  <!-- Brand Logo Selector with Custom File Upload (Requirement 3) -->
                  <div class="form-group" style="margin-top: var(--spacing-24);">
                    <label class="form-label">Brand Logo / Creative Mark</label>
                    <div class="brand-logo-selector">
                      
                      <!-- Preview Box -->
                      <div class="brand-logo-preview-box">
                        <img src="${formState.brandLogo}" alt="Logo Preview" id="logo-preview-img" />
                      </div>

                      <div style="flex: 1;">
                        <span style="font-size: 13px; color: var(--color-graphite); display: block; margin-bottom: 6px;">
                          Option A: Select From Preset Marks:
                        </span>
                        
                        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px;">
                          ${presetLogos.map(p => `
                            <button 
                              type="button" 
                              class="btn btn-secondary btn-sm preset-logo-btn ${formState.brandLogo === p.url ? 'active' : ''}" 
                              data-logo-url="${p.url}"
                              style="font-size: 11px; padding: 4px 10px;"
                            >
                              ${p.name}
                            </button>
                          `).join('')}
                        </div>

                        <!-- Option B: Custom File Upload Option (Requirement 3) -->
                        <div class="custom-logo-uploader">
                          <input 
                            type="file" 
                            id="input-custom-logo-file" 
                            accept="image/png, image/jpeg, image/svg+xml, image/webp" 
                            style="display: none;" 
                          />
                          <button type="button" id="btn-browse-logo" class="btn btn-secondary btn-sm" style="font-size: 12px;">
                            📁 Upload Custom File (PNG, SVG, JPG)
                          </button>
                          <span id="custom-logo-file-label" style="font-size: 12px; color: var(--color-steel);">
                            ${formState.customLogoFileName ? `Selected: ${formState.customLogoFileName}` : 'Or choose your own logo image'}
                          </span>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>

                <!-- Submit Action -->
                <div style="display: flex; gap: 16px; align-items: center; margin-top: var(--spacing-32);">
                  <button type="submit" id="btn-save-settings" class="btn btn-primary btn-lg">
                    Save Profile &amp; Brand Settings
                  </button>
                  <button type="button" id="btn-reset-settings" class="btn btn-ghost">
                    Reset to Defaults
                  </button>
                </div>
              </form>
            </div>

            <!-- Right Column: Live Identity Preview Card -->
            <div class="settings-preview-card">
              <span class="tag tag-brass" style="margin-bottom: 12px; font-size: 11px;">Live Header Badge Preview</span>
              
              <div style="background-color: var(--surface-canvas); border: 1px solid var(--color-mist); padding: 16px; border-radius: var(--radius-cards); margin-bottom: var(--spacing-20);">
                <div style="font-size: 11px; color: var(--color-slate); text-transform: uppercase; margin-bottom: 6px; font-family: var(--font-mono);">
                  Header Navigation Pill:
                </div>
                <div class="user-badge" style="display: inline-flex;">
                  <span class="judge-indicator"></span>
                  <span id="preview-badge-name">${formState.name} (${formState.role})</span>
                </div>
              </div>

              <div style="background-color: var(--surface-canvas); border: 1px solid var(--color-mist); padding: 20px; border-radius: var(--radius-cards);">
                <div style="font-size: 11px; color: var(--color-slate); text-transform: uppercase; margin-bottom: 12px; font-family: var(--font-mono);">
                  Brand Card Preview:
                </div>
                <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 12px;">
                  <div style="width: 52px; height: 52px; border: 1px solid var(--color-mist); background-color: var(--surface-fog); display: flex; align-items: center; justify-content: center; padding: 4px;">
                    <img src="${formState.brandLogo}" alt="Brand Preview" id="preview-brand-img" style="max-width: 100%; max-height: 100%;" />
                  </div>
                  <div>
                    <h4 style="font-size: 16px; margin: 0;" id="preview-brand-title">${formState.brandName}</h4>
                    <span style="font-size: 12px; color: var(--color-steel);" id="preview-brand-tagline">${formState.brandTagline}</span>
                  </div>
                </div>
                <div style="font-size: 12px; color: var(--color-slate); border-top: 1px solid var(--color-mist); padding-top: 8px;">
                  <span>Category: </span><strong id="preview-brand-category" style="color: var(--color-graphite);">${formState.brandCategory}</strong>
                </div>
              </div>

              <div style="margin-top: var(--spacing-20); font-size: 12px; color: var(--color-steel);">
                <p>Changes synchronize live with the backend REST API.</p>
              </div>
            </div>

          </div>

        </div>
      </main>

      <footer class="site-footer">
        <div class="container footer-content">
          <p class="text-caption">MindMarket © 2026 • Workspace Settings</p>
          <a href="/dashboard" class="link-ember" data-link>Return to Dashboard</a>
        </div>
      </footer>
    `;

    bindEvents();
  }

  function bindEvents() {
    bindHeaderEvents(router);

    // Live preview typing synchronization
    const usernameInput = container.querySelector('#setting-username');
    const roleSelect = container.querySelector('#setting-role');
    const brandNameInput = container.querySelector('#setting-brandname');
    const taglineInput = container.querySelector('#setting-tagline');
    const categorySelect = container.querySelector('#setting-category');

    const previewBadgeName = container.querySelector('#preview-badge-name');
    const previewBrandTitle = container.querySelector('#preview-brand-title');
    const previewBrandTagline = container.querySelector('#preview-brand-tagline');
    const previewBrandCategory = container.querySelector('#preview-brand-category');

    if (usernameInput) {
      usernameInput.addEventListener('input', (e) => {
        formState.name = e.target.value || 'Evaluator';
        if (previewBadgeName) previewBadgeName.textContent = `${formState.name} (${formState.role})`;
      });
    }

    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        formState.role = e.target.value;
        if (previewBadgeName) previewBadgeName.textContent = `${formState.name} (${formState.role})`;
      });
    }

    if (brandNameInput) {
      brandNameInput.addEventListener('input', (e) => {
        formState.brandName = e.target.value || 'Brand';
        if (previewBrandTitle) previewBrandTitle.textContent = formState.brandName;
      });
    }

    if (taglineInput) {
      taglineInput.addEventListener('input', (e) => {
        formState.brandTagline = e.target.value || '';
        if (previewBrandTagline) previewBrandTagline.textContent = formState.brandTagline;
      });
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        formState.brandCategory = e.target.value;
        if (previewBrandCategory) previewBrandCategory.textContent = formState.brandCategory;
      });
    }

    // Logo preset selection
    const presetBtns = container.querySelectorAll('.preset-logo-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-logo-url');
        formState.brandLogo = url;
        formState.customLogoFileName = null;
        const logoPreviewImg = container.querySelector('#logo-preview-img');
        const previewBrandImg = container.querySelector('#preview-brand-img');
        const customLabel = container.querySelector('#custom-logo-file-label');
        if (logoPreviewImg) logoPreviewImg.src = url;
        if (previewBrandImg) previewBrandImg.src = url;
        if (customLabel) customLabel.textContent = 'Or choose your own logo image';
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Custom File Upload Input Handler (Requirement 3)
    const browseBtn = container.querySelector('#btn-browse-logo');
    const fileInput = container.querySelector('#input-custom-logo-file');
    const customLabel = container.querySelector('#custom-logo-file-label');

    if (browseBtn && fileInput) {
      browseBtn.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          formState.customLogoFileName = file.name;

          const reader = new FileReader();
          reader.onload = (loadEvent) => {
            const dataUrl = loadEvent.target.result;
            formState.brandLogo = dataUrl;
            
            const logoPreviewImg = container.querySelector('#logo-preview-img');
            const previewBrandImg = container.querySelector('#preview-brand-img');
            if (logoPreviewImg) logoPreviewImg.src = dataUrl;
            if (previewBrandImg) previewBrandImg.src = dataUrl;
            if (customLabel) customLabel.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(0)} KB)`;

            presetBtns.forEach(b => b.classList.remove('active'));
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Save Form
    const form = container.querySelector('#profile-settings-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        await store.updateUserProfile({
          name: formState.name,
          email: formState.email,
          role: formState.role,
          brandName: formState.brandName,
          brandTagline: formState.brandTagline,
          brandCategory: formState.brandCategory,
          websiteUrl: formState.websiteUrl,
          brandLogo: formState.brandLogo
        });

        window.showToast?.('Brand & Profile settings updated successfully!');
        render();
      });
    }

    // Reset button
    const resetBtn = container.querySelector('#btn-reset-settings');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        await store.updateUserProfile({
          name: 'Adobe Hackathon Judge',
          email: 'judge@adobe-hackathon.org',
          role: 'Evaluator',
          brandName: 'AuraSound',
          brandTagline: 'Next-Gen Acoustic Hardware',
          brandCategory: 'Consumer Electronics',
          websiteUrl: 'https://aurasound.audio',
          brandLogo: 'assets/images/aurawave-pro.svg'
        });
        formState = { ...store.user, customLogoFileName: null };
        window.showToast?.('Settings reset to benchmark defaults.');
        render();
      });
    }
  }

  render();
}
