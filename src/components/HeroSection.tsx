'use client';

import Link from 'next/link';
import Image from 'next/image';
import { stripHtml, truncateText, calculateReadingTime } from '@/lib/api';

interface WPGraphQLPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  date: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText?: string;
    };
  };
  categories?: {
    nodes: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  };
  author?: {
    node: {
      id: string;
      name: string;
      slug: string;
      avatar?: {
        url: string;
      };
    };
  };
}

interface HeroSectionProps {
  post: WPGraphQLPost;
}

export default function HeroSection({ post }: HeroSectionProps) {
  const excerpt = stripHtml(post.excerpt || post.content);
  const readingTime = calculateReadingTime(post.content);
  const publishDate = new Date(post.date);
  const formattedDate = publishDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const imageUrl = post.featuredImage?.node.sourceUrl;
  const imageAlt = post.featuredImage?.node.altText || post.title;
  const categorySlug = post.categories?.nodes?.[0]?.slug;
  const categoryName = post.categories?.nodes?.[0]?.name;

  return (
    <section className="relative h-96 md:h-screen flex items-center overflow-hidden bg-neutral-900 dark:bg-black">
      {/* Background Image with Parallax */}
      {imageUrl && (
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="w-full h-full object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent dark:from-black dark:via-black/50"></div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          {categoryName && (
            <div className="mb-4 animate-fade-in">
              <Link
                href={`/${categorySlug}`}
                className="inline-block px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-full transition-colors"
              >
                {categoryName}
              </Link>
            </div>
          )}

          <h1 className="font-serif font-bold text-4xl md:text-6xl text-white mb-6 leading-tight animate-slide-up">
            {post.title}
          </h1>

          <p className="text-lg md:text-xl text-neutral-200 mb-8 line-clamp-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {truncateText(excerpt, 200)}
          </p>

          {/* Meta */}
          <div
            className="flex flex-wrap items-center gap-6 text-neutral-300 text-sm md:text-base animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            {post.author?.node && (
              <div className="flex items-center gap-2">
                {post.author.node.avatar?.url && (
                  <div className="relative w-10 h-10">
                    <Image
                      src={post.author.node.avatar.url}
                      alt={post.author.node.name}
                      fill
                      className="rounded-full object-cover"
                      sizes="40px"
                    />
                  </div>
                )}
                <Link
                  href={`/author/${post.author.node.slug}`}
                  className="hover:text-primary-400 transition-colors font-medium"
                >
                  {post.author.node.name}
                </Link>
              </div>
            )}
            <span>{formattedDate}</span>
            <span className="text-neutral-400">•</span>
            <span>{readingTime} min read</span>
          </div>

          {/* CTA */}
          <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link
              href={`/${categorySlug || 'category'}/${post.slug}`}
              className="inline-block px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors"
            >
              Read Full Story
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          :global(.animate-fade-in),
          :global(.animate-slide-up) {
            animation: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </section>
  );
}
