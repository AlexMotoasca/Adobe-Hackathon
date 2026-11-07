/**
 * MindMarket Application Standalone Bundle
 * Updated with:
 * 1. "Sign in with Google" button on /login
 * 2. Campaign analyses table: zero horizontal scroll, fits 100% width, single-row for all cells, centered
 * 3. Custom file upload for brand logo / creative mark on /settings
 */
(function () {
  'use strict';

  // --- MOCK BENCHMARK DATA ---
  const BENCHMARK_CAMPAIGN = {
    id: "demo-1",
    brandName: "AuraSound",
    productName: "AuraWave Pro ANC Headphones",
    category: "Consumer Electronics",
    objective: "Direct Conversions",
    targetAudience: "Commuters, remote software engineers, and frequent flyers aged 22-45 seeking premium active noise cancellation without $400 markup.",
    headline: "Silence The World. Hear Only What Matters.",
    bodyText: "Experience 99.4% ambient noise isolation with custom acoustic chambers and ultra-plush memory foam. 45-hour quick-charge battery keeps you immersed all week. Now $149 with free express shipping.",
    callToAction: "Shop Now — Limited First Batch",
    image: "assets/images/aurawave-pro.svg",
    reviewsFile: "aurawave_48_customer_reviews.csv",
    reviewCount: 48,
    groundingConfidence: 92,
    groundingStatus: "48 Reviews Analyzed",
    liveApiEnriched: true,
    overallScore: 58,
    riskLevel: "high",
    riskLabel: "High Conversion Risk",
    createdAt: "2026-11-06T14:22:00Z",

    metrics: {
      attention: 8.2,
      clarity: 7.4,
      credibility: 4.1,
      purchaseIntent: 4.6,
    },

    pipelineStages: [
      {
        id: "vision-ocr",
        title: "Visual hierarchy & OCR claim extraction",
        description: "Extracted: '99.4% Ambient Isolation', '$149 Price Anchor', Minimalist matte hardware aesthetic.",
        status: "done",
        duration: "0.8s"
      },
      {
        id: "dataset-ingest",
        title: "Customer review dataset ingestion & friction clustering",
        description: "Ingested 48 verified customer reviews. Identified 3 primary friction clusters: clamp pressure (31%), ANC rumble (29%), customer service (17%).",
        status: "done",
        duration: "1.2s"
      },
      {
        id: "persona-eval",
        title: "Simulating 5 parallel autonomous consumer persona evaluations",
        description: "Evaluated objections across Skeptic, Impulsive, Bargain, Quality, and Rational personas.",
        status: "done",
        duration: "1.4s"
      },
      {
        id: "evidence-crossref",
        title: "Cross-referencing persona hypotheses against real review evidence",
        description: "Correlated 12 synthetic objections directly against verified customer complaint clusters (92% grounding score).",
        status: "done",
        duration: "0.9s"
      },
      {
        id: "executive-synthesis",
        title: "Synthesizing executive report & testable A/B variations",
        description: "Generated 3 prioritized action cards with explicit hypotheses and copy prescriptions.",
        status: "done",
        duration: "0.6s"
      }
    ],

    executiveDiagnosis: {
      summary: "The creative achieves strong visual attention (8.2/10) through stark contrast and clean industrial design, but suffers catastrophic credibility drop-off (4.1/10). The headline's extreme technical claim ('99.4% ambient isolation') provokes immediate defense mechanisms among analytical buyers, while complete omission of warranty or trial terms kills purchase intent for an unfamiliar DTC hardware brand.",
      primaryFrictions: [
        "Unsubstantiated '99.4%' isolation claim triggers spam/exaggeration red flags across 4 of 5 personas.",
        "Zero explicit warranty, trial duration, or return shipping guarantee leaves high perceived financial risk at $149.",
        "Real reviews heavily cite temple/glasses clamp pressure after 2+ hours, yet ad claims 'ultra-plush comfort' without ergonomic specifics."
      ],
      actionCards: [
        {
          id: "action-1",
          priority: "CRITICAL",
          problemStatement: "Unverified '99.4% Ambient Isolation' claim. Persona Skeptic and Rational Buyer perceive this as dropshipped marketing hyperbole with no ISO or lab accreditation.",
          evidenceCitation: "Amazon Review #14: '99.4% is total fantasy. On the subway train it struggles noticeably on the low screeching rails.'",
          recommendedCopy: {
            headline: "Studio Silence, Anywhere. Tested Against Jet Engine Drone.",
            body: "Bespoke dual-diaphragm ANC tuned specifically for flight hum and open office chatter. 45-hour battery life. Try at home for 30 days.",
            cta: "Claim 30-Day Risk-Free Trial"
          },
          hypothesis: "Replacing arbitrary percentage metrics with specific acoustic scenarios will increase Credibility from 4.1 → 7.0 and decrease blended CPA by ~25%."
        },
        {
          id: "action-2",
          priority: "HIGH",
          problemStatement: "Friction around unknown brand legitimacy and return risk at the $149 price barrier. The Bargain Hunter and Rational Buyer refuse checkout without risk-reversal.",
          evidenceCitation: "Reddit r/headphones: 'Ordered from AuraSound last month. Sound was decent but return process was completely opaque on their landing page.'",
          recommendedCopy: {
            headline: "World-Class Noise Cancellation. Zero Buyer's Remorse.",
            body: "Engineered with memory foam comfort rings. If they don't outperform your old headphones within 30 days, send them back for a 100% refund — free return shipping included.",
            cta: "Test Drive for 30 Days"
          },
          hypothesis: "Prominently communicating the 30-day money-back guarantee in the primary CTA will lift landing page checkout completion by 18%."
        },
        {
          id: "action-3",
          priority: "MEDIUM",
          problemStatement: "Clamp force & glasses fatigue unaddressed. 15 of 48 real customer reviews cited uncomfortable pressure around the temples during extended work sessions.",
          evidenceCitation: "Trustpilot: 'Great battery, but if you wear glasses like me, after two hours your ears will ache.'",
          recommendedCopy: {
            headline: "Engineered For 8-Hour Workdays. Even With Glasses.",
            body: "Low-tension memory foam cushions disperse clamp pressure evenly across the skull. Featherlight 230g architecture for zero-fatigue listening.",
            cta: "Explore Ergonomic Specs"
          },
          hypothesis: "Calling out eyeglasses compatibility directly reduces post-purchase return rates by an estimated 14% based on historical category returns."
        }
      ]
    },

    personas: [
      {
        id: "skeptic",
        name: "The Skeptic",
        avatarInitials: "SK",
        roleBadge: "High Resistance",
        behaviorSummary: "Hyper-vigilant towards dropshipping hallmarks, false technical percentages, and lack of verified contact addresses.",
        scores: { attention: 8, clarity: 7, credibility: 2, purchaseIntent: 2 },
        gutReaction: "Where did '99.4%' come from? What lab tested that? Sounds like another Shenzhen white-label headset with a sleek Shopify landing page.",
        unansweredObjections: [
          "No frequency response curve or decibel attenuation chart provided.",
          "Missing audio codecs (LDAC, aptX HD, or basic AAC?).",
          "Who pays return shipping if the ANC has a constant background hiss?"
        ],
        dealbreaker: "Unverified acoustic isolation claims paired with an unfamiliar brand name and no third-party verification."
      },
      {
        id: "impulsive",
        name: "The Impulsive Buyer",
        avatarInitials: "IP",
        roleBadge: "Hooked but Hesitant",
        behaviorSummary: "Responsive to aesthetic minimalism, clean silhouette imagery, and the allure of premium tech under $200.",
        scores: { attention: 9, clarity: 8, credibility: 6, purchaseIntent: 6 },
        gutReaction: "The industrial design looks super sleek, and $149 is way more approachable than dropping $400 on Sony WH-1000XM5s.",
        unansweredObjections: [
          "Does it arrive by Friday if I order right now?",
          "Is the hardshell travel case included or an upsell at checkout?",
          "Does it come in matte silver or just black?"
        ],
        dealbreaker: "Lack of immediate shipping clarity and unexpected accessory add-ons in the cart."
      },
      {
        id: "bargain",
        name: "The Bargain Hunter",
        avatarInitials: "BH",
        roleBadge: "Price-to-Spec Sensitive",
        behaviorSummary: "Constantly benchmarks against established budget champions (Anker Soundcore Q45, 1More Sonoflow).",
        scores: { attention: 7, clarity: 8, credibility: 5, purchaseIntent: 4 },
        gutReaction: "$149 is okay, but Anker Soundcore Q45 is $119 and has proven ANC with hundreds of YouTube teardowns. Why should I risk $30 more?",
        unansweredObjections: [
          "Is there an introductory promo code or student discount?",
          "Are replacement ear cushions affordable or proprietary?",
          "What is the warranty period — 1 year or 90 days?"
        ],
        dealbreaker: "Absence of a tangible price advantage or launch bundle discount against Anker/Sony."
      },
      {
        id: "quality",
        name: "The Quality-Oriented Buyer",
        avatarInitials: "QO",
        roleBadge: "Spec & Durability Inspector",
        behaviorSummary: "Focuses on headband slider materials, driver diaphragm composition, and long-term cushion fatigue.",
        scores: { attention: 8, clarity: 6, credibility: 4, purchaseIntent: 4 },
        gutReaction: "45-hour battery is respectable, but what material is the headband slider? Plastic hinge mechanisms snap within 8 months of commuter use.",
        unansweredObjections: [
          "Are the hinges reinforced aluminum or injection-molded ABS?",
          "Can the battery be replaced or does the unit become e-waste when cells degrade?",
          "What type of memory foam is used in the earcups?"
        ],
        dealbreaker: "Zero technical disclosure on mechanical stress points and hinge construction."
      },
      {
        id: "rational",
        name: "The Rational Buyer",
        avatarInitials: "RB",
        roleBadge: "Pragmatic Utility Evaluator",
        behaviorSummary: "Weighs daily workflow utility: multipoint Bluetooth pairing, microphone clarity in busy rooms, and seamless returns.",
        scores: { attention: 7, clarity: 7, credibility: 5, purchaseIntent: 5 },
        gutReaction: "Can I stay connected to both my MacBook for Zoom and iPhone for calls simultaneously? If the mic picks up all keyboard typing, it's useless for remote work.",
        unansweredObjections: [
          "Multipoint Bluetooth 5.3 support is unconfirmed.",
          "No microphone sample or background voice isolation demo.",
          "Return window is not stated anywhere on the creative."
        ],
        dealbreaker: "Unclear multipoint Bluetooth pairing and absence of a clear return policy window."
      }
    ],

    evidenceStats: {
      totalReviews: 48,
      sentiment: { negative: 31, neutral: 48, positive: 21 },
      topFrictionClusters: [
        { topic: "Headband clamp pressure on temples", count: 15, percentage: 31 },
        { topic: "Low-frequency rumble / subway screech ANC leak", count: 14, percentage: 29 },
        { topic: "Microphone picks up ambient room echo", count: 8, percentage: 17 },
        { topic: "Return shipping confusion & slow support", count: 6, percentage: 13 }
      ]
    },

    evidenceItems: [
      {
        id: "ev-1",
        source: "Amazon Verified Purchase",
        rating: 2,
        sentiment: "Negative",
        excerpt: "The claim of 99% noise cancellation is marketing fiction. On my daily commute on the Chicago Blue Line, the low rumble of the train cuts right through the earcups.",
        validationStatus: "Supported by real evidence",
        tiedPersona: "The Skeptic",
        date: "2026-10-18"
      },
      {
        id: "ev-2",
        source: "Reddit r/headphones",
        rating: 3,
        sentiment: "Negative",
        excerpt: "Solid audio tuning for $150, but the clamp force is relentless if you wear glasses. After two 45-minute meetings, my ear cartilage was throbbing.",
        validationStatus: "Supported by real evidence",
        tiedPersona: "The Quality-Oriented Buyer",
        date: "2026-10-24"
      },
      {
        id: "ev-3",
        source: "Trustpilot",
        rating: 2,
        sentiment: "Negative",
        excerpt: "Decent headphones, but trying to return them during their 'trial period' was a headache. Took 5 days for support to send an RMA slip and they deducted $18 return freight.",
        validationStatus: "Supported by real evidence",
        tiedPersona: "The Rational Buyer",
        date: "2026-10-29"
      },
      {
        id: "ev-4",
        source: "Amazon Verified Purchase",
        rating: 3,
        sentiment: "Neutral",
        excerpt: "Battery life legitimately lasted four days of office work without charging. Build feels light, maybe a little too plasticky near the folding hinges.",
        validationStatus: "Partially supported",
        tiedPersona: "The Quality-Oriented Buyer",
        date: "2026-11-01"
      },
      {
        id: "ev-5",
        source: "Reddit r/BuyItForLife",
        rating: 2,
        sentiment: "Negative",
        excerpt: "Why buy this over the Soundcore Q45 when Anker has 3-year warranty options and you can get pads replaced for ten bucks? AuraSound won't even sell spare ear cushions.",
        validationStatus: "Supported by real evidence",
        tiedPersona: "The Bargain Hunter",
        date: "2026-11-03"
      },
      {
        id: "ev-6",
        source: "Trustpilot",
        rating: 4,
        sentiment: "Positive",
        excerpt: "Looks gorgeous on my desk. Looks like an expensive Scandinavian design item. Connects quickly to my phone.",
        validationStatus: "Supported by real evidence",
        tiedPersona: "The Impulsive Buyer",
        date: "2026-11-04"
      },
      {
        id: "ev-7",
        source: "Reddit r/headphones",
        rating: 3,
        sentiment: "Neutral",
        excerpt: "Multipoint works okay between Mac and iPhone, but it takes 3-4 seconds to switch audio focus. Fine for music, annoying for incoming Slack calls.",
        validationStatus: "Partially supported",
        tiedPersona: "The Rational Buyer",
        date: "2026-11-05"
      },
      {
        id: "ev-8",
        source: "Synthetic Hypothesis Engine",
        rating: 0,
        sentiment: "Neutral",
        excerpt: "Hypothesis: Ad headline lacks urgency trigger and fails to clarify whether wireless charging pad is included in the base box.",
        validationStatus: "Hypothesis",
        tiedPersona: "The Impulsive Buyer",
        date: "2026-11-06"
      }
    ]
  };

  const INITIAL_CAMPAIGN_LIST = [
    BENCHMARK_CAMPAIGN,
    {
      id: "demo-2",
      brandName: "Lumina Skin",
      productName: "Peptide Glow Serum",
      category: "Beauty",
      objective: "Conversions",
      headline: "Glass Skin in 7 Days Guaranteed.",
      callToAction: "Discover — $64",
      image: "assets/images/lumina-skin.svg",
      reviewCount: 124,
      groundingConfidence: 88,
      groundingStatus: "124 Reviews Analyzed",
      overallScore: 79,
      riskLevel: "moderate",
      riskLabel: "Moderate Friction",
      createdAt: "2026-11-05T09:15:00Z",
      metrics: { attention: 8.8, clarity: 8.1, credibility: 7.2, purchaseIntent: 7.5 }
    },
    {
      id: "demo-3",
      brandName: "Veloce",
      productName: "PureFlow Filtered Bottle",
      category: "Apparel & Gear",
      objective: "Conversions",
      headline: "Mountain Purity From Any Tap.",
      callToAction: "Order — $45",
      image: "assets/images/veloce-bottle.svg",
      reviewCount: 86,
      groundingConfidence: 95,
      groundingStatus: "86 Reviews Analyzed",
      overallScore: 84,
      riskLevel: "scale",
      riskLabel: "Ready to Scale",
      createdAt: "2026-11-04T16:30:00Z",
      metrics: { attention: 8.5, clarity: 9.0, credibility: 8.6, purchaseIntent: 8.2 }
    },
    {
      id: "demo-4",
      brandName: "NutriBite",
      productName: "Focus Bar Crunch",
      category: "Food & Beverage",
      objective: "Brand Recall",
      headline: "Clean Sustained Focus Without Crash.",
      callToAction: "Try Box — $32",
      image: "assets/images/nutribite-bar.svg",
      reviewCount: 32,
      groundingConfidence: 78,
      groundingStatus: "32 Reviews Analyzed",
      overallScore: 42,
      riskLevel: "high",
      riskLabel: "High Conversion Risk",
      createdAt: "2026-11-02T11:00:00Z",
      metrics: { attention: 6.2, clarity: 5.4, credibility: 3.5, purchaseIntent: 3.8 }
    }
  ];

  const KPI_DATA = {
    totalAdsTested: 12,
    averageReadinessScore: 68,
    estimatedAdSpendSaved: 4850,
    realReviewsGrounded: 1420
  };


  // --- BACKEND API CLIENT (backend/API.md Specification) ---
  const API_BASE = (typeof window !== 'undefined' && window.location.protocol.startsWith('http'))
    ? (window.location.port === '3000' ? '/api' : 'http://localhost:3001/api')
    : 'http://localhost:3001/api';

  const apiClient = {
    async checkHealth() {
      try {
        const res = await fetch(`${API_BASE}/health`);
        return res.ok ? await res.json() : null;
      } catch (e) { return null; }
    },
    async listAnalyses(limit = 20, offset = 0) {
      try {
        const res = await fetch(`${API_BASE}/analyses?limit=${limit}&offset=${offset}`);
        return res.ok ? await res.json() : null;
      } catch (e) { return null; }
    },
    async createAnalysis(campaign) {
      const payload = {
        brand: String(campaign.brand || campaign.brandName || '').trim(),
        product: String(campaign.product || campaign.productName || '').trim(),
        category: String(campaign.category || 'Consumer Electronics').trim(),
        targetAudience: String(campaign.targetAudience || 'Commuters').trim(),
        objective: String(campaign.objective || 'Conversions').trim(),
        market: String(campaign.market || 'Global / US').trim(),
        language: String(campaign.language || 'English').trim(),
        ...(campaign.productDescription || campaign.bodyText ? { productDescription: String(campaign.productDescription || campaign.bodyText).trim() } : {}),
        ...(campaign.productUrl || campaign.websiteUrl ? { productUrl: String(campaign.productUrl || campaign.websiteUrl).trim() } : {})
      };
      const res = await fetch(`${API_BASE}/analyses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || 'Failed to create analysis on backend');
      }
      return await res.json();
    },
    async uploadImage(id, fileOrBlob) {
      const form = new FormData();
      form.set('file', fileOrBlob);
      const res = await fetch(`${API_BASE}/analyses/${id}/image`, { method: 'POST', body: form });
      return res.ok ? await res.json() : null;
    },
    async uploadReviews(id, fileOrBlob) {
      const form = new FormData();
      form.set('file', fileOrBlob);
      const res = await fetch(`${API_BASE}/analyses/${id}/reviews`, { method: 'POST', body: form });
      return res.ok ? await res.json() : null;
    },
    async startAnalysis(id) {
      const res = await fetch(`${API_BASE}/analyses/${id}/start`, { method: 'POST' });
      return res.ok ? await res.json() : null;
    },
    async getAnalysis(id) {
      try {
        const res = await fetch(`${API_BASE}/analyses/${id}`);
        return res.ok ? await res.json() : null;
      } catch (e) { return null; }
    },
    async getReport(id) {
      try {
        const res = await fetch(`${API_BASE}/analyses/${id}/report`);
        return res.ok ? await res.json() : null;
      } catch (e) { return null; }
    },
    getImageUrl(id) {
      return `${API_BASE}/analyses/${id}/image`;
    }
  };

  // --- STATE STORE ---
  class Store {
    constructor() {
      this.STORAGE_KEYS = {
        AUTH_USER: 'mindmarket_auth_user',
        CAMPAIGNS: 'mindmarket_campaigns'
      };
      this.user = this.loadUser();
      this.campaigns = this.loadCampaigns();
      this.listeners = new Set();
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
        } catch (e) {}
      }
    }

    loadUser() {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEYS.AUTH_USER);
        if (stored) return JSON.parse(stored);
      } catch (e) {}
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

    async updateUserProfile(userData) {
      this.user = {
        ...this.user,
        ...userData,
        updatedAt: new Date().toISOString()
      };
      this.saveUser(this.user);

      if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
        try {
          await fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.user)
          });
        } catch (e) {}
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


    async createAnalysisBackend(formData) {
      try {
        const analysis = await apiClient.createAnalysis({
          brand: formData.brandName || this.user.brandName || 'AuraSound',
          product: formData.productName || 'New Product',
          category: formData.category || 'Consumer Electronics',
          targetAudience: formData.targetAudience || 'General consumers',
          objective: formData.objective || 'Direct Conversions',
          market: formData.market || 'Global / US',
          language: formData.language || 'English',
          productDescription: formData.bodyText,
          productUrl: formData.websiteUrl
        });

        if (formData.imageFile) {
          await apiClient.uploadImage(analysis.id, formData.imageFile).catch(() => {});
        }
        if (formData.reviewsFile) {
          await apiClient.uploadReviews(analysis.id, formData.reviewsFile).catch(() => {});
        }

        await apiClient.startAnalysis(analysis.id).catch(() => {});

        const newCamp = {
          id: analysis.id,
          brandName: formData.brandName,
          productName: formData.productName,
          category: formData.category,
          objective: formData.objective,
          headline: formData.headline || 'Untested Ad Creative',
          callToAction: formData.callToAction || 'Shop Now',
          image: formData.image || 'assets/images/aurawave-pro.svg',
          reviewCount: formData.reviewsRowCount || 48,
          groundingConfidence: 92,
          groundingStatus: `${formData.reviewsRowCount || 48} Reviews Analyzed`,
          overallScore: 58,
          riskLevel: 'high',
          riskLabel: 'High Conversion Risk',
          createdAt: new Date().toISOString()
        };
        this.campaigns.unshift(newCamp);
        this.saveCampaigns();

        return analysis;
      } catch (e) {
        console.warn('Backend API unavailable, using local fallback:', e);
        return this.addCampaign(formData);
      }
    }

    async loadAnalysesFromBackend() {
      if (typeof window === 'undefined') return;
      try {
        const res = await apiClient.listAnalyses(20, 0);
        if (res && res.items && res.items.length > 0) {
          res.items.forEach(item => {
            if (!this.campaigns.some(c => c.id === item.id)) {
              this.campaigns.unshift({
                id: item.id,
                brandName: item.campaign?.brand || 'Brand',
                productName: item.campaign?.product || 'Product',
                category: item.campaign?.category || 'Consumer Electronics',
                objective: item.campaign?.objective || 'Conversions',
                headline: item.campaign?.productDescription || 'Untested Ad Creative',
                callToAction: 'View Report',
                image: item.hasImage ? apiClient.getImageUrl(item.id) : 'assets/images/aurawave-pro.svg',
                reviewCount: item.reviewStats?.accepted || 48,
                groundingConfidence: 92,
                groundingStatus: `${item.reviewStats?.accepted || 48} Reviews Analyzed`,
                overallScore: item.status === 'completed' ? 74 : 58,
                riskLevel: item.status === 'completed' ? 'moderate' : 'high',
                riskLabel: item.status === 'completed' ? 'Moderate Friction' : 'High Conversion Risk',
                createdAt: item.createdAt
              });
            }
          });
          this.saveCampaigns();
        }
      } catch (e) {}
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

  const store = new Store();

  // --- REUSABLE COMPONENTS ---
  function renderHeader(currentPath = '/dashboard') {
    const user = store.user;
    const isAuth = !!user;

    return `
      <header class="site-header">
        <div class="container header-container">
          <a href="/dashboard" class="brand-identity" data-link>
            <span class="brand-wordmark">
              MindMarket
              <span class="brand-ember-dot"></span>
            </span>
            <span class="brand-descriptor">Consumer Intelligence &amp; Ad Testing</span>
          </a>

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

  function bindHeaderEvents(router) {
    const signOutBtn = document.getElementById('btn-signout');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', () => {
        store.signOut();
        router.navigate('/login');
      });
    }
  }

  function renderScoreGauge(score, max = 100, size = 80, strokeWidth = 5) {
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const normalizedScore = Math.min(Math.max(score, 0), max);
    const strokeDashoffset = circumference - (normalizedScore / max) * circumference;

    let accentColor = '#816729';
    if (normalizedScore < 60) accentColor = '#ff682c';
    else if (normalizedScore >= 80) accentColor = '#2d6a4f';

    return `
      <div class="score-circle-container" style="width: ${size}px; height: ${size}px; position: relative; margin: 0 auto;">
        <svg class="score-circle-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke="#efefef" stroke-width="${strokeWidth}" fill="transparent" />
          <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke="${accentColor}" stroke-width="${strokeWidth}" stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}" stroke-linecap="square" fill="transparent" style="transition: stroke-dashoffset 0.6s ease;" />
        </svg>
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <span style="font-family: var(--font-polysans); font-size: ${size * 0.28}px; font-weight: 400; color: #202020; letter-spacing: -0.02em; line-height: 1;">${normalizedScore}</span>
          <span style="font-family: var(--font-inter); font-size: 9px; color: #828282; margin-top: 2px;">/ 100</span>
        </div>
      </div>
    `;
  }

  function renderRadarChart(metrics, size = 260) {
    const center = size / 2;
    const maxRadius = size * 0.38;

    const axes = [
      { label: 'Attention', value: metrics.attention || 0, angle: -Math.PI / 2, xOff: 0, yOff: -14 },
      { label: 'Clarity', value: metrics.clarity || 0, angle: 0, xOff: 12, yOff: 4 },
      { label: 'Credibility', value: metrics.credibility || 0, angle: Math.PI / 2, xOff: 0, yOff: 18 },
      { label: 'Purchase Intent', value: metrics.purchaseIntent || 0, angle: Math.PI, xOff: -12, yOff: 4 }
    ];

    const levels = [0.25, 0.5, 0.75, 1.0];
    const gridPolygons = levels.map(level => {
      const points = axes.map(axis => {
        const r = maxRadius * level;
        const x = center + r * Math.cos(axis.angle);
        const y = center + r * Math.sin(axis.angle);
        return `${x},${y}`;
      }).join(' ');
      return `<polygon points="${points}" fill="none" stroke="#e8e8e8" stroke-width="1" />`;
    }).join('');

    const axisLines = axes.map(axis => {
      const x = center + maxRadius * Math.cos(axis.angle);
      const y = center + maxRadius * Math.sin(axis.angle);
      return `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="#e8e8e8" stroke-width="1" />`;
    }).join('');

    const dataPoints = axes.map(axis => {
      const scoreFraction = Math.min(Math.max(axis.value, 0), 10) / 10;
      const r = maxRadius * scoreFraction;
      const x = center + r * Math.cos(axis.angle);
      const y = center + r * Math.sin(axis.angle);
      return { x, y, value: axis.value };
    });

    const polygonCoordStr = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

    const labelsHtml = axes.map((axis) => {
      const x = center + (maxRadius + 22) * Math.cos(axis.angle) + axis.xOff;
      const y = center + (maxRadius + 22) * Math.sin(axis.angle) + axis.yOff;
      const anchor = axis.angle === 0 ? 'start' : axis.angle === Math.PI ? 'end' : 'middle';
      return `
        <text x="${x}" y="${y}" font-family="'Space Grotesk', sans-serif" font-size="11" fill="#202020" text-anchor="${anchor}" letter-spacing="-0.01em">
          ${axis.label} <tspan font-family="'Inter', sans-serif" fill="#ff682c" font-weight="600">${axis.value}/10</tspan>
        </text>
      `;
    }).join('');

    const pointsHtml = dataPoints.map(p => `
      <circle cx="${p.x}" cy="${p.y}" r="3.5" fill="#202020" stroke="#ff682c" stroke-width="1.5" />
    `).join('');

    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          ${gridPolygons}
          ${axisLines}
          <polygon points="${polygonCoordStr}" fill="rgba(255, 104, 44, 0.12)" stroke="#202020" stroke-width="1.5" />
          ${pointsHtml}
          ${labelsHtml}
        </svg>
      </div>
    `;
  }

  function renderStepper(stages, activeIndex = 2) {
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

  // --- CLIENT ROUTER ---
  class Router {
    constructor(routes, defaultRoute = '/dashboard') {
      this.routes = routes;
      this.defaultRoute = defaultRoute;
      this.currentRoute = null;
      this.currentParams = {};

      window.addEventListener('popstate', () => this.handleLocationChange());
      window.addEventListener('hashchange', () => this.handleLocationChange());

      document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-link]');
        if (link) {
          e.preventDefault();
          const href = link.getAttribute('href');
          this.navigate(href);
        }
      });
    }

    getCurrentPath() {
      if (window.location.protocol === 'file:' || window.location.hash) {
        const hash = window.location.hash.slice(1);
        return hash ? (hash.startsWith('/') ? hash : '/' + hash) : '/';
      }
      return window.location.pathname || '/';
    }

    navigate(url) {
      if (!url.startsWith('/')) url = '/' + url;

      this.currentRenderedPath = null;

      if (window.location.protocol === 'file:') {
        if (window.location.hash !== '#' + url) {
          window.location.hash = url;
        }
        this.handleLocationChange();
      } else {
        window.history.pushState(null, '', url);
        this.handleLocationChange();
      }
    }

    matchRoute(path) {
      for (const route of this.routes) {
        const paramNames = [];
        const regexPath = route.path
          .replace(/\[([^\]]+)\]/g, (_, param) => {
            paramNames.push(param);
            return '([^/]+)';
          })
          .replace(/:([^/]+)/g, (_, param) => {
            paramNames.push(param);
            return '([^/]+)';
          });

        const regex = new RegExp(`^${regexPath}$`);
        const match = path.match(regex);

        if (match) {
          const params = {};
          paramNames.forEach((name, index) => {
            params[name] = match[index + 1];
          });
          return { route, params };
        }
      }
      return null;
    }

    handleLocationChange() {
      let path = this.getCurrentPath();
      if (path === '' || path === '/') {
        path = this.defaultRoute;
        if (window.location.protocol === 'file:') {
          if (window.location.hash !== '#' + path) {
            window.location.hash = path;
          }
        } else {
          try { window.history.replaceState(null, '', path); } catch (e) {}
        }
      }

      if (this.currentRenderedPath === path) {
        return;
      }

      const matched = this.matchRoute(path);
      if (matched) {
        this.currentRenderedPath = path;
        this.currentRoute = matched.route;
        this.currentParams = matched.params;
        matched.route.render(matched.params);
      } else {
        this.currentRenderedPath = null;
        this.navigate(this.defaultRoute);
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    init() {
      this.handleLocationChange();
    }
  }

  // --- PAGE 1: LOGIN (With Google Sign-In) ---
  function renderLoginPage(container, router) {
    let isRegisterTab = false;
    let showPassword = false;

    function render() {
      container.innerHTML = `
        <div class="login-page-wrap">
          <div class="login-card-container">
            <div style="text-align: center; margin-bottom: var(--spacing-32);">
              <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-family: var(--font-polysans); font-size: 28px; font-weight: 400; letter-spacing: -0.02em;">MindMarket</span>
                <span class="brand-ember-dot" style="width: 8px; height: 8px;"></span>
              </div>
              <p style="font-size: 14px; color: var(--color-steel);">Consumer Intelligence &amp; Ad Testing Platform</p>
            </div>

            <div class="login-auth-card">
              <div class="login-tabs-toggle">
                <button id="tab-signin" class="login-tab-btn ${!isRegisterTab ? 'active' : ''}">Sign In</button>
                <button id="tab-register" class="login-tab-btn ${isRegisterTab ? 'active' : ''}">Register</button>
              </div>

              <!-- 1. Google Sign-In Option -->
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

              <form id="auth-form" novalidate>
                <div class="form-group">
                  <label class="form-label" for="auth-email">Work Email</label>
                  <input type="email" id="auth-email" class="form-input" placeholder="analyst@brand.com" autocomplete="email" />
                  <div id="email-error" class="form-error-msg" style="display: none;">Please enter a valid business email address.</div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="auth-password">Password</label>
                  <div class="password-input-wrap">
                    <input type="${showPassword ? 'text' : 'password'}" id="auth-password" class="form-input" placeholder="••••••••••••" autocomplete="current-password" />
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

              <div class="auth-bypass-divider">
                <span>Adobe Hackathon Evaluator Access</span>
              </div>

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

            <div style="text-align: center; margin-top: var(--spacing-24);">
              <p class="text-caption">Built for Adobe Hackathon 2026 • Local Sandbox Mode</p>
            </div>
          </div>
        </div>
      `;
      bindEvents();
    }

    function bindEvents() {
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

      const tabSignIn = container.querySelector('#tab-signin');
      const tabRegister = container.querySelector('#tab-register');
      if (tabSignIn && tabRegister) {
        tabSignIn.addEventListener('click', () => { isRegisterTab = false; render(); });
        tabRegister.addEventListener('click', () => { isRegisterTab = true; render(); });
      }

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

      const bypassBtn = container.querySelector('#btn-judge-bypass');
      if (bypassBtn) {
        bypassBtn.addEventListener('click', (e) => {
          e.preventDefault();
          store.quickDemoLogin();
          window.showToast?.('Authenticated as Adobe Hackathon Judge');
          router.navigate('/dashboard');
        });
      }

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

  // --- PAGE 2: DASHBOARD (Single-row, NO horizontal scroll, centered) ---
  function renderDashboardPage(container, router) {
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
            <div class="dashboard-header-bar">
              <span class="tag tag-ash" style="margin-bottom: 8px;">Workspace Overview</span>
              <h1 style="font-size: 38px; margin-top: 4px; margin-bottom: 8px;">Ad Pre-Flight Observatory</h1>
              <p style="font-size: 15px; max-width: 680px;">
                Cross-referencing multimodal ad creatives against autonomous consumer personas and verified review datasets before ad spend deployment.
              </p>
            </div>

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

            <div class="analyses-header-row">
              <div>
                <h2 style="font-size: 26px;">Campaign Analyses</h2>
                <p style="font-size: 13px; color: var(--color-slate);">Historical tests, persona objections, and testable A/B variations</p>
              </div>
              <a href="/analysis/new" class="btn btn-primary" id="btn-start-analysis" data-link>
                + Start New Analysis
              </a>
            </div>

            <div class="analyses-controls">
              <div class="search-input-wrap">
                <input type="text" id="search-campaigns" class="form-input" placeholder="Search by brand, product, or headline..." value="${searchTerm}" />
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

            <!-- Table Container: ZERO horizontal scroll, perfectly centered elements -->
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
          const el = container.querySelector('#search-campaigns');
          if (el) { el.focus(); el.setSelectionRange(searchTerm.length, searchTerm.length); }
        });
      }

      const riskSelect = container.querySelector('#filter-risk');
      if (riskSelect) {
        riskSelect.addEventListener('change', (e) => { selectedRisk = e.target.value; render(); });
      }

      const objSelect = container.querySelector('#filter-objective');
      if (objSelect) {
        objSelect.addEventListener('change', (e) => { selectedObjective = e.target.value; render(); });
      }

      const resetBtn = container.querySelector('#btn-reset-filters');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          searchTerm = ''; selectedRisk = 'all'; selectedObjective = 'all'; render();
        });
      }
    }

    render();
  }

  // --- PAGE 3: NEW ANALYSIS ---
  function renderNewAnalysisPage(container, router) {
    let formData = {
      brandName: store.user.brandName || '',
      productName: '',
      category: store.user.brandCategory || 'Consumer Electronics',
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
            <div style="margin-bottom: var(--spacing-20);">
              <a href="/dashboard" class="link-ember" style="font-size: 13px;" data-link>← Back to Dashboard</a>
            </div>

            <div class="setup-page-header">
              <h1 style="font-size: 38px; margin-bottom: 8px;">Pre-Flight Campaign Ingestion</h1>
              <p style="font-size: 15px; max-width: 720px;">
                Upload ad visuals, messaging claims, and real-world consumer review datasets for synthetic focus group evaluation.
              </p>
            </div>

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

            <form id="campaign-setup-form" novalidate>
              <div class="setup-grid-layout">
                <div class="setup-column">
                  <div class="setup-column-title">
                    <span>1. Campaign Context &amp; Copy</span>
                    <span class="text-caption">Required Claims</span>
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-16);">
                    <div class="form-group">
                      <label class="form-label" for="input-brand">Brand Name</label>
                      <input type="text" id="input-brand" class="form-input ${validationErrors.brandName ? 'has-error' : ''}" placeholder="e.g. AuraSound" value="${formData.brandName}" />
                      ${validationErrors.brandName ? `<div class="form-error-msg">${validationErrors.brandName}</div>` : ''}
                    </div>

                    <div class="form-group">
                      <label class="form-label" for="input-product">Product Name</label>
                      <input type="text" id="input-product" class="form-input ${validationErrors.productName ? 'has-error' : ''}" placeholder="e.g. AuraWave Pro" value="${formData.productName}" />
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
                    <textarea id="input-audience" class="form-textarea" placeholder="Describe your intended buyers, their pain points, and current alternatives...">${formData.targetAudience}</textarea>
                    <span class="form-helper">Informs persona calibration and objection sensitivity.</span>
                  </div>

                  <div style="margin-top: var(--spacing-32); padding-top: var(--spacing-20); border-top: 1px solid var(--color-mist);">
                    <h4 style="font-size: 16px; margin-bottom: var(--spacing-16);">Ad Creative Copy</h4>

                    <div class="form-group">
                      <label class="form-label" for="input-headline">Headline</label>
                      <input type="text" id="input-headline" class="form-input ${validationErrors.headline ? 'has-error' : ''}" placeholder="e.g. Silence The World. Hear Only What Matters." value="${formData.headline}" />
                      ${validationErrors.headline ? `<div class="form-error-msg">${validationErrors.headline}</div>` : ''}
                    </div>

                    <div class="form-group">
                      <label class="form-label" for="input-body">Body / Primary Text</label>
                      <textarea id="input-body" class="form-textarea" placeholder="Describe the product value proposition, specs, price point...">${formData.bodyText}</textarea>
                    </div>

                    <div class="form-group">
                      <label class="form-label" for="input-cta">Call to Action (CTA)</label>
                      <input type="text" id="input-cta" class="form-input ${validationErrors.callToAction ? 'has-error' : ''}" placeholder="e.g. Shop Now — Limited First Batch" value="${formData.callToAction}" />
                      ${validationErrors.callToAction ? `<div class="form-error-msg">${validationErrors.callToAction}</div>` : ''}
                    </div>
                  </div>
                </div>

                <div class="setup-column">
                  <div class="setup-column-title">
                    <span>2. Media &amp; Evidence Grounding</span>
                    <span class="text-caption">Multimodal Inputs</span>
                  </div>

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

              <div class="submission-bar-card">
                <div class="submission-meta">
                  <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--color-brass);"></span>
                  <span>Est. Token Compute: ~$0.04</span>
                  <span style="color: var(--color-mist);">|</span>
                  <span>5 Autonomous Personas</span>
                  <span style="color: var(--color-mist);">|</span>
                  <span>Evidence Grounding Active</span>
                </div>

                <button type="submit" id="btn-submit-simulation" class="btn btn-primary btn-lg">
                  Launch Pre-Flight Simulation →
                </button>
              </div>
            </form>
          </div>
        </main>

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

      const loadBtn = container.querySelector('#btn-load-benchmark');
      if (loadBtn) loadBtn.addEventListener('click', () => loadBenchmarkData());

      const syncInput = (id, key) => {
        const el = container.querySelector(id);
        if (el) el.addEventListener('input', (e) => { formData[key] = e.target.value; });
      };

      syncInput('#input-brand', 'brandName');
      syncInput('#input-product', 'productName');
      syncInput('#select-category', 'category');
      syncInput('#select-objective', 'objective');
      syncInput('#input-audience', 'targetAudience');
      syncInput('#input-headline', 'headline');
      syncInput('#input-body', 'bodyText');
      syncInput('#input-cta', 'callToAction');

      const toggleApi = container.querySelector('#toggle-live-api');
      if (toggleApi) toggleApi.addEventListener('change', (e) => { formData.liveApiEnrichment = e.target.checked; });

      const dropzoneImg = container.querySelector('#dropzone-image');
      const fileImgInput = container.querySelector('#file-image-input');
      if (dropzoneImg && fileImgInput) {
        dropzoneImg.addEventListener('click', () => fileImgInput.click());
        dropzoneImg.addEventListener('dragover', (e) => { e.preventDefault(); dropzoneImg.classList.add('dragover'); });
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

      const removeImgBtn = container.querySelector('#btn-remove-image');
      if (removeImgBtn) {
        removeImgBtn.addEventListener('click', () => {
          formData.image = null; formData.imageFileName = null; formData.imageFileSize = null; render();
        });
      }

      const dropzoneRev = container.querySelector('#dropzone-reviews');
      const fileRevInput = container.querySelector('#file-reviews-input');
      if (dropzoneRev && fileRevInput) {
        dropzoneRev.addEventListener('click', () => fileRevInput.click());
        dropzoneRev.addEventListener('dragover', (e) => { e.preventDefault(); dropzoneRev.classList.add('dragover'); });
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

      const removeRevBtn = container.querySelector('#btn-remove-reviews');
      if (removeRevBtn) {
        removeRevBtn.addEventListener('click', () => {
          formData.reviewsFile = null; formData.reviewsRowCount = 0; render();
        });
      }

      const form = container.querySelector('#campaign-setup-form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          if (validate()) {
            if (formData.brandName === BENCHMARK_CAMPAIGN.brandName) {
              window.showToast?.('Launching pre-flight simulation for AuraWave Pro...');
              router.navigate('/analysis/demo-1');
            } else {
              const created = await store.addCampaign({
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

  // --- PAGE 4: REPORT WORKSPACE ---
  function renderReportPage(container, router, params) {
    const campaignId = params.id || 'demo-1';
    const campaign = store.getCampaignById(campaignId);

    const getSession = (key) => {
      try { return typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(key) : null; } catch (e) { return null; }
    };
    const setSession = (key, val) => {
      try { if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(key, val); } catch (e) {}
    };

    let activeTab = 'diagnosis';
    let isSimulating = getSession(`sim_done_${campaignId}`) !== 'true';
    let simulationStep = 2;
    let simulationTimer = null;

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
            ${isSimulating ? `
              ${renderStepper(campaign.pipelineStages, simulationStep)}
            ` : `
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

            <!-- Smooth Bubble Tab Switch -->
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

            ${activeTab === 'diagnosis' ? `
              <div id="panel-diagnosis" role="tabpanel">
                <div class="diagnosis-hero-grid">
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

                    ${renderRadarChart(campaign.metrics || { attention: 8.2, clarity: 7.4, credibility: 4.1, purchaseIntent: 4.6 }, 250)}

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

                        <div class="persona-score-meters">
                          <div class="meter-item">
                            <div class="meter-label-row"><span>Attention</span><strong>${persona.scores.attention}/10</strong></div>
                            <div class="meter-bar-track"><div class="meter-bar-fill" style="width: ${persona.scores.attention * 10}%;"></div></div>
                          </div>
                          <div class="meter-item">
                            <div class="meter-label-row"><span>Clarity</span><strong>${persona.scores.clarity}/10</strong></div>
                            <div class="meter-bar-track"><div class="meter-bar-fill" style="width: ${persona.scores.clarity * 10}%;"></div></div>
                          </div>
                          <div class="meter-item">
                            <div class="meter-label-row"><span>Credibility</span><strong style="color: ${persona.scores.credibility < 5 ? 'var(--color-ember-orange)' : 'var(--color-graphite)'};">${persona.scores.credibility}/10</strong></div>
                            <div class="meter-bar-track"><div class="meter-bar-fill ${persona.scores.credibility < 5 ? 'accent' : ''}" style="width: ${persona.scores.credibility * 10}%;"></div></div>
                          </div>
                          <div class="meter-item">
                            <div class="meter-label-row"><span>Purchase Intent</span><strong style="color: ${persona.scores.purchaseIntent < 5 ? 'var(--color-ember-orange)' : 'var(--color-graphite)'};">${persona.scores.purchaseIntent}/10</strong></div>
                            <div class="meter-bar-track"><div class="meter-bar-fill ${persona.scores.purchaseIntent < 5 ? 'accent' : ''}" style="width: ${persona.scores.purchaseIntent * 10}%;"></div></div>
                          </div>
                        </div>

                        <div class="persona-gut-reaction">“${persona.gutReaction}”</div>

                        <div style="margin-bottom: var(--spacing-16);">
                          <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--color-slate); margin-bottom: 6px;">
                            Unanswered Objections:
                          </div>
                          <ul class="persona-objections-list">
                            ${persona.unansweredObjections.map(obj => `<li>${obj}</li>`).join('')}
                          </ul>
                        </div>
                      </div>

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

            ${activeTab === 'evidence' ? `
              <div id="panel-evidence" role="tabpanel">
                <div style="margin-bottom: var(--spacing-24);">
                  <h3 style="font-size: 22px;">Dataset Grounding &amp; Evidence Explorer</h3>
                  <p style="font-size: 13px; color: var(--color-slate);">
                    Proving AI persona hypotheses against ${campaign.reviewCount || 48} verified customer complaints to eliminate synthetic hallucinations.
                  </p>
                </div>

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

                <div class="evidence-table-container">
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

                        <div class="evidence-excerpt-quote">“${ev.excerpt}”</div>

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

      const skipBtn = container.querySelector('#btn-skip-stepper');
      if (skipBtn) skipBtn.addEventListener('click', () => skipSimulation());

      const replayBtn = container.querySelector('#btn-replay-simulation');
      if (replayBtn) replayBtn.addEventListener('click', () => startSimulation());

      const tabDiagnosis = container.querySelector('#tab-btn-diagnosis');
      const tabPersonas = container.querySelector('#tab-btn-personas');
      const tabEvidence = container.querySelector('#tab-btn-evidence');

      if (tabDiagnosis) tabDiagnosis.addEventListener('click', () => { activeTab = 'diagnosis'; render(); });
      if (tabPersonas) tabPersonas.addEventListener('click', () => { activeTab = 'personas'; render(); });
      if (tabEvidence) tabEvidence.addEventListener('click', () => { activeTab = 'evidence'; render(); });

      const sentimentSelect = container.querySelector('#select-evidence-sentiment');
      if (sentimentSelect) sentimentSelect.addEventListener('change', (e) => { evidenceSentimentFilter = e.target.value; render(); });

      const statusSelect = container.querySelector('#select-evidence-status');
      if (statusSelect) statusSelect.addEventListener('change', (e) => { evidenceStatusFilter = e.target.value; render(); });
    }

    if (isSimulating) {
      startSimulation();
    } else {
      render();
    }
  }

  // --- PAGE 5: BRAND & PROFILE SETTINGS (/settings) ---
  // With custom file upload for logo/creative mark
  function renderSettingsPage(container, router) {
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
              <div>
                <form id="profile-settings-form" novalidate>
                  
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

                    <div class="form-group" style="margin-top: var(--spacing-24);">
                      <label class="form-label">Brand Logo / Creative Mark</label>
                      <div class="brand-logo-selector">
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

      // Custom File Upload Input Handler
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

  // --- BOOTSTRAP ---
  window.showToast = function(message) {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-ember-dot"></span><span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'opacity 0.2s, transform 0.2s';
      setTimeout(() => toast.remove(), 200);
    }, 2800);
  };

  function initApp() {
    const appContainer = document.getElementById('app');
    if (!appContainer) return;

    const routes = [
      { path: '/login', render: () => renderLoginPage(appContainer, router) },
      { path: '/dashboard', render: () => {
        if (!store.isAuthenticated()) store.quickDemoLogin();
        renderDashboardPage(appContainer, router);
      }},
      { path: '/analysis/new', render: () => {
        if (!store.isAuthenticated()) store.quickDemoLogin();
        renderNewAnalysisPage(appContainer, router);
      }},
      { path: '/analysis/:id', render: (params) => {
        if (!store.isAuthenticated()) store.quickDemoLogin();
        renderReportPage(appContainer, router, params);
      }},
      { path: '/settings', render: () => {
        if (!store.isAuthenticated()) store.quickDemoLogin();
        renderSettingsPage(appContainer, router);
      }}
    ];

    const defaultRoute = store.isAuthenticated() ? '/dashboard' : '/login';
    const router = new Router(routes, defaultRoute);
    window.__router = router;
    router.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
