'use client';

import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showPrevious = currentPage > 1;
  const showNext = currentPage < totalPages;

  return (
    <nav className="flex justify-center gap-2 my-8">
      {showPrevious && (
        <Link
          href={`${baseUrl}?page=${currentPage - 1}`}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
        >
          ← Previous
        </Link>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={`${baseUrl}?page=${page}`}
          className={`px-3 py-2 rounded-lg font-medium transition-colors ${
            page === currentPage
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-200 dark:bg-gray-800 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-gray-700'
          }`}
        >
          {page}
        </Link>
      ))}

      {showNext && (
        <Link
          href={`${baseUrl}?page=${currentPage + 1}`}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
        >
          Next →
        </Link>
      )}
    </nav>
  );
}
