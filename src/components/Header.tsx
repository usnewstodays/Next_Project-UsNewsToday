'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Header() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Us News Today';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch categories from API route instead of directly using graphql client
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const cats = await response.json();
        setCategories(cats);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const closeSearch = () => {
    setSearchModalOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b border-neutral-200 shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Unified Navigation Bar */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 font-serif font-bold text-xl md:text-2xl text-primary-600 hover:text-primary-700 flex-shrink-0 dark:text-primary-400 dark:hover:text-primary-300"
            >
              <span className="text-2xl md:text-3xl">📰</span>
              <span className="hidden sm:inline">{siteName}</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 mx-6">
              <Link
                href="/"
                className="px-4 py-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white font-medium transition-colors whitespace-nowrap rounded-lg hover:bg-neutral-50 dark:hover:bg-gray-800"
              >
                Home
              </Link>
              <Link
                href="/search"
                className="px-4 py-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white font-medium transition-colors whitespace-nowrap rounded-lg hover:bg-neutral-50 dark:hover:bg-gray-800"
              >
                Search
              </Link>

              {categories.length > 0 && (
                <>
                  {categories.slice(0, 4).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/${cat.slug}`}
                      className="px-4 py-2 text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 font-medium transition-colors whitespace-nowrap rounded-lg hover:bg-primary-50 dark:hover:bg-gray-800"
                    >
                      {cat.name}
                    </Link>
                  ))}

                  {categories.length > 4 && (
                    <div className="relative group px-2">
                      <button className="px-4 py-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white font-medium transition-colors rounded-lg hover:bg-neutral-50 dark:hover:bg-gray-800 flex items-center gap-1">
                        More
                        <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </button>

                      <div className="absolute left-0 mt-0 w-48 bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                        {categories.slice(4).map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/${cat.slug}`}
                            className="block px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </nav>

            {/* Search and Mobile Menu Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchModalOpen(true)}
                className="p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Open search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tablet Navigation (md:flex) - Horizontal scrollable category list */}
          <nav className="hidden md:flex lg:hidden items-center gap-2 pb-3 overflow-x-auto">
            <Link
              href="/"
              className="px-3 py-1 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap rounded-lg hover:bg-neutral-50 dark:hover:bg-gray-800"
            >
              Home
            </Link>
            <Link
              href="/search"
              className="px-3 py-1 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap rounded-lg hover:bg-neutral-50 dark:hover:bg-gray-800"
            >
              Search
            </Link>

            {categories.length > 0 && (
              <>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/${cat.slug}`}
                    className="px-3 py-1 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors whitespace-nowrap rounded-full hover:bg-primary-50 dark:hover:bg-gray-800"
                  >
                    {cat.name}
                  </Link>
                ))}
              </>
            )}
          </nav>
        </div>

        {/* Mobile Menu (sm and below) */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="lg:hidden border-t border-neutral-200 dark:border-gray-800 bg-white dark:bg-gray-900 max-h-96 overflow-y-auto"
          >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-2">
              <Link
                href="/"
                className="block px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/search"
                className="block px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Search
              </Link>

              {categories.length > 0 && (
                <>
                  <div className="px-4 py-2 text-sm font-bold text-neutral-900 dark:text-white mt-4 mb-2">
                    Categories
                  </div>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/${cat.slug}`}
                      className="block px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </div>
        )}

        {/* Search modal */}
        {searchModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            role="dialog"
            aria-labelledby="search-title"
            onClick={() => closeSearch()}
          >
            <div className="flex items-start justify-center pt-20 px-4" onClick={(e) => e.stopPropagation()}>
              <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl animate-slide-down">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 id="search-title" className="text-xl font-serif font-bold dark:text-white">
                      Search Articles
                    </h2>
                    <button
                      onClick={closeSearch}
                      className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-gray-700"
                      aria-label="Close search"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search articles..."
                      className="flex-1 px-4 py-2 border border-neutral-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      autoComplete="off"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={searching}
                      className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                    >
                      {searching ? 'Searching...' : 'Search'}
                    </button>
                  </form>

                  <div className="mt-4 max-h-96 overflow-y-auto">
                    {searchResults.length === 0 && searchQuery && !searching && (
                      <p className="text-neutral-600 dark:text-neutral-400 py-4">No articles found.</p>
                    )}
                    {searchResults.map((post: any) => (
                      <Link
                        key={post.id}
                        href={`/${post.categories?.nodes?.[0]?.slug || 'category'}/${post.slug}`}
                        className="block p-3 hover:bg-neutral-50 dark:hover:bg-gray-700 rounded-lg transition-colors border-b border-neutral-200 dark:border-gray-700 last:border-b-0"
                        onClick={() => closeSearch()}
                      >
                        <h3 className="font-serif font-bold text-neutral-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                          {post.title}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          {post.excerpt?.substring(0, 100)}...
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
