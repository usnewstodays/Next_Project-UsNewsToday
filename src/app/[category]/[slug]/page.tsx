import { getPosts, getPostBySlug } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { stripHtml, calculateReadingTime } from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';
import CopyLinkButton from '@/components/CopyLinkButton';
import type { Metadata } from 'next';

interface ArticlePageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug, category } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: 'Article not found' };
  }

  const description = stripHtml(post.excerpt || post.content).substring(0, 160);
  const imageUrl = post.featuredImage?.node?.sourceUrl;
  const imageAlt = post.featuredImage?.node?.altText || post.title;
  const imageWidth = post.featuredImage?.node?.mediaDetails?.width || 1200;
  const imageHeight = post.featuredImage?.node?.mediaDetails?.height || 630;
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  const postUrl = `${siteUrl}/${category}/${slug}`;
  const publishDate = new Date(post.date).toISOString();
  const modifiedDate = new Date(post.modified || post.date).toISOString();

  return {
    title: post.title,
    description,
    keywords: post.categories?.nodes?.map((cat: any) => cat.name) || [],
    authors: post.author?.node ? [{ name: post.author.node.name }] : [],
    openGraph: {
      title: post.title,
      description,
      url: postUrl,
      type: 'article',
      publishedTime: publishDate,
      modifiedTime: modifiedDate,
      authors: post.author?.node?.name ? [post.author.node.name] : [],
      tags: post.categories?.nodes?.map((cat: any) => cat.name) || [],
      images: imageUrl ? [
        {
          url: imageUrl,
          width: imageWidth,
          height: imageHeight,
          alt: imageAlt,
          type: 'image/jpeg',
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { category, slug } = await params;
  const post = await getPostBySlug(slug);
  const allPosts = await getPosts(100);
  const relatedPosts = allPosts?.nodes?.slice(0, 3) || [];

  if (!post) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">Article not found</h1>
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const readingTime = calculateReadingTime(post.content);
  const publishDate = new Date(post.date);
  const formattedDate = publishDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const imageUrl = post.featuredImage?.node?.sourceUrl;
  const categorySlug = post.categories?.nodes?.[0]?.slug;
  const categoryName = post.categories?.nodes?.[0]?.name;
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  const postUrl = `${siteUrl}/${categorySlug}/${slug}`;

  // Generate JSON-LD structured data for NewsArticle
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: stripHtml(post.excerpt || post.content).substring(0, 160),
    image: imageUrl ? [imageUrl] : [],
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.modified || post.date).toISOString(),
    author: post.author?.node ? {
      '@type': 'Person',
      name: post.author.node.name,
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: process.env.SITE_NAME || 'News Site',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    articleSection: categoryName || 'News',
    keywords: post.categories?.nodes?.map((cat: any) => cat.name).join(', ') || 'news',
  };

  return (
    <article className="min-h-screen bg-white dark:bg-gray-900">
      {/* Article Header */}
      <div className="bg-neutral-900 dark:bg-black text-white py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Link href="/" className="text-primary-400 hover:text-primary-300 text-sm font-medium mb-6 inline-block transition-colors">
            ← Back to Home
          </Link>

          {/* Category Badge */}
          {categoryName && (
            <div className="mb-4">
              <Link
                href={`/${categorySlug}`}
                className="inline-block px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-full transition-colors"
              >
                {categoryName}
              </Link>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight text-white">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-neutral-300 text-sm md:text-base">
            {post.author?.node && (
              <div className="flex items-center gap-3">
                {post.author.node.avatar?.url && (
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={post.author.node.avatar.url}
                      alt={post.author.node.name}
                      fill
                      className="rounded-full object-cover"
                      sizes="48px"
                    />
                  </div>
                )}
                <div>
                  <p className="font-medium text-white">{post.author.node.name}</p>
                  <p className="text-xs text-neutral-400">Author</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-4 text-neutral-400">
              <span>{formattedDate}</span>
              <span>•</span>
              <span>{readingTime} min read</span>
            </div>
          </div>
        </div>
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Article Content - Three Column Layout */}
      <div className="bg-white dark:bg-gray-900 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Main Content - Left Column (8 cols) */}
            <div className="lg:col-span-8">
              {/* Article Body */}
              <div className="prose dark:prose-invert prose-lg max-w-none mb-12">
                {post.content ? (
                  <div
                    className="text-neutral-800 dark:text-neutral-200 leading-relaxed space-y-6"
                    dangerouslySetInnerHTML={{
                      __html: String(post.content)
                        .replace(/<p>/g, '<p class="text-lg leading-8 text-neutral-700 dark:text-neutral-300">')
                        .replace(/<h2>/g, '<h2 class="text-3xl md:text-4xl font-serif font-bold mt-12 mb-6 text-neutral-900 dark:text-white">')
                        .replace(/<h3>/g, '<h3 class="text-2xl md:text-3xl font-serif font-bold mt-10 mb-4 text-neutral-900 dark:text-white">')
                        .replace(/<strong>/g, '<strong class="font-bold text-neutral-900 dark:text-white">')
                        .replace(/<em>/g, '<em class="italic text-neutral-700 dark:text-neutral-300">')
                        .replace(/<a /g, '<a class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline font-medium transition-colors" '),
                    }}
                  />
                ) : (
                  <p className="text-neutral-600 dark:text-neutral-400 text-center py-12">Content not available.</p>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-neutral-200 dark:border-gray-700 my-12"></div>

              {/* Author Bio */}
              {post.author?.node && (
                <div className="bg-neutral-50 dark:bg-gray-800 rounded-lg p-6 md:p-8 mb-12">
                  <div className="flex gap-6">
                    {post.author.node.avatar?.url && (
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={post.author.node.avatar.url}
                          alt={post.author.node.name}
                          fill
                          className="rounded-full object-cover"
                          sizes="80px"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                        {post.author.node.name}
                      </h3>
                      <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-3">Author</p>
                      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        Author and contributor bringing you the latest news and insights.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Share Section - Full Width Below Content */}
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8 border border-primary-100 dark:border-gray-600">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white mb-4 uppercase tracking-wide">Share this article</p>
                    <div className="flex gap-3 flex-wrap">
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${process.env.SITE_URL}/${categorySlug}/${post.slug}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-800 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 text-primary-600 dark:text-primary-400 transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Share on Twitter"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 9 0 11-4.6a4.49 4.49 0 001-4.33 9.51 9.51 0 01-1 4.33" />
                        </svg>
                      </a>
                      <a
                        href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${process.env.SITE_URL}/${categorySlug}/${post.slug}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-800 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 text-primary-600 dark:text-primary-400 transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Share on Facebook"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 2h-3a6 6 0 00-6 6v3H7v4h2v8h4v-8h3l1-4h-4V8a1 1 0 011-1h3z" />
                        </svg>
                      </a>
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${process.env.SITE_URL}/${categorySlug}/${post.slug}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-800 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 text-primary-600 dark:text-primary-400 transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Share on LinkedIn"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" />
                        </svg>
                      </a>
                      <a
                        href={`https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(`${process.env.SITE_URL}/${categorySlug}/${post.slug}`)}&description=${encodeURIComponent(post.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-800 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 text-primary-600 dark:text-primary-400 transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Share on Pinterest"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  {/* Copy Link Button */}
                  <CopyLinkButton url={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/${categorySlug}/${slug}`} />
                </div>
              </div>
            </div>

            {/* Sidebar - Right Column (4 cols) */}
            <aside className="lg:col-span-4">
              {/* Sticky Sidebar */}
              <div className="sticky top-20 space-y-8">
                {/* Table of Contents / Quick Links */}
                <div className="bg-neutral-50 dark:bg-gray-800 rounded-lg p-6 border border-neutral-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Quick Navigation
                  </h3>
                  <nav className="space-y-2">
                    <Link href="/" className="block text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors">
                      ← Back to Home
                    </Link>
                    {categoryName && (
                      <Link href={`/${categorySlug}`} className="block text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors">
                        View {categoryName}
                      </Link>
                    )}
                  </nav>
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <div className="bg-neutral-50 dark:bg-gray-800 rounded-lg p-6 border border-neutral-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Related Posts
                    </h3>
                    <div className="space-y-4">
                      {relatedPosts
                        .filter((p: any) => p.slug !== post.slug)
                        .slice(0, 3)
                        .map((relatedPost: any) => {
                          const relCategorySlug = relatedPost.categories?.nodes?.[0]?.slug;
                          const relTitle = relatedPost.title;
                          const relDate = new Date(relatedPost.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          });
                          return (
                            <Link
                              key={relatedPost.id}
                              href={`/${relCategorySlug}/${relatedPost.slug}`}
                              className="block group p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                            >
                              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-2">
                                {relTitle}
                              </h4>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {relDate}
                              </p>
                            </Link>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Article Info Card */}
                <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 border border-primary-100 dark:border-gray-600">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4 uppercase tracking-wide">Article Info</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-neutral-600 dark:text-neutral-400 mb-1">Published</p>
                      <p className="font-semibold text-neutral-900 dark:text-white">{formattedDate}</p>
                    </div>
                    <div>
                      <p className="text-neutral-600 dark:text-neutral-400 mb-1">Reading Time</p>
                      <p className="font-semibold text-neutral-900 dark:text-white">{readingTime} min read</p>
                    </div>
                    {categoryName && (
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-1">Category</p>
                        <Link href={`/${categorySlug}`} className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                          {categoryName}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="py-16 md:py-24 bg-neutral-50 dark:bg-gray-800 border-t border-neutral-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-neutral-900 dark:text-white mb-2">
                Related Articles
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Explore more stories from our archive
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts
                .filter((p: any) => p.slug !== post.slug)
                .slice(0, 3)
                .map((relatedPost: any) => (
                  <ArticleCard key={relatedPost.id} {...relatedPost} />
                ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
