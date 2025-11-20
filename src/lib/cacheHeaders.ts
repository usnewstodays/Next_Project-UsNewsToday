/**
 * Cloudflare Pages Caching Headers
 * 
 * Optimizes caching strategy to reduce unnecessary API calls
 * while maintaining accurate analytics tracking
 */

interface CacheConfig {
  maxAge: number;
  sMaxAge: number;
  staleWhileRevalidate: number;
  staleIfError?: number;
}

/**
 * Cache configuration presets for different content types
 */
export const CACHE_CONFIGS = {
  // Static content - long cache
  html: {
    maxAge: 3600, // 1 hour (browser cache)
    sMaxAge: 86400, // 1 day (CDN cache)
    staleWhileRevalidate: 604800, // 7 days
    staleIfError: 2592000, // 30 days fallback
  } as CacheConfig,

  // CSS/JS - very long cache
  assets: {
    maxAge: 31536000, // 1 year
    sMaxAge: 31536000, // 1 year
    staleWhileRevalidate: 31536000,
  } as CacheConfig,

  // Images - moderate cache
  images: {
    maxAge: 2592000, // 30 days
    sMaxAge: 2592000,
    staleWhileRevalidate: 2592000,
  } as CacheConfig,

  // API endpoints - minimal cache
  api: {
    maxAge: 300, // 5 minutes
    sMaxAge: 300,
    staleWhileRevalidate: 600, // 10 minutes
  } as CacheConfig,

  // Analytics endpoints - no cache
  analytics: {
    maxAge: 0,
    sMaxAge: 0,
    staleWhileRevalidate: 0,
  } as CacheConfig,
} as const;

/**
 * Format cache control header
 */
export function formatCacheControl(config: CacheConfig): string {
  const parts = [
    `public`,
    `max-age=${config.maxAge}`,
    `s-maxage=${config.sMaxAge}`,
    `stale-while-revalidate=${config.staleWhileRevalidate}`,
  ];

  if (config.staleIfError) {
    parts.push(`stale-if-error=${config.staleIfError}`);
  }

  return parts.join(', ');
}

/**
 * Get cache config for content type
 */
export function getCacheConfigForContentType(
  contentType: string
): CacheConfig {
  if (contentType.includes('text/html')) {
    return CACHE_CONFIGS.html;
  } else if (
    contentType.includes('application/javascript') ||
    contentType.includes('text/css')
  ) {
    return CACHE_CONFIGS.assets;
  } else if (contentType.includes('image/')) {
    return CACHE_CONFIGS.images;
  } else if (contentType.includes('application/json')) {
    return CACHE_CONFIGS.api;
  }

  return CACHE_CONFIGS.api; // Default to API config
}

/**
 * Cloudflare Cache Tags for granular purging
 * Use this to invalidate specific content without affecting other caches
 */
export function generateCacheTags(pathOrContext: string): string[] {
  const tags: string[] = [];

  // Tag by content type
  if (pathOrContext.includes('/api/')) {
    tags.push('api');
  } else if (pathOrContext.includes('/category/')) {
    tags.push('category', 'posts');
  } else if (pathOrContext.includes('/author/')) {
    tags.push('author', 'posts');
  } else if (pathOrContext.includes('/tag/')) {
    tags.push('tag', 'posts');
  } else if (pathOrContext.includes('/search')) {
    tags.push('search', 'posts');
  } else if (pathOrContext === '/' || pathOrContext.includes('/page/')) {
    tags.push('homepage', 'posts');
  } else if (pathOrContext.includes('.')) {
    tags.push('assets');
  }

  // Add general tag
  tags.push('all-content');

  return tags;
}
