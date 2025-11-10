/**
 * Anti-Scraping Middleware
 * Detects and blocks scraping attempts without rate limiting
 */

import { getClientIp } from '../utils/ipUtils.js';

// Re-export for backward compatibility
export { getClientIp };

// Known bot user agents
const BOT_USER_AGENTS = [
  'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python-requests',
  'scrapy', 'beautifulsoup', 'selenium', 'headless', 'phantom', 'puppeteer',
  'playwright', 'postman', 'insomnia', 'httpie', 'go-http-client',
  'apache-httpclient', 'okhttp', 'java/', 'node-fetch', 'axios'
];

// Suspicious patterns
const SUSPICIOUS_PATTERNS = {
  // Rapid sequential requests
  rapidRequests: new Map(), // IP -> { count, firstRequest }
  
  // Missing browser headers
  missingHeaders: ['accept', 'accept-language', 'accept-encoding'],
  
  // Suspicious query patterns
  suspiciousQueries: [
    /limit=\d{3,}/, // limit > 100
    /page=\d{4,}/, // page > 1000
    /offset=\d{4,}/, // offset > 1000
  ],
};

// getClientIp is imported from ipUtils.js above

/**
 * Check if user agent is a bot
 */
function isBotUserAgent(userAgent) {
  if (!userAgent) return true; // Missing user agent is suspicious
  
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

/**
 * Check if request has suspicious patterns
 */
function hasSuspiciousPatterns(req) {
  const url = req.url || '';
  const query = req.query || {};
  
  // Check for suspicious query parameters
  for (const pattern of SUSPICIOUS_PATTERNS.suspiciousQueries) {
    if (pattern.test(url)) {
      return true;
    }
  }
  
  // Check for excessive pagination
  if (query.limit && parseInt(query.limit) > 50) {
    return true;
  }
  
  if (query.page && parseInt(query.page) > 100) {
    return true;
  }
  
  return false;
}

/**
 * Check if request is missing required browser headers
 */
function missingBrowserHeaders(req) {
  const headers = req.headers || {};
  const missing = [];
  
  for (const header of SUSPICIOUS_PATTERNS.missingHeaders) {
    if (!headers[header] && !headers[header.toLowerCase()]) {
      missing.push(header);
    }
  }
  
  // If missing more than 2 headers, it's suspicious
  return missing.length > 2;
}

/**
 * Check for rapid sequential requests (potential scraping)
 */
function checkRapidRequests(req) {
  const ip = getClientIp(req);
  const now = Date.now();
  
  if (!SUSPICIOUS_PATTERNS.rapidRequests.has(ip)) {
    SUSPICIOUS_PATTERNS.rapidRequests.set(ip, {
      count: 1,
      firstRequest: now,
      lastRequest: now,
    });
    return false;
  }
  
  const record = SUSPICIOUS_PATTERNS.rapidRequests.get(ip);
  const timeDiff = now - record.lastRequest;
  
  // If requests are coming faster than 100ms apart, it's suspicious
  if (timeDiff < 100) {
    record.count++;
    record.lastRequest = now;
    
    // If more than 10 rapid requests, block
    if (record.count > 10) {
      return true;
    }
  } else {
    // Reset if time gap is reasonable
    record.count = 1;
    record.lastRequest = now;
  }
  
  // Clean up old entries (older than 1 minute)
  if (now - record.firstRequest > 60000) {
    SUSPICIOUS_PATTERNS.rapidRequests.delete(ip);
  }
  
  return false;
}

/**
 * Main anti-scraping middleware
 */
export const antiScrapingMiddleware = (req, res, next) => {
  // Skip for health checks and static files
  if (req.path === '/health' || req.path === '/' || req.path.startsWith('/uploads/')) {
    return next();
  }
  
  const userAgent = req.headers['user-agent'] || '';
  const ip = getClientIp(req);
  
  // Check 1: Bot user agent
  if (isBotUserAgent(userAgent)) {
    console.warn(`[Anti-Scraping] Bot detected: ${userAgent} from IP: ${ip}`);
    return res.status(403).json({
      status: false,
      message: 'Access denied. Automated requests are not allowed.',
    });
  }
  
  // Check 2: Missing browser headers
  if (missingBrowserHeaders(req)) {
    console.warn(`[Anti-Scraping] Missing browser headers from IP: ${ip}`);
    return res.status(403).json({
      status: false,
      message: 'Invalid request. Please use a web browser.',
    });
  }
  
  // Check 3: Suspicious query patterns
  if (hasSuspiciousPatterns(req)) {
    console.warn(`[Anti-Scraping] Suspicious query patterns from IP: ${ip}, URL: ${req.url}`);
    return res.status(400).json({
      status: false,
      message: 'Invalid request parameters.',
    });
  }
  
  // Check 4: Rapid sequential requests
  if (checkRapidRequests(req)) {
    console.warn(`[Anti-Scraping] Rapid requests detected from IP: ${ip}`);
    return res.status(429).json({
      status: false,
      message: 'Too many requests. Please slow down.',
    });
  }
  
  next();
};

/**
 * Enforce pagination limits
 */
export const enforcePaginationLimits = (req, res, next) => {
  const query = req.query || {};
  
  // Enforce maximum limits
  if (query.limit) {
    const limit = parseInt(query.limit);
    if (limit > 50) {
      query.limit = 50; // Max 50 items per page
    }
  } else {
    query.limit = 10; // Default to 10 if not specified
  }
  
  if (query.page) {
    const page = parseInt(query.page);
    if (page > 100) {
      return res.status(400).json({
        status: false,
        message: 'Maximum page number is 100.',
      });
    }
  }
  
  req.query = query;
  next();
};

/**
 * Require authentication for sensitive endpoints
 */
export const requireAuthForData = (req, res, next) => {
  // List of endpoints that require authentication
  const protectedPaths = [
    '/api/users',
    '/api/profiles',
  ];
  
  const isProtected = protectedPaths.some(path => req.path.startsWith(path));
  
  if (isProtected && !req.user) {
    return res.status(401).json({
      status: false,
      message: 'Authentication required to access this data.',
    });
  }
  
  next();
};

/**
 * Add security headers to prevent scraping
 */
export const securityHeaders = (req, res, next) => {
  // Add headers to make scraping harder
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Don't expose internal structure
  res.removeHeader('X-Powered-By');
  
  next();
};

