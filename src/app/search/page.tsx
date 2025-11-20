'use client';

import { useState, useEffect } from 'react';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 12;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const totalPages = Math.ceil(results.length / resultsPerPage);
  const paginatedResults = results.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-gray-900">
      {/* Search Hero */}
      <section className="bg-neutral-900 dark:bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-serif font-bold mb-6">Search Articles</h1>
          <p className="text-xl text-neutral-300 mb-8">
            Find exactly what you&apos;re looking for
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="flex gap-3">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, keywords, or author..."
                className="flex-1 px-6 py-3 bg-neutral-800 dark:bg-gray-800 border border-neutral-700 dark:border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                autoFocus
              />
              <button
                type="submit"
                disabled={searching}
                className="px-8 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {query ? (
            <>
              <h2 className="text-2xl font-bold mb-8 text-neutral-900 dark:text-white">
                {searching
                  ? 'Searching...'
                  : results.length > 0
                    ? `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`
                    : `No results found for "${query}"`}
              </h2>

              {paginatedResults.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                    {paginatedResults.map((post: any) => (
                      <ArticleCard key={post.id} {...post} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      baseUrl="/search"
                    />
                  )}
                </>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                Enter a search term to find articles
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
