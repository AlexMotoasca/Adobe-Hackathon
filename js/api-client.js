/**
 * MindMarket Backend API Client
 * Implements the exact specifications from backend/API.md
 * Base URL: http://localhost:3001/api
 */

const DEFAULT_API_BASE = 'http://localhost:3001/api';

export class ApiClient {
  constructor(baseUrl = DEFAULT_API_BASE) {
    this.baseUrl = baseUrl;
  }

  setBaseUrl(url) {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  async fetchJson(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const headers = {
      'Accept': 'application/json',
      ...(options.headers || {})
    };

    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.error?.message || `API error ${res.status}: ${res.statusText}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  /**
   * GET /health
   * Returns: { status: "ok", database: "connected", providerConfigured: boolean }
   */
  async checkHealth() {
    return this.fetchJson('/health');
  }

  /**
   * GET /analyses?limit=20&offset=0
   * Returns: { items: AnalysisSummary[], limit, offset }
   */
  async listAnalyses(limit = 20, offset = 0) {
    return this.fetchJson(`/analyses?limit=${limit}&offset=${offset}`);
  }

  /**
   * POST /analyses
   * Requires: brand, product, category, targetAudience, objective, market, language
   * Optional: productDescription, productUrl
   * Returns: 201 AnalysisSummary
   */
  async createAnalysis(campaign) {
    const payload = {
      brand: String(campaign.brand || campaign.brandName || '').trim(),
      product: String(campaign.product || campaign.productName || '').trim(),
      category: String(campaign.category || 'Consumer Electronics').trim(),
      targetAudience: String(campaign.targetAudience || 'General consumers').trim(),
      objective: String(campaign.objective || 'Conversions').trim(),
      market: String(campaign.market || 'Global / US').trim(),
      language: String(campaign.language || 'English').trim(),
      ...(campaign.productDescription || campaign.bodyText ? { productDescription: String(campaign.productDescription || campaign.bodyText).trim() } : {}),
      ...(campaign.productUrl || campaign.websiteUrl ? { productUrl: String(campaign.productUrl || campaign.websiteUrl).trim() } : {})
    };

    return this.fetchJson('/analyses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  /**
   * POST /analyses/{id}/image
   * Multipart field: 'file' (PNG, JPEG, WebP <= 4 MiB)
   */
  async uploadImage(analysisId, fileOrBlob, filename = 'ad-creative.jpg') {
    const form = new FormData();
    if (fileOrBlob instanceof File) {
      form.set('file', fileOrBlob);
    } else {
      form.set('file', fileOrBlob, filename);
    }

    const url = `${this.baseUrl}/analyses/${analysisId}/image`;
    const res = await fetch(url, {
      method: 'POST',
      body: form // browser sets multipart boundary
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.error?.message || `Image upload failed (${res.status})`);
    }
    return data;
  }

  /**
   * POST /analyses/{id}/reviews
   * Multipart field: 'file' (CSV or JSON array <= 1 MiB, <= 100 rows)
   */
  async uploadReviews(analysisId, fileOrBlob, filename = 'reviews.csv') {
    const form = new FormData();
    if (fileOrBlob instanceof File) {
      form.set('file', fileOrBlob);
    } else {
      form.set('file', fileOrBlob, filename);
    }

    const url = `${this.baseUrl}/analyses/${analysisId}/reviews`;
    const res = await fetch(url, {
      method: 'POST',
      body: form
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.error?.message || `Reviews upload failed (${res.status})`);
    }
    return data;
  }

  /**
   * POST /analyses/{id}/start
   * Queues the analysis job. Returns: 202 AnalysisSummary
   */
  async startAnalysis(analysisId) {
    return this.fetchJson(`/analyses/${analysisId}/start`, {
      method: 'POST'
    });
  }

  /**
   * GET /analyses/{id}
   * Returns: AnalysisSummary (status, stage, reviewStats, completedPersonas, etc.)
   */
  async getAnalysis(analysisId) {
    return this.fetchJson(`/analyses/${analysisId}`);
  }

  /**
   * GET /analyses/{id}/report
   * Returns: 200 AnalysisReport (when status === 'completed')
   */
  async getReport(analysisId) {
    return this.fetchJson(`/analyses/${analysisId}/report`);
  }

  /**
   * GET /analyses/{id}/reviews
   * Returns: { reviews: ConsumerReview[], stats: ReviewStats }
   */
  async getReviews(analysisId) {
    return this.fetchJson(`/analyses/${analysisId}/reviews`);
  }

  /**
   * Image URL helper
   */
  getImageUrl(analysisId) {
    return `${this.baseUrl}/analyses/${analysisId}/image`;
  }
}

export const apiClient = new ApiClient();
