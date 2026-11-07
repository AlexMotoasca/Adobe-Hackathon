/**
 * PAGE 4: Workspace & Comprehensive Report (/analysis/[id])
 * State 1 (Pipeline Stepper) & State 2 (Executive Diagnosis, 5 Personas, Traceable Evidence).
 */

import { store } from '../store.js';
import { renderHeader, bindHeaderEvents } from '../components/nav.js';
import { renderScoreGauge } from '../components/score-dial.js';
import { renderRadarChart } from '../components/radar-chart.js';
import { renderStepper } from '../components/stepper.js';

export function renderReportPage(container, router, params) {
  const campaignId = params.id || 'demo-1';
  const campaign = store.getCampaignById(campaignId);

  const getSession = (key) => {
    try { return typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(key) : null; } catch (e) { return null; }
  };
  const setSession = (key, val) => {
    try { if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(key, val); } catch (e) {}
  };

  // View state
  let activeTab = 'diagnosis'; // 'diagnosis' | 'personas' | 'evidence'
  let isSimulating = getSession(`sim_done_${campaignId}`) !== 'true';
  let simulationStep = 2; // initial active step for pipeline stepper
  let simulationTimer = null;

  // Filter state for Tab 3 (Evidence Explorer)
  let evidenceSentimentFilter = 'all';
  let evidenceStatusFilter = 'all';

  function startSimulation() {
    isSimulating = true;
    simulationStep = 2;
    render();

    if (simulationTimer) clearInterval(simulationTimer);

    simulationTimer = setInterval(() => {
      simulationStep++;
      if (simulationStep >= campaign.pipelineStages.length) {
        clearInterval(simulationTimer);
        setTimeout(() => {
          isSimulating = false;
          setSession(`sim_done_${campaignId}`, 'true');
          render();
          window.showToast?.('Pre-flight simulation completed. Report synthesized.');
        }, 600);
      } else {
        render();
      }
    }, 900);
  }

  function skipSimulation() {
    if (simulationTimer) clearInterval(simulationTimer);
    isSimulating = false;
    setSession(`sim_done_${campaignId}`, 'true');
    render();
    window.showToast?.('Simulation bypassed. Viewing complete report.');
  }

  function getFilteredEvidence() {
    const items = campaign.evidenceItems || [];
    return items.filter(item => {
      const matchSentiment = evidenceSentimentFilter === 'all' || item.sentiment.toLowerCase() === evidenceSentimentFilter.toLowerCase();
      const matchStatus = evidenceStatusFilter === 'all' || item.validationStatus.toLowerCase() === evidenceStatusFilter.toLowerCase();
      return matchSentiment && matchStatus;
    });
  }

  function render() {
    container.innerHTML = `
      ${renderHeader(`/analysis/${campaignId}`)}

      <main class="main-content">
        
        <!-- Top Context Bar (Always visible) -->
        <section class="workspace-top-bar">
          <div class="container top-bar-inner">
            
            <div class="product-context-flex">
              <a href="/dashboard" class="link-ember" style="font-size: 13px;" data-link>← Back</a>
              <img src="${campaign.image || 'assets/images/aurawave-pro.svg'}" alt="${campaign.productName}" class="ad-thumb-small" />
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="tag tag-ash" style="font-size: 11px;">${campaign.category || 'Consumer Tech'}</span>
                  <span class="badge-risk-${campaign.riskLevel || 'high'}">${campaign.riskLabel || 'High Conversion Risk'}</span>
                </div>
                <h1 style="font-size: 22px; margin-top: 2px; margin-bottom: 2px;">
                  ${campaign.brandName} — ${campaign.productName}
                </h1>
                <div class="headline-tested-quote">Tested Creative: “${campaign.headline}”</div>
              </div>
            </div>

            <!-- Score and Grounding Confidence -->
            <div class="top-score-summary">
              <div style="text-align: right;">
                <div style="font-family: var(--font-polysans); font-size: 13px; color: var(--color-graphite);">Overall Viability</div>
                <div class="tag tag-brass" style="margin-top: 4px; font-size: 11px;">
                  ${campaign.groundingConfidence || 92}% Grounded in ${campaign.reviewCount || 48} Real Reviews
                </div>
              </div>
              <div style="display: flex; align-items: center;">
                ${renderScoreGauge(campaign.overallScore || 58, 100, 68, 4.5)}
              </div>
            </div>

          </div>
        </section>

        <div class="container section-gap" style="margin-top: var(--spacing-20);">

          <!-- STATE 1: Pipeline Execution Stepper (Visible during simulation) -->
          ${isSimulating ? `
            ${renderStepper(campaign.pipelineStages, simulationStep)}
          ` : `
            <!-- Simulation Replay / Status Ribbon -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-24); padding: 10px 16px; background-color: var(--surface-fog); border: 1px solid var(--color-mist); font-size: 12px;">
              <div style="display: flex; align-items: center; gap: 8px; color: var(--color-steel);">
                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--color-brass);"></span>
                <span>All 5 AI Agent Workflows Complete • Traceable Ground Truth Locked</span>
              </div>
              <button id="btn-replay-simulation" class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 4px 10px;">
                Replay AI Pipeline Simulation
              </button>
            </div>
          `}

          <!-- STATE 2: Tabbed Workspace Navigation -->
          <div class="workspace-tabs" role="tablist">
            <button id="tab-btn-diagnosis" class="tab-btn ${activeTab === 'diagnosis' ? 'active' : ''}" role="tab" aria-selected="${activeTab === 'diagnosis'}">
              1. Executive Diagnosis &amp; A/B Prescriptions
            </button>
            <button id="tab-btn-personas" class="tab-btn ${activeTab === 'personas' ? 'active' : ''}" role="tab" aria-selected="${activeTab === 'personas'}">
              2. Synthetic Focus Group (5 Personas) <span class="tab-badge">5</span>
            </button>
            <button id="tab-btn-evidence" class="tab-btn ${activeTab === 'evidence' ? 'active' : ''}" role="tab" aria-selected="${activeTab === 'evidence'}">
              3. Real Evidence Explorer (Traceable Data) <span class="tab-badge">${campaign.reviewCount || 48}</span>
            </button>
          </div>

          <!-- TAB CONTENT PANELS -->

          <!-- ============================================================
               TAB 1: Executive Diagnosis & A/B Prescriptions
               ============================================================ -->
          ${activeTab === 'diagnosis' ? `
            <div id="panel-diagnosis" role="tabpanel">
              
              <!-- Diagnosis Summary Card & Aggregate Metrics Split -->
              <div class="diagnosis-hero-grid">
                
                <!-- Diagnosis Summary Card (Ventriloc Asymmetric Radius Card) -->
                <div class="card-asymmetric">
                  <span class="tag tag-brass" style="margin-bottom: 8px;">Conversion Friction Diagnosis</span>
                  <h3 style="font-size: 20px; margin-top: 4px; margin-bottom: 12px;">Primary Conversion Bottlenecks</h3>
                  <p style="font-size: 14px; line-height: 1.6; margin-bottom: var(--spacing-16);">
                    ${campaign.executiveDiagnosis?.summary || 'The creative achieves strong visual attention through contrast, but suffers significant credibility loss due to unverified technical claims and missing return terms.'}
                  </p>

                  <h5 style="font-family: var(--font-polysans); font-size: 14px; font-weight: 400; color: var(--color-graphite); margin-bottom: 8px;">
                    Observed Friction Points:
                  </h5>
                  <ul class="friction-list">
                    ${(campaign.executiveDiagnosis?.primaryFrictions || []).map((f, i) => `
                      <li class="friction-item">
                        <span class="friction-item-num">0${i + 1}</span>
                        <span>${f}</span>
                      </li>
                    `).join('')}
                  </ul>
                </div>

                <!-- Aggregate Metrics View (Data Dashboard Card) -->
                <div class="card-data" style="display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px;">
                      <h3 style="font-size: 20px;">Aggregate Metric Balance</h3>
                      <span class="text-caption">0–10 Scale</span>
                    </div>
                    <p style="font-size: 13px; color: var(--color-slate); margin-bottom: 16px;">
                      Credibility deficits directly depress purchase intent, despite elevated initial attention.
                    </p>
                  </div>

                  <!-- Radar Chart Component -->
                  ${renderRadarChart(campaign.metrics || { attention: 8.2, clarity: 7.4, credibility: 4.1, purchaseIntent: 4.6 }, 250)}

                  <!-- Progress Bars -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--color-mist);">
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                        <span>Attention</span>
                        <strong style="color: var(--color-graphite);">${campaign.metrics?.attention || 8.2}/10</strong>
                      </div>
                      <div class="meter-bar-track"><div class="meter-bar-fill" style="width: ${(campaign.metrics?.attention || 8.2) * 10}%;"></div></div>
                    </div>
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                        <span>Clarity</span>
                        <strong style="color: var(--color-graphite);">${campaign.metrics?.clarity || 7.4}/10</strong>
                      </div>
                      <div class="meter-bar-track"><div class="meter-bar-fill" style="width: ${(campaign.metrics?.clarity || 7.4) * 10}%;"></div></div>
                    </div>
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                        <span>Credibility</span>
                        <strong style="color: var(--color-ember-orange);">${campaign.metrics?.credibility || 4.1}/10</strong>
                      </div>
                      <div class="meter-bar-track"><div class="meter-bar-fill accent" style="width: ${(campaign.metrics?.credibility || 4.1) * 10}%;"></div></div>
                    </div>
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                        <span>Purchase Intent</span>
                        <strong style="color: var(--color-ember-orange);">${campaign.metrics?.purchaseIntent || 4.6}/10</strong>
                      </div>
                      <div class="meter-bar-track"><div class="meter-bar-fill accent" style="width: ${(campaign.metrics?.purchaseIntent || 4.6) * 10}%;"></div></div>
                    </div>
                  </div>
                </div>

              </div>

              <!-- Prioritized Action Cards -->
              <div style="margin-top: var(--spacing-40);">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--spacing-20);">
                  <div>
                    <h3 style="font-size: 22px;">Prioritized A/B Prescriptions</h3>
                    <p style="font-size: 13px; color: var(--color-slate);">Directly addressing persona dealbreakers backed by review dataset citations</p>
                  </div>
                  <span class="tag tag-ash">3 Variations Available</span>
                </div>

                <div class="action-cards-grid">
                  ${(campaign.executiveDiagnosis?.actionCards || []).map(card => `
                    <div class="action-card">
                      <div class="action-card-header">
                        <span class="badge-priority-${card.priority.toLowerCase()}">PRIORITY: ${card.priority}</span>
                        <span class="text-mono" style="color: var(--color-slate); font-size: 11px;">Validated Against Real Reviews</span>
                      </div>

                      <div class="action-card-problem">
                        <strong>Problem Statement:</strong> ${card.problemStatement}
                      </div>

                      <div class="action-evidence-citation">
                        CITED EVIDENCE: “${card.evidenceCitation}”
                      </div>

                      <div class="action-copy-box">
                        <div class="action-copy-label">Recommended Copy Replacement</div>
                        <div class="action-copy-text" style="margin-bottom: 6px;">“${card.recommendedCopy.headline}”</div>
                        <p style="font-size: 13px; color: var(--color-steel); margin-bottom: 10px;">${card.recommendedCopy.body}</p>
                        <div style="display: inline-flex; align-items: center; gap: 8px;">
                          <span class="tag tag-graphite" style="font-size: 11px;">New CTA: ${card.recommendedCopy.cta}</span>
                        </div>
                      </div>

                      <div class="action-hypothesis-box">
                        <strong style="font-family: var(--font-polysans); font-weight: 400; color: var(--color-graphite); display: block; margin-bottom: 4px;">
                          A/B Test Hypothesis:
                        </strong>
                        <span style="font-size: 13px; color: var(--color-steel);">${card.hypothesis}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

            </div>
          ` : ''}

          <!-- ============================================================
               TAB 2: Synthetic Focus Group (5 Personas)
               ============================================================ -->
          ${activeTab === 'personas' ? `
            <div id="panel-personas" role="tabpanel">
              <div style="margin-bottom: var(--spacing-24);">
                <h3 style="font-size: 22px;">5 Autonomous Consumer Personas</h3>
                <p style="font-size: 13px; color: var(--color-slate);">
                  Parallel evaluation simulating diverse buying psychographics, objection thresholds, and dealbreakers.
                </p>
              </div>

              <div class="personas-grid">
                ${(campaign.personas || []).map(persona => `
                  <div class="persona-card">
                    <div>
                      <div class="persona-header">
                        <div class="persona-name-wrap">
                          <h4>${persona.name}</h4>
                          <span class="persona-behavior-summary">${persona.behaviorSummary}</span>
                        </div>
                        <span class="tag tag-ash" style="font-size: 11px;">${persona.roleBadge}</span>
                      </div>

                      <!-- Metric Scores (out of 10) -->
                      <div class="persona-score-meters">
                        <div class="meter-item">
                          <div class="meter-label-row">
                            <span>Attention</span>
                            <strong>${persona.scores.attention}/10</strong>
                          </div>
                          <div class="meter-bar-track">
                            <div class="meter-bar-fill" style="width: ${persona.scores.attention * 10}%;"></div>
                          </div>
                        </div>

                        <div class="meter-item">
                          <div class="meter-label-row">
                            <span>Clarity</span>
                            <strong>${persona.scores.clarity}/10</strong>
                          </div>
                          <div class="meter-bar-track">
                            <div class="meter-bar-fill" style="width: ${persona.scores.clarity * 10}%;"></div>
                          </div>
                        </div>

                        <div class="meter-item">
                          <div class="meter-label-row">
                            <span>Credibility</span>
                            <strong style="color: ${persona.scores.credibility < 5 ? 'var(--color-ember-orange)' : 'var(--color-graphite)'};">
                              ${persona.scores.credibility}/10
                            </strong>
                          </div>
                          <div class="meter-bar-track">
                            <div class="meter-bar-fill ${persona.scores.credibility < 5 ? 'accent' : ''}" style="width: ${persona.scores.credibility * 10}%;"></div>
                          </div>
                        </div>

                        <div class="meter-item">
                          <div class="meter-label-row">
                            <span>Purchase Intent</span>
                            <strong style="color: ${persona.scores.purchaseIntent < 5 ? 'var(--color-ember-orange)' : 'var(--color-graphite)'};">
                              ${persona.scores.purchaseIntent}/10
                            </strong>
                          </div>
                          <div class="meter-bar-track">
                            <div class="meter-bar-fill ${persona.scores.purchaseIntent < 5 ? 'accent' : ''}" style="width: ${persona.scores.purchaseIntent * 10}%;"></div>
                          </div>
                        </div>
                      </div>

                      <!-- Gut Reaction Quote -->
                      <div class="persona-gut-reaction">
                        “${persona.gutReaction}”
                      </div>

                      <!-- Unanswered Objections -->
                      <div style="margin-bottom: var(--spacing-16);">
                        <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--color-slate); margin-bottom: 6px;">
                          Unanswered Objections:
                        </div>
                        <ul class="persona-objections-list">
                          ${persona.unansweredObjections.map(obj => `
                            <li>${obj}</li>
                          `).join('')}
                        </ul>
                      </div>
                    </div>

                    <!-- Critical Dealbreaker Callout -->
                    <div class="dealbreaker-callout">
                      <strong style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 2px;">
                        Critical Dealbreaker:
                      </strong>
                      <span>${persona.dealbreaker}</span>
                    </div>

                  </div>
                `).join('')}
              </div>

            </div>
          ` : ''}

          <!-- ============================================================
               TAB 3: Real Evidence Explorer (Traceable Data)
               ============================================================ -->
          ${activeTab === 'evidence' ? `
            <div id="panel-evidence" role="tabpanel">
              
              <div style="margin-bottom: var(--spacing-24);">
                <h3 style="font-size: 22px;">Dataset Grounding &amp; Evidence Explorer</h3>
                <p style="font-size: 13px; color: var(--color-slate);">
                  Proving AI persona hypotheses against ${campaign.reviewCount || 48} verified customer complaints to eliminate synthetic hallucinations.
                </p>
              </div>

              <!-- Dataset Stats Cards -->
              <div class="evidence-stats-row">
                
                <div class="card-data">
                  <span class="text-caption">Customer Sentiment Ratio</span>
                  <div style="display: flex; gap: 8px; margin-top: 8px; margin-bottom: 4px;">
                    <span class="tag" style="background-color: var(--color-risk-high-bg); color: var(--color-risk-high); font-size: 11px;">
                      ${campaign.evidenceStats?.sentiment?.negative || 31}% Negative
                    </span>
                    <span class="tag tag-ash" style="font-size: 11px;">
                      ${campaign.evidenceStats?.sentiment?.neutral || 48}% Neutral
                    </span>
                    <span class="tag" style="background-color: var(--color-risk-scale-bg); color: var(--color-risk-scale); font-size: 11px;">
                      ${campaign.evidenceStats?.sentiment?.positive || 21}% Positive
                    </span>
                  </div>
                  <span style="font-size: 11px; color: var(--color-slate);">High complaint ratio on physical fit</span>
                </div>

                <div class="card-data">
                  <span class="text-caption">Top Recurring Complaint</span>
                  <div style="font-family: var(--font-polysans); font-size: 16px; margin-top: 6px; margin-bottom: 2px;">
                    Ear clamp pressure on temples
                  </div>
                  <span style="font-size: 12px; color: var(--color-ember-orange);">15 customer citations (31% of dataset)</span>
                </div>

                <div class="card-data">
                  <span class="text-caption">Secondary Complaint Cluster</span>
                  <div style="font-family: var(--font-polysans); font-size: 16px; margin-top: 6px; margin-bottom: 2px;">
                    ANC rumble on subway / low hum
                  </div>
                  <span style="font-size: 12px; color: var(--color-brass);">14 customer citations (29% of dataset)</span>
                </div>

              </div>

              <!-- Interactive Evidence Explorer Table -->
              <div class="evidence-table-container">
                
                <!-- Filter Controls -->
                <div class="evidence-filter-controls">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 12px; color: var(--color-slate); font-family: var(--font-mono); text-transform: uppercase;">Sentiment:</span>
                    <select id="select-evidence-sentiment" class="form-select" style="width: auto; padding: 6px 10px; font-size: 12px;">
                      <option value="all" ${evidenceSentimentFilter === 'all' ? 'selected' : ''}>All Sentiments</option>
                      <option value="negative" ${evidenceSentimentFilter === 'negative' ? 'selected' : ''}>Negative Only</option>
                      <option value="neutral" ${evidenceSentimentFilter === 'neutral' ? 'selected' : ''}>Neutral Only</option>
                      <option value="positive" ${evidenceSentimentFilter === 'positive' ? 'selected' : ''}>Positive Only</option>
                    </select>
                  </div>

                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 12px; color: var(--color-slate); font-family: var(--font-mono); text-transform: uppercase;">Validation Status:</span>
                    <select id="select-evidence-status" class="form-select" style="width: auto; padding: 6px 10px; font-size: 12px;">
                      <option value="all" ${evidenceStatusFilter === 'all' ? 'selected' : ''}>All Validation Types</option>
                      <option value="supported by real evidence" ${evidenceStatusFilter === 'supported by real evidence' ? 'selected' : ''}>Supported by Real Evidence</option>
                      <option value="partially supported" ${evidenceStatusFilter === 'partially supported' ? 'selected' : ''}>Partially Supported</option>
                      <option value="hypothesis" ${evidenceStatusFilter === 'hypothesis' ? 'selected' : ''}>Synthetic Hypothesis</option>
                    </select>
                  </div>

                  <div style="margin-left: auto; font-size: 12px; color: var(--color-slate); font-family: var(--font-mono);">
                    Showing ${getFilteredEvidence().length} of ${campaign.evidenceItems?.length || 8} entries
                  </div>
                </div>

                <!-- Evidence List Items -->
                <div class="evidence-list">
                  ${getFilteredEvidence().map(ev => `
                    <div class="evidence-card-item">
                      <div class="evidence-meta-row">
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <span class="tag tag-ash" style="font-size: 11px;">${ev.source}</span>
                          <span class="tag ${ev.sentiment === 'Negative' ? 'tag-ember' : ev.sentiment === 'Positive' ? 'tag-brass' : 'tag-ash'}" style="font-size: 11px;">
                            ${ev.sentiment} ${ev.rating ? `(${ev.rating}★)` : ''}
                          </span>
                        </div>
                        <span class="tag ${ev.validationStatus === 'Supported by real evidence' ? 'tag-graphite' : 'tag-ash'}" style="font-size: 11px;">
                          ${ev.validationStatus}
                        </span>
                      </div>

                      <div class="evidence-excerpt-quote">
                        “${ev.excerpt}”
                      </div>

                      <div class="evidence-tied-objection">
                        <span>Validates Objection For:</span>
                        <strong style="color: var(--color-graphite);">${ev.tiedPersona}</strong>
                        <span style="color: var(--color-mist);">•</span>
                        <span>Date: ${ev.date}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>

              </div>

            </div>
          ` : ''}

        </div>
      </main>

      <!-- Footer -->
      <footer class="site-footer">
        <div class="container footer-content">
          <p class="text-caption">MindMarket Deep Workspace • Adobe Hackathon 2026</p>
          <div style="display: flex; gap: 16px; font-size: 13px;">
            <a href="/dashboard" class="link-ember" data-link>Return to Dashboard</a>
          </div>
        </div>
      </footer>
    `;

    bindEvents();
  }

  function bindEvents() {
    bindHeaderEvents(router);

    // Skip Stepper button
    const skipBtn = container.querySelector('#btn-skip-stepper');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        skipSimulation();
      });
    }

    // Replay Simulation button
    const replayBtn = container.querySelector('#btn-replay-simulation');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        startSimulation();
      });
    }

    // Tab buttons: Tab switches preserve active page state smoothly!
    const tabDiagnosis = container.querySelector('#tab-btn-diagnosis');
    const tabPersonas = container.querySelector('#tab-btn-personas');
    const tabEvidence = container.querySelector('#tab-btn-evidence');

    if (tabDiagnosis) {
      tabDiagnosis.addEventListener('click', () => {
        activeTab = 'diagnosis';
        render();
      });
    }
    if (tabPersonas) {
      tabPersonas.addEventListener('click', () => {
        activeTab = 'personas';
        render();
      });
    }
    if (tabEvidence) {
      tabEvidence.addEventListener('click', () => {
        activeTab = 'evidence';
        render();
      });
    }

    // Evidence sentiment filter
    const sentimentSelect = container.querySelector('#select-evidence-sentiment');
    if (sentimentSelect) {
      sentimentSelect.addEventListener('change', (e) => {
        evidenceSentimentFilter = e.target.value;
        render();
      });
    }

    // Evidence status filter
    const statusSelect = container.querySelector('#select-evidence-status');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        evidenceStatusFilter = e.target.value;
        render();
      });
    }
  }

  // Trigger initial simulation if not already finished for this session
  if (isSimulating) {
    startSimulation();
  } else {
    render();
  }
}
