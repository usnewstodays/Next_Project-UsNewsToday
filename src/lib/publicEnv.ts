/**
 * Next.js Public Environment Variables
 * These are safe to expose in the browser
 * Only variables prefixed with NEXT_PUBLIC_ are included
 */

export const publicEnv = {
  gaId: process.env.NEXT_PUBLIC_GA_ID,
  gaDebug: process.env.NEXT_PUBLIC_GA_DEBUG === 'true',
  siteUrl: process.env.SITE_URL,
  siteTitle: process.env.SITE_TITLE,
  siteDescription: process.env.SITE_DESCRIPTION,
  siteName: process.env.SITE_NAME,
};

export default publicEnv;
