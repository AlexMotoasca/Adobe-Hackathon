/**
 * MindMarket State Store & REST API Connector
 * Manages user session, brand profiles, campaigns history, and API sync.
 */

import { BENCHMARK_CAMPAIGN, INITIAL_CAMPAIGN_LIST } from './mock-data.js';

class Store {
  constructor() {
    this.STORAGE_KEYS = {
      AUTH_USER: 'mindmarket_auth_user',
      CAMPAIGNS: 'mindmarket_campaigns'
    };

    this.user = this.loadUser();
    this.campaigns = this.loadCampaigns();
    this.listeners = new Set();

    // Check backend API on init if running over HTTP
    this.syncWithBackend();
  }

  async syncWithBackend() {
    if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          const data = await res.json();
          if (data && data.user) {
            this.user = { ...this.user, ...data.user };
            this.notify();
          }
        }
      } catch (e) {
        // Fallback to local storage
      }
    }
  }

  loadUser() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.AUTH_USER);
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    // Default Evaluator User
    return {
      id: "judge-adobe-2026",
      name: "Adobe Hackathon Judge",
      email: "judge@adobe-hackathon.org",
      role: "Evaluator",
      brandName: "AuraSound",
      brandTagline: "Next-Gen Acoustic Hardware",
      brandCategory: "Consumer Electronics",
      brandLogo: "assets/images/aurawave-pro.svg",
      websiteUrl: "https://aurasound.audio",
      isEvaluator: true,
      authenticatedAt: new Date().toISOString()
    };
  }

  saveUser(user) {
    this.user = user;
    try {
      if (user) {
        localStorage.setItem(this.STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.STORAGE_KEYS.AUTH_USER);
      }
    } catch (e) {}
    this.notify();
  }

  // Update User & Brand Profile (Requirement 1: updates username, brand name, logo, etc.)
  async updateUserProfile(userData) {
    this.user = {
      ...this.user,
      ...userData,
      updatedAt: new Date().toISOString()
    };
    this.saveUser(this.user);

    // Sync with REST API if running over HTTP
    if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
      try {
        await fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.user)
        });
      } catch (e) {
        console.warn('API sync deferred to local storage:', e);
      }
    }

    return this.user;
  }

  quickDemoLogin() {
    const evaluatorUser = {
      id: "judge-adobe-2026",
      name: "Adobe Hackathon Judge",
      email: "judge@adobe-hackathon.org",
      role: "Evaluator",
      brandName: "AuraSound",
      brandTagline: "Next-Gen Acoustic Hardware",
      brandCategory: "Consumer Electronics",
      brandLogo: "assets/images/aurawave-pro.svg",
      websiteUrl: "https://aurasound.audio",
      isEvaluator: true,
      authenticatedAt: new Date().toISOString()
    };
    this.saveUser(evaluatorUser);
    return evaluatorUser;
  }

  signIn(email, password) {
    const user = {
      id: "user-" + Date.now(),
      name: email.split('@')[0],
      email: email,
      role: "Growth Marketer",
      brandName: "AuraSound",
      brandTagline: "Next-Gen Acoustic Hardware",
      brandCategory: "Consumer Electronics",
      brandLogo: "assets/images/aurawave-pro.svg",
      websiteUrl: "https://aurasound.audio",
      isEvaluator: false,
      authenticatedAt: new Date().toISOString()
    };
    this.saveUser(user);
    return user;
  }

  signOut() {
    this.saveUser(null);
  }

  isAuthenticated() {
    return !!this.user;
  }

  loadCampaigns() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.CAMPAIGNS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [...INITIAL_CAMPAIGN_LIST];
  }

  saveCampaigns() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.CAMPAIGNS, JSON.stringify(this.campaigns));
    } catch (e) {}
    this.notify();
  }

  getCampaignById(id) {
    if (id === 'demo-1' || !id) return BENCHMARK_CAMPAIGN;
    const found = this.campaigns.find(c => c.id === id);
    return found ? { ...BENCHMARK_CAMPAIGN, ...found } : BENCHMARK_CAMPAIGN;
  }

  async addCampaign(campaignData) {
    const newId = 'camp-' + Date.now().toString(36);
    const newCampaign = {
      ...BENCHMARK_CAMPAIGN,
      ...campaignData,
      id: newId,
      createdAt: new Date().toISOString()
    };
    this.campaigns.unshift(newCampaign);
    this.saveCampaigns();

    // Sync with backend REST API
    if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
      try {
        await fetch('/api/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCampaign)
        });
      } catch (e) {}
    }

    return newCampaign;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) listener(this);
  }
}

export const store = new Store();
