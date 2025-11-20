'use client';

import Link from 'next/link';
import Image from 'next/image';
import { stripHtml, truncateText, calculateReadingTime } from '@/lib/api';

interface ArticleCardProps {
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

export default function ArticleCard({
  id,
  title,
  slug,
  excerpt,
  content,
  date,
  featuredImage,
  categories,
  author,
}: ArticleCardProps) {
  const imageUrl = featuredImage?.node.sourceUrl;
  const imageAlt = featuredImage?.node.altText || title;
  const categorySlug = categories?.nodes?.[0]?.slug;
  const categoryName = categories?.nodes?.[0]?.name;
  const readingTime = calculateReadingTime(content);
  const publishDate = new Date(date);
  const formattedDate = publishDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const articleExcerpt = stripHtml(excerpt || content);

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group">
      {/* Image */}
      {imageUrl && (
        <div className="relative h-48 overflow-hidden bg-neutral-200 dark:bg-gray-700">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {categoryName && (
          <div className="mb-2">
            <Link
              href={`/${categorySlug}`}
              className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100 text-xs font-bold rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
            >
              {categoryName}
            </Link>
          </div>
        )}

        {/* Title */}
        <Link
          href={`/${categorySlug || 'category'}/${slug}`}
          className="block group/title"
        >
          <h2 className="font-serif font-bold text-lg text-neutral-900 dark:text-white group-hover/title:text-primary-600 dark:group-hover/title:text-primary-400 transition-colors line-clamp-2">
            {title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-2">
          {truncateText(articleExcerpt, 100)}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-neutral-200 dark:border-gray-700">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              {author?.node && (
                <span>{author.node.name}</span>
              )}
              {author?.node && (
                <span className="text-neutral-400">•</span>
              )}
              <span>{formattedDate}</span>
              <span className="text-neutral-400">•</span>
              <span>{readingTime} min</span>
            </div>
          </div>

          {/* Read More Link */}
          <Link
            href={`/${categorySlug || 'category'}/${slug}`}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm transition-colors"
          >
            →
          </Link>
        </div>
      </div>
    </article>
  );
}
