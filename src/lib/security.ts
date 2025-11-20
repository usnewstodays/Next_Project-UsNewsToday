/**
 * Security Configuration & Headers
 * Implements defense-in-depth security measures:
 * - Content Security Policy (CSP)
 * - Security headers (HSTS, X-Frame-Options, etc.)
 * - CORS protection
 * - Clickjacking prevention
 * - XSS protection
 * - Information disclosure prevention
 */

/**
 * Content Security Policy (CSP) headers
 * Restrictive by default, allows specific trusted sources only
 */
export const CSP_HEADERS = {
  // Restrict script execution to same-origin only + inline scripts with nonce
  'script-src': [
    "'self'", // Same-origin scripts only
    "'nonce-{NONCE}'", // Inline scripts with nonce (dynamic)
    'https://www.googletagmanager.com', // Google Analytics
    'https://www.google-analytics.com',
    'https://cdn.jsdelivr.net', // Only if using CDN (adjust as needed)
  ],
  
  // Restrict style sources
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Tailwind CSS uses inline styles
    'https://fonts.googleapis.com',
    'https://cdn.jsdelivr.net',
  ],
  
  // Restrict font sources
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:', // Data URIs for fonts
  ],
  
  // Restrict image sources
  'img-src': [
    "'self'",
    'data:',
    'https:', // Allow HTTPS images (news content)
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://www.facebook.com', // If using social features
  ],
  
  // Restrict connect sources (API calls, analytics)
  'connect-src': [
    "'self'",
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://region1.google-analytics.com',
    'process.env.WPGRAPHQL_ENDPOINT', // WordPress GraphQL endpoint
  ],
  
  // Restrict frame sources (prevent clickjacking)
  'frame-src': [
    "'none'", // Disable iframes by default
  ],
  
  // Restrict object/embed
  'object-src': ["'none'"],
  'media-src': ["'self'"],
  
  // Default policy
  'default-src': ["'self'"],
  
  // Form actions
  'form-action': ["'self'"],
  
  // Prevent framing of entire site
  'frame-ancestors': ["'none'"],
  
  // Upgrade insecure requests
  'upgrade-insecure-requests': [],
};

/**
 * Security headers to prevent common attacks
 */
export const SECURITY_HEADERS: Record<string, string> = {
  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',
  
  // Prevent content type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable browser XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Force HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Prevent referrer leaking
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy (formerly Feature-Policy)
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=()',
  
  // Hide server information
  'Server': 'Apache', // Generic - don't reveal actual server
  
  // Enable HSTS preload
  'Cache-Control': 'public, max-age=31536000, immutable',
};

/**
 * Build CSP header string from configuration
 */
export function buildCSPHeader(cspConfig: Record<string, string[]> = CSP_HEADERS, nonce?: string): string {
  return Object.entries(cspConfig)
    .map(([directive, sources]) => {
      const sourcesStr = sources
        .map((src) => {
          // Replace nonce placeholder
          if (src.includes('{NONCE}') && nonce) {
            return src.replace('{NONCE}', nonce);
          }
          // Replace env variable placeholder
          if (src.startsWith('process.env.')) {
            return src; // Will be handled server-side
          }
          return src;
        })
        .join(' ');
      
      return `${directive} ${sourcesStr}`.trim();
    })
    .join('; ');
}

/**
 * Build security headers object
 */
export function buildSecurityHeaders(headers: Record<string, string> = SECURITY_HEADERS): Record<string, string> {
  return { ...headers };
}

/**
 * Validate URL against whitelist
 * Prevents open redirect vulnerabilities
 */
export function isValidRedirectUrl(url: string, allowedOrigins: string[]): boolean {
  try {
    const parsed = new URL(url, 'http://localhost');
    return allowedOrigins.some((origin) => {
      const allowed = new URL(origin);
      return parsed.protocol === allowed.protocol && parsed.hostname === allowed.hostname;
    });
  } catch {
    return false;
  }
}

/**
 * Sanitize user input to prevent XSS
 * Use this for any user-provided content
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Generate cryptographically secure random string
 * Used for nonce generation
 * Uses Web Crypto API for compatibility with Edge Runtime
 */
export function generateNonce(length: number = 32): string {
  // Use Web Crypto API which works in browser, Edge Runtime, and Node.js 18+
  // globalThis.crypto is available in all these environments
  // This avoids importing Node.js 'crypto' module which is not supported in Edge Runtime
  if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
    throw new Error('Web Crypto API not available');
  }
  
  const array = new Uint8Array(length);
  globalThis.crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Validate API endpoint URL
 * Ensures only HTTPS endpoints in production
 */
export function validateApiEndpoint(endpoint: string, isProduction: boolean = false): boolean {
  try {
    const url = new URL(endpoint);

    // In production, require HTTPS
    if (isProduction && url.protocol !== 'https:') {
      console.error('❌ API endpoint must use HTTPS in production');
      return false;
    }

    // Reject localhost in production
    if (isProduction && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
      console.error('❌ Cannot use localhost API endpoint in production');
      return false;
    }

    return true;
  } catch {
    console.error('❌ Invalid API endpoint URL format');
    return false;
  }
}

/**
 * Rate limiting configuration
 * Protects against brute force and DDoS
 */
export const RATE_LIMIT_CONFIG = {
  // Search API
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
  },
  
  // General API
  api: {
    windowMs: 60 * 1000,
    maxRequests: 100,
  },
  
  // Authentication (if applicable)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts
  },
};

/**
 * Request logging for security auditing
 * Log failed authentication, rate limit violations, etc.
 */
export function logSecurityEvent(
  eventType: string,
  details: Record<string, any>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
): void {
  const timestamp = new Date().toISOString();
  const logMessage = {
    timestamp,
    eventType,
    severity,
    details: {
      ...details,
      // Never log sensitive data
      password: '[REDACTED]',
      token: '[REDACTED]',
      secret: '[REDACTED]',
      apiKey: '[REDACTED]',
    },
  };

  // In production, send to security logging service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Sentry, DataDog, or custom logging service
    console.error(`[SECURITY] ${severity.toUpperCase()}: ${eventType}`, logMessage);
  } else {
    console.warn(`[SECURITY] ${severity.toUpperCase()}: ${eventType}`, logMessage);
  }
}

export default {
  CSP_HEADERS,
  SECURITY_HEADERS,
  RATE_LIMIT_CONFIG,
  buildCSPHeader,
  buildSecurityHeaders,
  isValidRedirectUrl,
  sanitizeInput,
  generateNonce,
  validateApiEndpoint,
  logSecurityEvent,
};
