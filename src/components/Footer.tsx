'use client';

import Link from 'next/link';

export default function Footer() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Us News Today';
  const siteCopyright = process.env.NEXT_PUBLIC_SITE_COPYRIGHT || '© 2024 Us News Today. All rights reserved.';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 dark:bg-black text-neutral-200 dark:text-neutral-400 border-t border-neutral-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 font-serif font-bold text-lg text-white mb-4">
              <span className="text-2xl">📰</span>
              <span>{siteName}</span>
            </Link>
            <p className="text-sm text-neutral-400">
              Your trusted source for news and stories.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-primary-400 transition-colors">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="hover:text-primary-400 transition-colors">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-primary-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Subscribe */}
          <div>
            <h3 className="font-bold text-white mb-4">Stay Updated</h3>
            <p className="text-sm text-neutral-400 mb-3">
              Get the latest articles delivered to your inbox.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter email"
                className="flex-1 px-3 py-2 bg-neutral-800 dark:bg-gray-700 border border-neutral-700 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-800 dark:border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              {siteCopyright.replace('2024', currentYear.toString())}
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com" className="hover:text-primary-400 transition-colors" target="_blank" rel="noopener noreferrer">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 9 0 11-4.6a4.49 4.49 0 001-4.33 9.51 9.51 0 01-1 4.33" />
                </svg>
              </a>
              <a href="https://facebook.com" className="hover:text-primary-400 transition-colors" target="_blank" rel="noopener noreferrer">
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a6 6 0 00-6 6v3H7v4h2v8h4v-8h3l1-4h-4V8a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a href="https://instagram.com" className="hover:text-primary-400 transition-colors" target="_blank" rel="noopener noreferrer">
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 11.37A4 4 0 1112.63 8A4 4 0 0116 11.37z" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
