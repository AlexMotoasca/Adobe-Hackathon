/**
 * PAGE 2: Dashboard & Campaign Overview (/dashboard)
 * Single-row table content, zero horizontal scroll, perfectly centered column elements.
 */

import { store } from '../store.js';
import { KPI_DATA } from '../mock-data.js';
import { renderHeader, bindHeaderEvents } from '../components/nav.js';
import { renderScoreGauge } from '../components/score-dial.js';

export function renderDashboardPage(container, router) {
  let searchTerm = '';
  let selectedRisk = 'all';
  let selectedObjective = 'all';

  function getFilteredCampaigns() {
    return store.campaigns.filter(c => {
      const matchesSearch = 
        (c.brandName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.headline || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRisk = selectedRisk === 'all' || c.riskLevel === selectedRisk;
      const matchesObjective = selectedObjective === 'all' || c.objective === selectedObjective;

      return matchesSearch && matchesRisk && matchesObjective;
    });
  }

  function render() {
    const campaigns = getFilteredCampaigns();

    container.innerHTML = `
      ${renderHeader('/dashboard')}

      <main class="main-content">
        <div class="container section-gap" style="margin-top: var(--spacing-40);">
          
          <!-- Page Header & Greeting -->
          <div class="dashboard-header-bar">
            <span class="tag tag-ash" style="margin-bottom: 8px;">Workspace Overview</span>
            <h1 style="font-size: 38px; margin-top: 4px; margin-bottom: 8px;">Ad Pre-Flight Observatory</h1>
            <p style="font-size: 15px; max-width: 680px;">
              Cross-referencing multimodal ad creatives against autonomous consumer personas and verified review datasets before ad spend deployment.
            </p>
          </div>

          <!-- Top Metric Bar (High-Level KPIs) -->
          <div class="kpi-metric-grid">
            <div class="card-data kpi-metric-card">
              <span class="kpi-title">Total Creatives Tested</span>
              <div class="kpi-value-row">
                <span class="kpi-value">${KPI_DATA.totalAdsTested}</span>
                <span class="tag tag-ash" style="font-size: 11px;">+3 this cycle</span>
              </div>
              <p class="kpi-subtext">Across 4 brand categories</p>
            </div>

            <div class="card-data kpi-metric-card">
              <span class="kpi-title">Average Readiness Score</span>
              <div class="kpi-value-row">
                <span class="kpi-value">${KPI_DATA.averageReadinessScore} <span style="font-size: 16px; color: var(--color-slate);">/ 100</span></span>
                <span class="tag tag-brass" style="font-size: 11px;">Benchmark: 62</span>
              </div>
              <p class="kpi-subtext">5 Persona weighted synthesis</p>
            </div>

            <div class="card-data kpi-metric-card">
              <span class="kpi-title">Estimated Ad Spend Protected</span>
              <div class="kpi-value-row">
                <span class="kpi-value">$${KPI_DATA.estimatedAdSpendSaved.toLocaleString()}</span>
                <span class="tag tag-ember" style="font-size: 11px;">Budget Risk Avoided</span>
              </div>
              <p class="kpi-subtext">Saved across 4 high-risk flags</p>
            </div>

            <div class="card-data kpi-metric-card">
              <span class="kpi-title">Customer Feedback Analyzed</span>
              <div class="kpi-value-row">
                <span class="kpi-value">${KPI_DATA.realReviewsGrounded.toLocaleString()}</span>
                <span class="tag tag-ash" style="font-size: 11px;">Verified Excerpts</span>
              </div>
              <p class="kpi-subtext">Ground truth verification baseline</p>
            </div>
          </div>

          <!-- Action Header -->
          <div class="analyses-header-row">
            <div>
              <h2 style="font-size: 26px;">Campaign Analyses</h2>
              <p style="font-size: 13px; color: var(--color-slate);">Historical tests, persona objections, and testable A/B variations</p>
            </div>
            <a href="/analysis/new" class="btn btn-primary" id="btn-start-analysis" data-link>
              + Start New Analysis
            </a>
          </div>

          <!-- Filter & Search Controls -->
          <div class="analyses-controls">
            <div class="search-input-wrap">
              <input 
                type="text" 
                id="search-campaigns" 
                class="form-input" 
                placeholder="Search by brand, product, or headline..."
                value="${searchTerm}"
              />
            </div>

            <div style="display: flex; gap: 8px; align-items: center;">
              <span style="font-size: 12px; color: var(--color-slate); text-transform: uppercase; font-family: var(--font-mono);">Risk Level:</span>
              <select id="filter-risk" class="form-select" style="width: auto; padding: 8px 12px; font-size: 13px;">
                <option value="all" ${selectedRisk === 'all' ? 'selected' : ''}>All Risks</option>
                <option value="high" ${selectedRisk === 'high' ? 'selected' : ''}>High Conversion Risk</option>
                <option value="moderate" ${selectedRisk === 'moderate' ? 'selected' : ''}>Moderate Friction</option>
                <option value="scale" ${selectedRisk === 'scale' ? 'selected' : ''}>Ready to Scale</option>
              </select>
            </div>

            <div style="display: flex; gap: 8px; align-items: center;">
              <span style="font-size: 12px; color: var(--color-slate); text-transform: uppercase; font-family: var(--font-mono);">Objective:</span>
              <select id="filter-objective" class="form-select" style="width: auto; padding: 8px 12px; font-size: 13px;">
                <option value="all" ${selectedObjective === 'all' ? 'selected' : ''}>All Objectives</option>
                <option value="Direct Conversions" ${selectedObjective === 'Direct Conversions' ? 'selected' : ''}>Direct Conversions</option>
                <option value="Conversions" ${selectedObjective === 'Conversions' ? 'selected' : ''}>Conversions</option>
                <option value="Brand Recall" ${selectedObjective === 'Brand Recall' ? 'selected' : ''}>Brand Recall</option>
              </select>
            </div>
          </div>

          <!-- Analyses Table / Grid (Aspect Ratio: ZERO horizontal scroll, perfectly centered, single row) -->
          ${campaigns.length > 0 ? `
            <div class="campaigns-table-container">
              <table class="campaigns-table">
                <thead>
                  <tr>
                    <th style="width: 6%; text-align: center;">Creative</th>
                    <th style="width: 26%; text-align: center;">Brand &amp; Product</th>
                    <th style="width: 13%; text-align: center;">Objective</th>
                    <th style="width: 17%; text-align: center;">Risk Status</th>
                    <th style="width: 11%; text-align: center;">Viability Score</th>
                    <th style="width: 14%; text-align: center;">Grounding Baseline</th>
                    <th style="width: 13%; text-align: center;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${campaigns.map(c => `
                    <tr>
                      <!-- Creative Centered -->
                      <td style="text-align: center; vertical-align: middle;">
                        <img src="${c.image || 'assets/images/aurawave-pro.svg'}" alt="${c.productName}" class="table-creative-thumb" />
                      </td>
                      
                      <!-- Brand & Product (Centered, Clean Proportion) -->
                      <td style="text-align: center; vertical-align: middle;">
                        <div class="campaign-title-wrap">
                          <h4 style="margin: 0 0 2px 0; font-size: 13px; font-weight: 500;" title="${c.brandName} — ${c.productName}">${c.brandName} — ${c.productName}</h4>
                          <span class="campaign-meta-desc" title="${c.headline}">“${c.headline || 'Untitled Campaign'}”</span>
                        </div>
                      </td>

                      <!-- Objective Centered (Rightly Fitted Pill) -->
                      <td style="text-align: center; vertical-align: middle;">
                        <span class="tag tag-ash" style="display: inline-flex; align-items: center; justify-content: center; margin: 0 auto; padding: 3px 8px; font-size: 11px; white-space: nowrap;">${c.objective || 'Conversions'}</span>
                      </td>

                      <!-- Risk Status Badge: 1 single row, centered, strictly fitted -->
                      <td style="text-align: center; vertical-align: middle;">
                        <span class="badge-risk-${c.riskLevel || 'high'}" style="white-space: nowrap !important; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto; padding: 4px 8px !important; font-size: 10px !important; letter-spacing: 0.02em !important;">
                          ${c.riskLabel || (c.riskLevel === 'scale' ? 'Ready to Scale' : c.riskLevel === 'moderate' ? 'Moderate Friction' : 'High Conversion Risk')}
                        </span>
                      </td>

                      <!-- Viability Score Centered -->
                      <td style="text-align: center; vertical-align: middle;">
                        <div style="display: inline-flex; align-items: center; justify-content: center; margin: 0 auto;">
                          ${renderScoreGauge(c.overallScore || 60, 100, 38, 3)}
                        </div>
                      </td>

                      <!-- Grounding Baseline (Single row, centered) -->
                      <td style="text-align: center; vertical-align: middle;">
                        <div style="display: inline-flex; align-items: center; justify-content: center; gap: 4px; margin: 0 auto; font-size: 12.5px; color: var(--color-steel); white-space: nowrap;">
                          <strong style="font-family: var(--font-mono); font-size: 12px;">${c.reviewCount || 48} Reviews</strong>
                          <span style="font-size: 11px; color: var(--color-slate);">(${c.groundingConfidence || 92}%)</span>
                        </div>
                      </td>

                      <!-- Action Button Centered -->
                      <td style="text-align: center; vertical-align: middle;">
                        <a href="/analysis/${c.id}" class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; justify-content: center; margin: 0 auto; padding: 5px 12px; font-size: 11.5px; white-space: nowrap;" data-link>
                          View Report →
                        </a>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div class="empty-state-box">
              <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <h3 style="font-size: 18px; margin-bottom: 6px;">No Analyses Match Current Filters</h3>
              <p style="font-size: 13px; color: var(--color-steel); max-width: 400px; margin: 0 auto 20px;">
                No campaign analyses found matching "${searchTerm}". Clear your search criteria or run a brand new simulation.
              </p>
              <button id="btn-reset-filters" class="btn btn-secondary btn-sm" style="margin-right: 8px;">Reset Filters</button>
              <a href="/analysis/new" class="btn btn-primary btn-sm" data-link>Run First Simulation</a>
            </div>
          `}

        </div>
      </main>

      <footer class="site-footer">
        <div class="container footer-content">
          <p class="text-caption">MindMarket © 2026 • Autonomous Ad Testing &amp; Consumer Intelligence</p>
          <div style="display: flex; gap: 16px; font-size: 13px;">
            <a href="/settings" class="link-ember" data-link>Brand &amp; Profile Settings</a>
            <span style="color: var(--color-mist);">•</span>
            <a href="/analysis/demo-1" class="link-ember" data-link>AuraWave Report</a>
          </div>
        </div>
      </footer>
    `;

    bindEvents();
  }

  function bindEvents() {
    bindHeaderEvents(router);

    const searchInput = container.querySelector('#search-campaigns');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        render();
        const inputAfterRender = container.querySelector('#search-campaigns');
        if (inputAfterRender) {
          inputAfterRender.focus();
          inputAfterRender.setSelectionRange(searchTerm.length, searchTerm.length);
        }
      });
    }

    const riskSelect = container.querySelector('#filter-risk');
    if (riskSelect) {
      riskSelect.addEventListener('change', (e) => {
        selectedRisk = e.target.value;
        render();
      });
    }

    const objSelect = container.querySelector('#filter-objective');
    if (objSelect) {
      objSelect.addEventListener('change', (e) => {
        selectedObjective = e.target.value;
        render();
      });
    }

    const resetBtn = container.querySelector('#btn-reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        searchTerm = '';
        selectedRisk = 'all';
        selectedObjective = 'all';
        render();
      });
    }
  }

  render();
}
