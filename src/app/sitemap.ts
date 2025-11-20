import { MetadataRoute } from 'next';
import { getAllPostsWithDates, getAllCategoriesSlugs } from '@/lib/api';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

function getBaseUrl() {
  // Use VERCEL_URL for Vercel deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Use NEXT_PUBLIC_SITE_URL if set
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  // Fallback to SITE_URL or localhost
  return process.env.SITE_URL || 'http://localhost:3000';
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  try {
    // Fetch all posts and categories
    const [posts, categories] = await Promise.all([
      getAllPostsWithDates(),
      getAllCategoriesSlugs(),
    ]);

    // Home page
    const homeEntry: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];

    // Category pages
    const categoryEntries: MetadataRoute.Sitemap = categories.map((slug: string) => ({
      url: `${baseUrl}/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    // Post pages
    const postEntries: MetadataRoute.Sitemap = posts.map((post: any) => {
      const categorySlug = post.categories?.nodes?.[0]?.slug || 'news';
      return {
        url: `${baseUrl}/${categorySlug}/${post.slug}`,
        lastModified: new Date(post.modified || post.date),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      };
    });

    return [...homeEntry, ...categoryEntries, ...postEntries];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}
