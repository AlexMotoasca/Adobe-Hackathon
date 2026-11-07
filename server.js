/**
 * MindMarket Local Server & REST API
 * Pure Node.js HTTP server (zero external dependencies).
 * Serves static assets, handles SPA route fallback, and provides robust REST API endpoints.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
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

// Helper to parse JSON body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlParts = req.url.split('?');
  const pathname = decodeURIComponent(urlParts[0]);

  // ==========================================
  // REST API ROUTER
  // ==========================================
  if (pathname.startsWith('/api/')) {
    try {
      // 1. Health API
      if (pathname === '/api/health') {
        return sendJson(res, 200, {
          status: 'ok',
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

      // 3. Campaigns List: GET /api/campaigns & POST /api/campaigns
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
            message: 'Campaign created and queued for simulation',
            campaign: newCamp
          });
        }
      }

      // 4. Single Campaign API: GET /api/campaigns/:id
      if (pathname.startsWith('/api/campaigns/')) {
        const id = pathname.replace('/api/campaigns/', '');
        const found = serverCampaigns.find(c => c.id === id);
        if (found || id === 'demo-1') {
          return sendJson(res, 200, {
            success: true,
            campaign: found || serverCampaigns[0]
          });
        } else {
          return sendJson(res, 404, {
            success: false,
            error: `Campaign with id '${id}' not found`
          });
        }
      }

      // 5. Pre-flight Simulation API: POST /api/simulate
      if (pathname === '/api/simulate' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        return sendJson(res, 200, {
          success: true,
          status: 'completed',
          simulationId: 'sim-' + Date.now(),
          campaignId: body.campaignId || 'demo-1',
          personasEvaluated: 5,
          evidenceGroundingRatio: 0.92,
          synthesizedAt: new Date().toISOString()
        });
      }

      // Unmatched API route
      return sendJson(res, 404, {
        success: false,
        error: `API route '${pathname}' not recognized`
      });

    } catch (apiError) {
      console.error('API Error:', apiError);
      return sendJson(res, 500, {
        success: false,
        error: apiError.message || 'Internal server error in API route'
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
  console.log(`\n==================================================`);
  console.log(`  MindMarket — Ad Testing & Consumer Intelligence`);
  console.log(`  Ventriloc Design System • REST API Enabled`);
  console.log(`==================================================`);
  console.log(`  Local server running at: http://localhost:${PORT}`);
  console.log(`  - /login         : Evaluator & User Authentication`);
  console.log(`  - /dashboard     : Campaign History & Performance Stats`);
  console.log(`  - /analysis/new  : Campaign Setup & Visual Upload`);
  console.log(`  - /analysis/demo-1: AuraWave Pro Deep Workspace Report`);
  console.log(`  - /settings      : Brand Identity & User Profile Settings`);
  console.log(`  - /api/user      : GET/POST User profile & Brand`);
  console.log(`  - /api/campaigns : GET/POST Campaigns REST API`);
  console.log(`==================================================\n`);
});
