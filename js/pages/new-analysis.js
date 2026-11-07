/**
 * PAGE 3: Campaign Setup & Media/Evidence Upload (/analysis/new)
 * Fast benchmark pre-fill, two-column upload layout, dropzones, live API grounding toggle.
 */

import { store } from '../store.js';
import { BENCHMARK_CAMPAIGN } from '../mock-data.js';
import { renderHeader, bindHeaderEvents } from '../components/nav.js';

export function renderNewAnalysisPage(container, router) {
  // Form State
  let formData = {
    brandName: '',
    productName: '',
    category: 'Consumer Electronics',
    targetAudience: '',
    objective: 'Direct Conversions',
    headline: '',
    bodyText: '',
    callToAction: '',
    image: null,
    imageFileName: null,
    imageFileSize: null,
    reviewsFile: null,
    reviewsRowCount: 0,
    liveApiEnrichment: true
  };

  let validationErrors = {};

  function loadBenchmarkData() {
    formData = {
      brandName: BENCHMARK_CAMPAIGN.brandName,
      productName: BENCHMARK_CAMPAIGN.productName,
      category: BENCHMARK_CAMPAIGN.category,
      targetAudience: BENCHMARK_CAMPAIGN.targetAudience,
      objective: BENCHMARK_CAMPAIGN.objective,
      headline: BENCHMARK_CAMPAIGN.headline,
      bodyText: BENCHMARK_CAMPAIGN.bodyText,
      callToAction: BENCHMARK_CAMPAIGN.callToAction,
      image: BENCHMARK_CAMPAIGN.image,
      imageFileName: 'aurawave-pro-anc-hero.png',
      imageFileSize: '1.8 MB (1200 x 1200)',
      reviewsFile: 'aurawave_48_customer_reviews.csv',
      reviewsRowCount: 48,
      liveApiEnrichment: true
    };
    validationErrors = {};
    render();
    window.showToast?.('Benchmark loaded: AuraWave Pro ANC Headphones');
  }

  function validate() {
    validationErrors = {};
    if (!formData.brandName.trim()) validationErrors.brandName = 'Brand name is required';
    if (!formData.productName.trim()) validationErrors.productName = 'Product name is required';
    if (!formData.headline.trim()) validationErrors.headline = 'Ad headline is required';
    if (!formData.callToAction.trim()) validationErrors.callToAction = 'Call to action is required';
    return Object.keys(validationErrors).length === 0;
  }

  function render() {
    container.innerHTML = `
      ${renderHeader('/analysis/new')}

      <main class="main-content">
        <div class="container section-gap" style="margin-top: var(--spacing-40);">
          
          <!-- Back Link & Header -->
          <div style="margin-bottom: var(--spacing-20);">
            <a href="/dashboard" class="link-ember" style="font-size: 13px;" data-link>← Back to Dashboard</a>
          </div>

          <div class="setup-page-header">
            <h1 style="font-size: 38px; margin-bottom: 8px;">Pre-Flight Campaign Ingestion</h1>
            <p style="font-size: 15px; max-width: 720px;">
              Upload ad visuals, messaging claims, and real-world consumer review datasets for synthetic focus group evaluation.
            </p>
          </div>

          <!-- Pitch Hero / Fast-Track Banner -->
          <div class="fast-track-banner">
            <div class="fast-track-text">
              <span class="tag tag-brass" style="margin-bottom: 6px; font-size: 11px;">1-Click Evaluator Benchmark</span>
              <h4>Load Demo Benchmark: AuraWave Pro ANC Headphones</h4>
              <p>Pre-fills all ad copy fields, mounts the tested creative thumbnail, and attaches 48 real customer reviews.</p>
            </div>
            <button id="btn-load-benchmark" class="btn btn-evaluator">
              ⚡ Load Demo Benchmark
            </button>
          </div>

          <!-- Main Two-Column Setup Form -->
          <form id="campaign-setup-form" novalidate>
            <div class="setup-grid-layout">
              
              <!-- Column A: Campaign Context & Copy -->
              <div class="setup-column">
                <div class="setup-column-title">
                  <span>1. Campaign Context &amp; Copy</span>
                  <span class="text-caption">Required Claims</span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-16);">
                  <div class="form-group">
                    <label class="form-label" for="input-brand">Brand Name</label>
                    <input 
                      type="text" 
                      id="input-brand" 
                      class="form-input ${validationErrors.brandName ? 'has-error' : ''}" 
                      placeholder="e.g. AuraSound"
                      value="${formData.brandName}"
                    />
                    ${validationErrors.brandName ? `<div class="form-error-msg">${validationErrors.brandName}</div>` : ''}
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="input-product">Product Name</label>
                    <input 
                      type="text" 
                      id="input-product" 
                      class="form-input ${validationErrors.productName ? 'has-error' : ''}" 
                      placeholder="e.g. AuraWave Pro"
                      value="${formData.productName}"
                    />
                    ${validationErrors.productName ? `<div class="form-error-msg">${validationErrors.productName}</div>` : ''}
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-16);">
                  <div class="form-group">
                    <label class="form-label" for="select-category">Product Category</label>
                    <select id="select-category" class="form-select">
                      <option value="Consumer Electronics" ${formData.category === 'Consumer Electronics' ? 'selected' : ''}>Consumer Electronics</option>
                      <option value="Beauty" ${formData.category === 'Beauty' ? 'selected' : ''}>Beauty &amp; Skincare</option>
                      <option value="Apparel & Gear" ${formData.category === 'Apparel & Gear' ? 'selected' : ''}>Apparel &amp; Gear</option>
                      <option value="Food & Beverage" ${formData.category === 'Food & Beverage' ? 'selected' : ''}>Food &amp; Beverage</option>
                      <option value="SaaS" ${formData.category === 'SaaS' ? 'selected' : ''}>SaaS &amp; Digital</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="select-objective">Campaign Objective</label>
                    <select id="select-objective" class="form-select">
                      <option value="Direct Conversions" ${formData.objective === 'Direct Conversions' ? 'selected' : ''}>Direct Conversions</option>
                      <option value="Conversions" ${formData.objective === 'Conversions' ? 'selected' : ''}>Conversions</option>
                      <option value="Brand Recall" ${formData.objective === 'Brand Recall' ? 'selected' : ''}>Brand Recall</option>
                      <option value="Lead Gen" ${formData.objective === 'Lead Gen' ? 'selected' : ''}>Lead Generation</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="input-audience">Target Audience Description</label>
                  <textarea 
                    id="input-audience" 
                    class="form-textarea" 
                    placeholder="Describe your intended buyers, their pain points, and current alternatives..."
                  >${formData.targetAudience}</textarea>
                  <span class="form-helper">Informs persona calibration and objection sensitivity.</span>
                </div>

                <!-- Ad Copy Section -->
                <div style="margin-top: var(--spacing-32); padding-top: var(--spacing-20); border-top: 1px solid var(--color-mist);">
                  <h4 style="font-size: 16px; margin-bottom: var(--spacing-16);">Ad Creative Copy</h4>

                  <div class="form-group">
                    <label class="form-label" for="input-headline">Headline</label>
                    <input 
                      type="text" 
                      id="input-headline" 
                      class="form-input ${validationErrors.headline ? 'has-error' : ''}" 
                      placeholder="e.g. Silence The World. Hear Only What Matters."
                      value="${formData.headline}"
                    />
                    ${validationErrors.headline ? `<div class="form-error-msg">${validationErrors.headline}</div>` : ''}
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="input-body">Body / Primary Text</label>
                    <textarea 
                      id="input-body" 
                      class="form-textarea" 
                      placeholder="Describe the product value proposition, specs, price point..."
                    >${formData.bodyText}</textarea>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="input-cta">Call to Action (CTA)</label>
                    <input 
                      type="text" 
                      id="input-cta" 
                      class="form-input ${validationErrors.callToAction ? 'has-error' : ''}" 
                      placeholder="e.g. Shop Now — Limited First Batch"
                      value="${formData.callToAction}"
                    />
                    ${validationErrors.callToAction ? `<div class="form-error-msg">${validationErrors.callToAction}</div>` : ''}
                  </div>
                </div>

              </div>

              <!-- Column B: Media Upload & Real-World Evidence -->
              <div class="setup-column">
                <div class="setup-column-title">
                  <span>2. Media &amp; Evidence Grounding</span>
                  <span class="text-caption">Multimodal Inputs</span>
                </div>

                <!-- Dropzone 1: Creative Ingestion -->
                <div class="form-group">
                  <label class="form-label">Ad Creative Image</label>
                  
                  ${formData.image ? `
                    <div class="dropzone-preview">
                      <img src="${formData.image}" alt="Creative Preview" class="dropzone-preview-thumb" />
                      <div style="flex: 1;">
                        <div style="font-family: var(--font-polysans); font-size: 14px;">${formData.imageFileName || 'creative-asset.png'}</div>
                        <div style="font-size: 12px; color: var(--color-slate);">${formData.imageFileSize || '1.8 MB'}</div>
                      </div>
                      <button type="button" id="btn-remove-image" class="btn btn-secondary btn-sm" style="font-size: 12px;">Remove</button>
                    </div>
                  ` : `
                    <div id="dropzone-image" class="dropzone">
                      <input type="file" id="file-image-input" accept="image/png, image/jpeg, image/svg+xml" style="display: none;" />
                      <div class="dropzone-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </div>
                      <div class="dropzone-title">Drop ad creative visual here</div>
                      <div class="dropzone-desc">Supports PNG, JPG, SVG up to 15MB</div>
                    </div>
                  `}
                </div>

                <!-- Dropzone 2: Consumer Feedback Dataset -->
                <div class="form-group" style="margin-top: var(--spacing-24);">
                  <label class="form-label">Customer Feedback Dataset (Ground Truth Evidence)</label>
                  
                  ${formData.reviewsFile ? `
                    <div class="dropzone-preview">
                      <div style="width: 48px; height: 48px; background-color: var(--surface-ash); display: flex; align-items: center; justify-content: center; border: 1px solid var(--color-mist); flex-shrink: 0;">
                        <span style="font-family: var(--font-mono); font-size: 11px; color: var(--color-brass);">CSV</span>
                      </div>
                      <div style="flex: 1;">
                        <div style="font-family: var(--font-polysans); font-size: 14px;">${formData.reviewsFile}</div>
                        <div style="font-size: 12px; color: var(--color-steel);">
                          <strong style="color: var(--color-ember-orange);">${formData.reviewsRowCount} customer reviews detected</strong> • Categorized into 3 friction clusters
                        </div>
                      </div>
                      <button type="button" id="btn-remove-reviews" class="btn btn-secondary btn-sm" style="font-size: 12px;">Remove</button>
                    </div>
                  ` : `
                    <div id="dropzone-reviews" class="dropzone">
                      <input type="file" id="file-reviews-input" accept=".csv, .json" style="display: none;" />
                      <div class="dropzone-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                      </div>
                      <div class="dropzone-title">Upload Customer Reviews (CSV / JSON)</div>
                      <div class="dropzone-desc">Must contain review_text and rating columns</div>
                    </div>
                  `}
                </div>

                <!-- Live API Grounding Toggle -->
                <div class="form-group" style="margin-top: var(--spacing-24);">
                  <div class="switch-container">
                    <div>
                      <div style="font-family: var(--font-polysans); font-size: 14px; font-weight: 400; color: var(--color-graphite);">
                        Enrich with live Reddit / Public Forum API
                      </div>
                      <div style="font-size: 12px; color: var(--color-slate); margin-top: 2px;">
                        Dynamic external search across r/headphones and Trustpilot for emerging complaints.
                      </div>
                    </div>
                    <label class="switch">
                      <input type="checkbox" id="toggle-live-api" ${formData.liveApiEnrichment ? 'checked' : ''} />
                      <span class="switch-slider"></span>
                    </label>
                  </div>
                </div>

              </div>

            </div>

            <!-- Submission Bar -->
            <div class="submission-bar-card">
              <div class="submission-meta">
                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--color-brass);"></span>
                <span>Est. Token Compute: ~$0.04</span>
                <span style="color: var(--color-mist);">|</span>
                <span>5 Autonomous Personas</span>
                <span style="color: var(--color-mist);">|</span>
                <span>Evidence Grounding Active</span>
              </div>

              <!-- Primary Submit Button -->
              <button type="submit" id="btn-submit-simulation" class="btn btn-primary btn-lg">
                Launch Pre-Flight Simulation →
              </button>
            </div>
          </form>

        </div>
      </main>

      <!-- Footer -->
      <footer class="site-footer">
        <div class="container footer-content">
          <p class="text-caption">MindMarket • High-Precision Multimodal Verification</p>
          <span class="text-caption">Built for Adobe Hackathon 2026</span>
        </div>
      </footer>
    `;

    bindEvents();
  }

  function bindEvents() {
    bindHeaderEvents(router);

    // Fast Benchmark Load button
    const loadBtn = container.querySelector('#btn-load-benchmark');
    if (loadBtn) {
      loadBtn.addEventListener('click', () => {
        loadBenchmarkData();
      });
    }

    // Input handlers to keep formData state in sync
    const syncInput = (id, key) => {
      const el = container.querySelector(id);
      if (el) {
        el.addEventListener('input', (e) => {
          formData[key] = e.target.value;
        });
      }
    };

    syncInput('#input-brand', 'brandName');
    syncInput('#input-product', 'productName');
    syncInput('#select-category', 'category');
    syncInput('#select-objective', 'objective');
    syncInput('#input-audience', 'targetAudience');
    syncInput('#input-headline', 'headline');
    syncInput('#input-body', 'bodyText');
    syncInput('#input-cta', 'callToAction');

    // Live API toggle
    const toggleApi = container.querySelector('#toggle-live-api');
    if (toggleApi) {
      toggleApi.addEventListener('change', (e) => {
        formData.liveApiEnrichment = e.target.checked;
      });
    }

    // Image Dropzone
    const dropzoneImg = container.querySelector('#dropzone-image');
    const fileImgInput = container.querySelector('#file-image-input');
    if (dropzoneImg && fileImgInput) {
      dropzoneImg.addEventListener('click', () => fileImgInput.click());
      dropzoneImg.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzoneImg.classList.add('dragover');
      });
      dropzoneImg.addEventListener('dragleave', () => dropzoneImg.classList.remove('dragover'));
      dropzoneImg.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzoneImg.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          const file = e.dataTransfer.files[0];
          formData.image = URL.createObjectURL(file);
          formData.imageFileName = file.name;
          formData.imageFileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
          render();
        }
      });
      fileImgInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          formData.image = URL.createObjectURL(file);
          formData.imageFileName = file.name;
          formData.imageFileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
          render();
        }
      });
    }

    // Remove image button
    const removeImgBtn = container.querySelector('#btn-remove-image');
    if (removeImgBtn) {
      removeImgBtn.addEventListener('click', () => {
        formData.image = null;
        formData.imageFileName = null;
        formData.imageFileSize = null;
        render();
      });
    }

    // Reviews Dropzone
    const dropzoneRev = container.querySelector('#dropzone-reviews');
    const fileRevInput = container.querySelector('#file-reviews-input');
    if (dropzoneRev && fileRevInput) {
      dropzoneRev.addEventListener('click', () => fileRevInput.click());
      dropzoneRev.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzoneRev.classList.add('dragover');
      });
      dropzoneRev.addEventListener('dragleave', () => dropzoneRev.classList.remove('dragover'));
      dropzoneRev.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzoneRev.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          formData.reviewsFile = e.dataTransfer.files[0].name;
          formData.reviewsRowCount = 48;
          render();
        }
      });
      fileRevInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          formData.reviewsFile = e.target.files[0].name;
          formData.reviewsRowCount = 48;
          render();
        }
      });
    }

    // Remove reviews button
    const removeRevBtn = container.querySelector('#btn-remove-reviews');
    if (removeRevBtn) {
      removeRevBtn.addEventListener('click', () => {
        formData.reviewsFile = null;
        formData.reviewsRowCount = 0;
        render();
      });
    }

    // Form Submission: Requirement: Submitting on /analysis/new navigates to /analysis/demo-1
    const form = container.querySelector('#campaign-setup-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validate()) {
          // If user customized values, store new campaign or use demo-1
          if (formData.brandName === BENCHMARK_CAMPAIGN.brandName) {
            window.showToast?.('Launching pre-flight simulation for AuraWave Pro...');
            router.navigate('/analysis/demo-1');
          } else {
            const created = store.addCampaign({
              ...formData,
              image: formData.image || 'assets/images/aurawave-pro.svg',
              overallScore: 58,
              riskLevel: 'high',
              riskLabel: 'High Conversion Risk',
              groundingStatus: `${formData.reviewsRowCount || 48} Reviews Analyzed`,
              groundingConfidence: 91
            });
            window.showToast?.(`Launching simulation for ${created.productName}...`);
            router.navigate(`/analysis/${created.id}`);
          }
        } else {
          render();
        }
      });
    }
  }

  render();
}
