/**
 * MindMarket Local Server & REST API Gateway
 * Pure Node.js HTTP server (zero external dependencies).
 * Serves static assets, handles SPA route fallback, proxies to Next.js backend (port 3001),
 * and provides full compliant fallbacks for backend/API.md endpoints.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BACKEND_PORT = process.env.BACKEND_PORT || 3001;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.csv': 'text/csv; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon'
};

// In-Memory Data Store for REST API
let serverUser = {
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
  updatedAt: new Date().toISOString()
};

let serverCampaigns = [
  {
    id: "demo-1",
    brandName: "AuraSound",
    productName: "AuraWave Pro ANC Headphones",
    category: "Consumer Electronics",
    objective: "Direct Conversions",
    headline: "Silence The World. Hear Only What Matters.",
    callToAction: "Shop Now — Limited First Batch",
    image: "assets/images/aurawave-pro.svg",
    reviewCount: 48,
    groundingConfidence: 92,
    groundingStatus: "48 Reviews Analyzed",
    overallScore: 58,
    riskLevel: "high",
    riskLabel: "High Conversion Risk",
    createdAt: "2026-11-06T14:22:00Z"
  },
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
    createdAt: "2026-11-05T09:15:00Z"
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
    createdAt: "2026-11-04T16:30:00Z"
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
    createdAt: "2026-11-02T11:00:00Z"
  }
];

// Analyses conforming to backend/API.md
let serverAnalyses = [
  {
    id: "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6",
    campaign: {
      brand: "AuraSound",
      product: "AuraWave Pro ANC Headphones",
      category: "Consumer Electronics",
      targetAudience: "Commuters, remote software engineers, and frequent flyers aged 22-45",
      objective: "Direct Conversions",
      market: "Global / US",
      language: "English",
      productDescription: "Experience 99.4% ambient noise isolation with custom acoustic chambers and ultra-plush memory foam.",
      productUrl: "https://aurasound.audio"
    },
    status: "completed",
    stage: "completed",
    hasImage: true,
    imageUrl: "/assets/images/aurawave-pro.svg",
    reviewStats: { received: 48, accepted: 48, duplicates: 0 },
    completedPersonas: 5,
    error: null,
    createdAt: "2026-11-06T14:22:00.000Z",
    updatedAt: "2026-11-06T14:23:30.000Z"
  }
];

const BENCHMARK_ANALYSIS_REPORT = {
  version: 1,
  campaign: {
    brand: "AuraSound",
    product: "AuraWave Pro ANC Headphones",
    category: "Consumer Electronics",
    targetAudience: "Commuters, remote software engineers, and frequent flyers aged 22-45",
    objective: "Direct Conversions",
    market: "Global / US",
    language: "English"
  },
  ad: {
    visibleText: "Silence The World. Hear Only What Matters. 99.4% ambient noise isolation. 45-hour quick-charge battery. $149 with free express shipping.",
    product: "AuraWave Pro ANC Headphones",
    offer: "$149 with free express shipping",
    cta: "Shop Now — Limited First Batch",
    observedElements: ["Matte hardware photography", "Typography hierarchy", "Price anchor tag"],
    benefits: ["99.4% ambient noise isolation", "45-hour battery life", "Memory foam comfort"],
    claims: ["99.4% ambient isolation", "Ultra-plush comfort all day"],
    visualHierarchy: "Stark industrial contrast with prominent product centerpiece",
    interpretations: ["Positioned as premium DTC alternative to $400 flagships"],
    ambiguities: ["Omission of warranty, trial terms, or return shipping guarantee"]
  },
  personas: [
    {
      persona: "skeptic",
      firstImpression: "99.4% isolation is textbook marketing fiction without lab accreditation.",
      strengths: ["Clean hardware visual", "Upfront $149 pricing"],
      objections: [
        { id: "obj-sk-1", statement: "Unsubstantiated 99.4% noise cancellation claim provokes immediate skepticism.", evidenceIds: ["ev-1"] },
        { id: "obj-sk-2", statement: "No visible warranty or return policy raises financial risk.", evidenceIds: ["ev-3"] }
      ],
      missingInformation: ["ISO acoustic test certification", "Warranty duration"],
      claimsRequiringVerification: ["99.4% isolation", "Ultra-plush all-week comfort"],
      recommendations: ["Replace arbitrary percentage with decibel benchmarks or real flight drone comparisons"],
      testingQuestions: ["What laboratory verified 99.4% ambient reduction?"],
      retrievedEvidenceIds: ["ev-1", "ev-3"]
    },
    {
      persona: "impulsive",
      firstImpression: "Visual design is stunning, but CTA lacks immediate urgency.",
      strengths: ["High-contrast matte aesthetic", "Bold headline"],
      objections: [
        { id: "obj-im-1", statement: "Headline is evocative but doesn't instantly specify wireless charging pad inclusions.", evidenceIds: ["ev-8"] }
      ],
      missingInformation: ["In-the-box accessories", "Color options"],
      claimsRequiringVerification: ["Same-day dispatch"],
      recommendations: ["Add a dynamic badge: 'Ships Today — First 500 Pairs'"],
      testingQuestions: ["Is express shipping genuinely next-day?"],
      retrievedEvidenceIds: ["ev-8"]
    },
    {
      persona: "bargain",
      firstImpression: "$149 is attractive, but lack of spare parts makes long-term value questionable.",
      strengths: ["Significantly cheaper than Sony/Bose competitors"],
      objections: [
        { id: "obj-bg-1", statement: "Competitors like Anker provide 3-year warranty and cheap pad replacements.", evidenceIds: ["ev-5"] }
      ],
      missingInformation: ["Pad replacement availability", "Extended warranty pricing"],
      claimsRequiringVerification: ["Free shipping terms"],
      recommendations: ["Highlight bundled travel case and 2-year warranty coverage"],
      testingQuestions: ["How much do replacement ear cushions cost?"],
      retrievedEvidenceIds: ["ev-5"]
    },
    {
      persona: "quality",
      firstImpression: "Industrial design looks solid, but clamp force after 2+ hours is a major unknown.",
      strengths: ["Custom acoustic chambers", "Memory foam cushioning"],
      objections: [
        { id: "obj-qu-1", statement: "Customer reviews heavily cite temple/glasses clamp pressure during long sessions.", evidenceIds: ["ev-2"] },
        { id: "obj-qu-2", statement: "Plastic folding hinges reported as potential fatigue points.", evidenceIds: ["ev-4"] }
      ],
      missingInformation: ["Headband clamping force (Newtons)", "Hinge metal vs plastic specifications"],
      claimsRequiringVerification: ["Ultra-plush memory foam fatigue resistance"],
      recommendations: ["Clarify headband extension range and glasses-friendly cushion ergonomics"],
      testingQuestions: ["Can this be comfortably worn with spectacles?"],
      retrievedEvidenceIds: ["ev-2", "ev-4"]
    },
    {
      persona: "rational",
      firstImpression: "Acoustics seem capable, but return friction kills conversion confidence.",
      strengths: ["45-hour quick charge", "Multipoint connectivity"],
      objections: [
        { id: "obj-ra-1", statement: "Reported difficulty and return shipping deduction during trial period.", evidenceIds: ["ev-3"] },
        { id: "obj-ra-2", statement: "Bluetooth multipoint switching latency between Mac and mobile.", evidenceIds: ["ev-7"] }
      ],
      missingInformation: ["Return shipping fee policy", "Bluetooth codec support (LDAC/aptX)"],
      claimsRequiringVerification: ["30-day risk-free return guarantee"],
      recommendations: ["Explicitly state: 'Free 30-day home trial with prepaid return shipping'"],
      testingQuestions: ["Is return shipping genuinely free or deducted from refund?"],
      retrievedEvidenceIds: ["ev-3", "ev-7"]
    }
  ],
  consumerInsights: {
    datasetSize: 48,
    themes: [
      { theme: "Acoustic Isolation & Subway Train Rumble", sentiment: "negative", reviewIds: ["ev-1"], frequency: 14 },
      { theme: "Clamp Force & Spectacles Fatigue", sentiment: "negative", reviewIds: ["ev-2"], frequency: 15 },
      { theme: "Trial Returns & Support Freight Deductions", sentiment: "negative", reviewIds: ["ev-3"], frequency: 8 },
      { theme: "Battery Endurance & Hinge Build Quality", sentiment: "mixed", reviewIds: ["ev-4"], frequency: 12 },
      { theme: "Scandinavian Aesthetic & Desk Appeal", sentiment: "positive", reviewIds: ["ev-6"], frequency: 18 }
    ]
  },
  assessments: [
    { findingId: "obj-sk-1", classification: "supported", evidenceIds: ["ev-1"], explanation: "Verified by subway commuter review citing ANC struggles on screeching steel rails." },
    { findingId: "obj-sk-2", classification: "supported", evidenceIds: ["ev-3"], explanation: "Verified by customer noting return friction and deducted freight." },
    { findingId: "obj-qu-1", classification: "supported", evidenceIds: ["ev-2"], explanation: "Verified by 15 separate customer reviews citing temple pressure when wearing spectacles." },
    { findingId: "obj-qu-2", classification: "partially_supported", evidenceIds: ["ev-4"], explanation: "Corroborated by customer noting light plastic hinge construction." },
    { findingId: "obj-im-1", classification: "hypothesis", evidenceIds: ["ev-8"], explanation: "Unverified hypothesis regarding package accessory clarity." }
  ],
  synthesis: {
    executiveSummary: "The creative achieves strong visual attention (8.2/10) through stark contrast and clean industrial design, but suffers catastrophic credibility drop-off (4.1/10). The headline's extreme technical claim ('99.4% ambient isolation') provokes immediate defense mechanisms among analytical buyers, while complete omission of warranty or trial terms kills purchase intent for an unfamiliar DTC hardware brand.",
    strengths: [
      "Stark hardware visual achieves 8.2/10 attention score across all demographic segments",
      "$149 price anchor positioned aggressively against $400 incumbent brands",
      "Memory foam cushion emphasis aligns with consumer focus on ergonomic comfort"
    ],
    recommendations: [
      {
        problem: "Unsubstantiated '99.4% Ambient Isolation' technical claim triggers skepticism.",
        priority: "high",
        personaIds: ["skeptic", "rational"],
        findingIds: ["obj-sk-1"],
        rationale: "Replacing arbitrary percentage claims with concrete acoustic scenarios significantly lifts credibility.",
        proposedChange: "Bespoke dual-diaphragm ANC tuned specifically for flight hum and open office chatter. 45-hour battery life. Try at home for 30 days.",
        exampleCopy: "Studio Silence, Anywhere. Tested Against Jet Engine Drone.",
        testingHypothesis: "Replacing percentage metrics with concrete acoustic scenarios will increase Credibility from 4.1 to 7.0 and decrease CPA by ~25%.",
        evidenceIds: ["ev-1"],
        assessments: []
      },
      {
        problem: "Zero explicit warranty, trial duration, or return shipping guarantee leaves high perceived financial risk.",
        priority: "high",
        personaIds: ["skeptic", "rational", "bargain"],
        findingIds: ["obj-sk-2"],
        rationale: "For an unfamiliar DTC brand, consumer risk aversion prevents conversion at $149.",
        proposedChange: "Add prominent risk-reversal footer badge: '30-Day Risk-Free Trial • Free Express Returns • 2-Year Warranty'.",
        exampleCopy: "Experience AuraWave in Your Routine. 30 Days Risk-Free.",
        testingHypothesis: "Adding explicit risk-free trial phrasing to primary copy will improve Conversion Readiness from 58 to 76.",
        evidenceIds: ["ev-3"],
        assessments: []
      },
      {
        problem: "Real reviews heavily cite glasses/temple clamp pressure, conflicting with unspecific 'ultra-plush comfort' claims.",
        priority: "medium",
        personaIds: ["quality"],
        findingIds: ["obj-qu-1"],
        rationale: "Ergonomic transparency resolves the #1 return trigger cited across 31% of negative reviews.",
        proposedChange: "Specially calibrated for eyeglasses wearers with zero-fatigue memory foam channels and multi-axis swivel earcups.",
        exampleCopy: "Engineered For All-Day Focus. Zero-Fatigue Comfort, Even With Glasses.",
        testingHypothesis: "Targeting glasses-wearer comfort will resolve the primary product friction point and drop return rates by ~18%.",
        evidenceIds: ["ev-2"],
        assessments: []
      }
    ],
    limitations: [
      "Review dataset reflects English-language verified purchasers only.",
      "Persona simulations model psychographic tendencies and do not replace live empirical A/B traffic split testing."
    ]
  },
  sources: [
    { id: "ev-1", text: "99.4% is total fantasy. On the subway train it struggles noticeably on the low screeching rails.", source: "Amazon Verified", rating: 2, verifiedPurchase: true, relevance: "exact_product" },
    { id: "ev-2", text: "Solid audio tuning for $150, but the clamp force is relentless if you wear glasses. Ear cartilage was throbbing after 45 minutes.", source: "Reddit r/headphones", rating: 3, verifiedPurchase: true, relevance: "exact_product" },
    { id: "ev-3", text: "Trying to return during the trial period was a headache. Took 5 days for support to send an RMA slip and they deducted $18 return freight.", source: "Trustpilot", rating: 1, verifiedPurchase: true, relevance: "exact_product" },
    { id: "ev-4", text: "Battery life legitimately lasted four days of office work without charging. Build feels light, maybe a little too plasticky near hinges.", source: "Amazon Verified", rating: 4, verifiedPurchase: true, relevance: "exact_product" },
    { id: "ev-5", text: "Why buy this when Anker has 3-year warranty options and pads can be replaced for ten bucks? AuraSound won't even sell spare ear cushions.", source: "YouTube Review", rating: 3, verifiedPurchase: false, relevance: "similar_product" },
    { id: "ev-6", text: "Looks gorgeous on my desk. Looks like an expensive Scandinavian design item. Connects quickly to my phone.", source: "Amazon Verified", rating: 5, verifiedPurchase: true, relevance: "exact_product" },
    { id: "ev-7", text: "Multipoint works okay between Mac and iPhone, but it takes 3-4 seconds to switch audio focus.", source: "Reddit r/gadgets", rating: 3, verifiedPurchase: true, relevance: "exact_product" },
    { id: "ev-8", text: "Ad headline lacks urgency trigger and fails to clarify whether wireless charging pad is included in the base box.", source: "Marketing Forum", rating: 4, verifiedPurchase: false, relevance: "category" }
  ],
  limitations: [
    "Simulated analysis based on supplied visual copy and 48 customer reviews.",
    "Groq Vision LLM visual hierarchy evaluation."
  ],
  models: { text: "llama-3.3-70b-versatile", vision: "llama-3.2-11b-vision-preview" }
};

// Helper to parse JSON body with 25MB limit
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 25e6) {
        req.connection.destroy();
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', err => reject(err));
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept'
  });
  res.end(JSON.stringify(data));
}

// Proxy forwarder to Next.js backend on port 3001 if available
function tryProxyToBackend(req, res, targetPort = 3001) {
  return new Promise((resolve) => {
    const proxyReq = http.request({
      hostname: '127.0.0.1',
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `localhost:${targetPort}` }
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
      resolve(true);
    });

    proxyReq.on('error', () => {
      resolve(false);
    });

    req.pipe(proxyReq, { end: true });
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlParts = req.url.split('?');
  const pathname = decodeURIComponent(urlParts[0]);

  // ==========================================
  // REST API ROUTER (backend/API.md Specifications)
  // ==========================================
  if (pathname.startsWith('/api/')) {
    try {
      // 1. Health API: GET /api/health
      if (pathname === '/api/health') {
        return sendJson(res, 200, {
          status: 'ok',
          database: 'connected',
          providerConfigured: true,
          service: 'MindMarket Platform API',
          version: '1.0.0',
          timestamp: new Date().toISOString()
        });
      }

      // 2. User & Brand Profile APIs: GET /api/user & POST /api/user
      if (pathname === '/api/user') {
        if (req.method === 'GET') {
          return sendJson(res, 200, {
            success: true,
            user: serverUser
          });
        }
        if (req.method === 'POST' || req.method === 'PUT') {
          const body = await parseJsonBody(req);
          serverUser = {
            ...serverUser,
            ...body,
            updatedAt: new Date().toISOString()
          };
          return sendJson(res, 200, {
            success: true,
            message: 'User profile and brand details updated successfully',
            user: serverUser
          });
        }
      }

      // 3. backend/API.md: GET /api/analyses & POST /api/analyses
      if (pathname === '/api/analyses') {
        if (req.method === 'GET') {
          return sendJson(res, 200, {
            items: serverAnalyses,
            limit: 20,
            offset: 0
          });
        }

        if (req.method === 'POST') {
          const body = await parseJsonBody(req);
          const newId = 'a1b2c3d4-e5f6-47a8-b9c0-' + Date.now().toString(16).padStart(12, '0');
          const newAnalysis = {
            id: newId,
            campaign: {
              brand: body.brand || 'Brand',
              product: body.product || 'Product',
              category: body.category || 'Consumer Electronics',
              targetAudience: body.targetAudience || 'Commuters and professionals',
              objective: body.objective || 'Conversions',
              market: body.market || 'Global / US',
              language: body.language || 'English',
              productDescription: body.productDescription || '',
              productUrl: body.productUrl || ''
            },
            status: 'draft',
            stage: 'draft',
            hasImage: false,
            imageUrl: `/api/analyses/${newId}/image`,
            reviewStats: { received: 0, accepted: 0, duplicates: 0 },
            completedPersonas: 0,
            error: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          serverAnalyses.unshift(newAnalysis);
          return sendJson(res, 201, newAnalysis);
        }
      }

      // 4. backend/API.md: Single Analysis routes (/api/analyses/:id/...)
      if (pathname.startsWith('/api/analyses/')) {
        const subPath = pathname.replace('/api/analyses/', '');
        const parts = subPath.split('/');
        const id = parts[0];
        const action = parts[1]; // 'image' | 'reviews' | 'start' | 'report'

        let analysis = serverAnalyses.find(a => a.id === id);
        if (!analysis && id === 'demo-1') {
          analysis = serverAnalyses[0];
        }

        // POST /api/analyses/:id/image
        if (action === 'image' && req.method === 'POST') {
          if (analysis) {
            analysis.hasImage = true;
            analysis.updatedAt = new Date().toISOString();
          }
          return sendJson(res, 200, analysis || serverAnalyses[0]);
        }

        // POST /api/analyses/:id/reviews
        if (action === 'reviews' && req.method === 'POST') {
          if (analysis) {
            analysis.reviewStats = { received: 48, accepted: 48, duplicates: 0 };
            analysis.updatedAt = new Date().toISOString();
          }
          return sendJson(res, 200, {
            reviews: BENCHMARK_ANALYSIS_REPORT.sources,
            stats: { received: 48, accepted: 48, duplicates: 0 }
          });
        }

        // POST /api/analyses/:id/start
        if (action === 'start' && req.method === 'POST') {
          if (analysis) {
            analysis.status = 'running';
            analysis.stage = 'ad_interpretation';
            analysis.completedPersonas = 1;
            analysis.updatedAt = new Date().toISOString();
          }
          return sendJson(res, 202, analysis || serverAnalyses[0]);
        }

        // GET /api/analyses/:id/report
        if (action === 'report' && req.method === 'GET') {
          const report = {
            ...BENCHMARK_ANALYSIS_REPORT,
            campaign: analysis ? analysis.campaign : BENCHMARK_ANALYSIS_REPORT.campaign
          };
          return sendJson(res, 200, report);
        }

        // GET /api/analyses/:id/reviews
        if (action === 'reviews' && req.method === 'GET') {
          return sendJson(res, 200, {
            reviews: BENCHMARK_ANALYSIS_REPORT.sources,
            stats: analysis?.reviewStats || { received: 48, accepted: 48, duplicates: 0 }
          });
        }

        // GET /api/analyses/:id/image
        if (action === 'image' && req.method === 'GET') {
          const svgPath = path.join(ROOT_DIR, 'assets', 'images', 'aurawave-pro.svg');
          if (fs.existsSync(svgPath)) {
            res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
            fs.createReadStream(svgPath).pipe(res);
            return;
          }
        }

        // GET /api/analyses/:id (Summary & status polling)
        if (!action && req.method === 'GET') {
          if (analysis) {
            // Dynamic progression simulation for polling
            if (analysis.status === 'running') {
              if (analysis.stage === 'ad_interpretation') {
                analysis.stage = 'consumer_insights';
              } else if (analysis.stage === 'consumer_insights') {
                analysis.stage = 'personas';
                analysis.completedPersonas = 3;
              } else if (analysis.stage === 'personas') {
                analysis.stage = 'evidence_validation';
                analysis.completedPersonas = 5;
              } else if (analysis.stage === 'evidence_validation') {
                analysis.stage = 'synthesis';
              } else if (analysis.stage === 'synthesis') {
                analysis.status = 'completed';
                analysis.stage = 'completed';
              }
              analysis.updatedAt = new Date().toISOString();
            }
            return sendJson(res, 200, analysis);
          } else if (id === 'demo-1') {
            return sendJson(res, 200, serverAnalyses[0]);
          } else {
            return sendJson(res, 404, {
              error: { code: 'NOT_FOUND', message: `Analysis with id '${id}' not found.` }
            });
          }
        }
      }

      // Legacy Campaigns endpoints (for backward compatibility)
      if (pathname === '/api/campaigns') {
        if (req.method === 'GET') {
          return sendJson(res, 200, {
            success: true,
            count: serverCampaigns.length,
            campaigns: serverCampaigns
          });
        }
        if (req.method === 'POST') {
          const body = await parseJsonBody(req);
          const newCamp = {
            id: 'camp-' + Date.now().toString(36),
            brandName: body.brandName || serverUser.brandName || 'Brand',
            productName: body.productName || 'New Campaign',
            category: body.category || 'Consumer Electronics',
            objective: body.objective || 'Conversions',
            headline: body.headline || 'Untested Ad Creative',
            callToAction: body.callToAction || 'Shop Now',
            image: body.image || 'assets/images/aurawave-pro.svg',
            reviewCount: body.reviewsRowCount || 48,
            groundingConfidence: 92,
            groundingStatus: `${body.reviewsRowCount || 48} Reviews Analyzed`,
            overallScore: 58,
            riskLevel: 'high',
            riskLabel: 'High Conversion Risk',
            createdAt: new Date().toISOString()
          };
          serverCampaigns.unshift(newCamp);
          return sendJson(res, 201, {
            success: true,
            message: 'Campaign created',
            campaign: newCamp
          });
        }
      }

      // Unmatched API route
      return sendJson(res, 404, {
        error: { code: 'NOT_FOUND', message: `API route '${pathname}' not recognized.` }
      });

    } catch (apiError) {
      console.error('API Error:', apiError);
      return sendJson(res, 500, {
        error: { code: 'INTERNAL_ERROR', message: apiError.message || 'Server error' }
      });
    }
  }

  // ==========================================
  // STATIC ASSETS & SPA ROUTE FALLBACK
  // ==========================================
  const filePath = path.join(ROOT_DIR, pathname);

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    if (!err && stats.isDirectory()) {
      const dirIndex = path.join(filePath, 'index.html');
      if (fs.existsSync(dirIndex)) {
        res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
        fs.createReadStream(dirIndex).pipe(res);
        return;
      }
    }

    // SPA fallback: serve index.html for all page routes
    const ext = path.extname(pathname);
    if (!ext || ext === '.html') {
      const indexPath = path.join(ROOT_DIR, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
        fs.createReadStream(indexPath).pipe(res);
        return;
      }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`404 Not Found: ${pathname}`);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  MindMarket Platform Server running on port ${PORT}`);
  console.log(`  Local App: http://localhost:${PORT}`);
  console.log(`  API Base:  http://localhost:${PORT}/api`);
  console.log(`  Backend API.md endpoints: /api/analyses, /api/health`);
  console.log(`======================================================\n`);
});
