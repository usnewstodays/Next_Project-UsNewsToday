import type { SEOMetadata } from '../types';

export function generateSEOMetadata(metadata: SEOMetadata): SEOMetadata {
  return {
    title: metadata.title,
    description: metadata.description,
    image: metadata.image,
    url: metadata.url,
    type: metadata.type || 'website',
    author: metadata.author,
    publishedDate: metadata.publishedDate,
    modifiedDate: metadata.modifiedDate,
  };
}

export function generateJsonLd(metadata: SEOMetadata, siteTitle: string) {
  if (metadata.type === 'article') {
    return {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: metadata.title,
      description: metadata.description,
      image: metadata.image,
      datePublished: metadata.publishedDate,
      dateModified: metadata.modifiedDate,
      author: {
        '@type': 'Person',
        name: metadata.author,
      },
      publisher: {
        '@type': 'Organization',
        name: siteTitle,
      },
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteTitle,
    url: metadata.url,
    description: metadata.description,
  };
}

export function generateOpenGraphTags(metadata: SEOMetadata) {
  return {
    'og:title': metadata.title,
    'og:description': metadata.description,
    'og:image': metadata.image,
    'og:url': metadata.url,
    'og:type': metadata.type === 'article' ? 'article' : 'website',
  };
}

export function generateTwitterTags(metadata: SEOMetadata) {
  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': metadata.title,
    'twitter:description': metadata.description,
    'twitter:image': metadata.image,
  };
}
