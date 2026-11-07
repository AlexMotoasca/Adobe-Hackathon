/**
 * Pipeline Execution Stepper Component
 * Visualizes the 5 sequential AI agent workflows with progress status.
 */

export function renderStepper(stages, activeIndex = 2) {
  const stepsHtml = stages.map((stage, idx) => {
    let statusClass = 'pending';
    let badgeText = '[Pending]';
    let badgeClass = 'badge-pending';

    if (idx < activeIndex) {
      statusClass = 'done';
      badgeText = '[Done]';
      badgeClass = 'badge-done';
    } else if (idx === activeIndex) {
      statusClass = 'active';
      badgeText = '[Active]';
      badgeClass = 'badge-active';
    }

    return `
      <div class="stepper-item ${statusClass}" data-step-id="${stage.id}">
        <span class="stepper-status-badge ${badgeClass}">${badgeText}</span>
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px;">
            <h5 style="font-family: var(--font-polysans); font-size: 14px; font-weight: 400; color: #202020;">${stage.title}</h5>
            <span style="font-family: var(--font-mono); font-size: 11px; color: #828282;">${stage.duration || 'pending'}</span>
          </div>
          <p style="font-size: 13px; color: #4d4d4d; margin: 0;">${stage.description}</p>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="stepper-container">
      <div class="stepper-header">
        <div>
          <span class="tag tag-brass" style="margin-bottom: 8px;">Autonomous Agent Pipeline</span>
          <h3 style="font-size: 22px; margin-top: 4px;">Multimodal Pre-Flight Verification</h3>
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="btn-skip-stepper" class="btn btn-secondary btn-sm">Skip to Full Report →</button>
        </div>
      </div>
      <div class="stepper-list">
        ${stepsHtml}
      </div>
    </div>
  `;
}
