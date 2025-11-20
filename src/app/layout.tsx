import type { Metadata } from 'next';
import { validateEnvVarsOrThrow } from '@/lib/env-validation';
import '@/styles/global.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Validate environment variables at build/startup time
if (typeof window === 'undefined') {
  validateEnvVarsOrThrow(process.env as Record<string, string | undefined>);
}

const siteTitle = process.env.SITE_TITLE || 'Headless CMS';
const siteDescription = process.env.SITE_DESCRIPTION || 'A modern headless CMS built with Next.js and WordPress GraphQL';

export const metadata: Metadata = {
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  generator: 'Next.js',
  applicationName: process.env.SITE_NAME || 'Headless CMS',
  keywords: ['news', 'breaking news', 'latest news', 'today', 'headlines', 'blog', 'content'],
  authors: [{ name: process.env.SITE_NAME || 'Author' }],
  creator: process.env.SITE_NAME || 'Author',
  publisher: process.env.SITE_NAME || 'Publisher',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: process.env.SITE_URL || 'http://localhost:3000',
    type: 'website',
    siteName: process.env.SITE_NAME || 'Headless CMS',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Organization schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: process.env.SITE_NAME || 'News Site',
    description: siteDescription,
    url: process.env.SITE_URL || 'http://localhost:3000',
    logo: `${process.env.SITE_URL || 'http://localhost:3000'}/logo.png`,
    sameAs: [
      'https://www.facebook.com/yourpage',
      'https://www.twitter.com/yourpage',
      'https://www.linkedin.com/company/yourpage',
    ],
  };

  return (
    <html lang="en">
      <head>
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
      </head>
      <body className="min-h-screen flex flex-col">
        {/* Header Navigation */}
        <Header />

        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
