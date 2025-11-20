import { GraphQLClient } from 'graphql-request';
import { validateApiEndpoint } from './security';
import { isProduction } from './env-validation';

/**
 * Initialize GraphQL client with validated endpoint
 * Throws error if endpoint is not configured properly
 */
function initializeGraphQLClient(): GraphQLClient {
  // Check if we're in a server environment
  if (typeof window !== 'undefined') {
    // We're in the browser, return a dummy client
    // This shouldn't be called on the client side
    return new GraphQLClient('https://placeholder.local/graphql');
  }

  const endpoint = process.env.WPGRAPHQL_ENDPOINT;
  
  // Validate endpoint exists
  if (!endpoint || endpoint.trim() === '') {
    throw new Error(
      `❌ CRITICAL ERROR: WPGRAPHQL_ENDPOINT is not configured!\n\n` +
      `The application cannot start without a valid WordPress GraphQL endpoint.\n` +
      `Please set WPGRAPHQL_ENDPOINT as an environment variable.\n\n` +
      `For local development: Set in .env.local file\n` +
      `For Cloudflare Pages: Set in Cloudflare dashboard > Pages > Settings > Environment Variables\n\n` +
      `Example:\n` +
      `WPGRAPHQL_ENDPOINT=https://your-site.com/graphql\n`
    );
  }

  // Validate endpoint URL format
  if (!validateApiEndpoint(endpoint, isProduction())) {
    throw new Error(
      `❌ CRITICAL ERROR: Invalid WPGRAPHQL_ENDPOINT configuration!\n\n` +
      `Current endpoint: ${endpoint}\n\n` +
      `Requirements:\n` +
      `- Must be a valid HTTPS URL\n` +
      `- Cannot use localhost in production\n` +
      `- Must point to a valid WordPress GraphQL endpoint\n`
    );
  }

  // Create and return client
  const client = new GraphQLClient(endpoint, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return client;
}

// Initialize client at module load time
export const graphqlClient = initializeGraphQLClient();

// GraphQL Queries

export const GET_POSTS_QUERY = `
  query GetPosts($first: Int = 10, $after: String) {
    posts(first: $first, after: $after) {
      nodes {
        id
        databaseId
        title
        slug
        excerpt
        date
        modified
        featuredImage {
          node {
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
        author {
          node {
            id
            name
            slug
            avatar {
              url
            }
          }
        }
        categories(first: 3) {
          nodes {
            id
            name
            slug
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_POST_BY_SLUG_QUERY = `
  query GetPostBySlug($slug: String!) {
    postBy(slug: $slug) {
      id
      databaseId
      title
      slug
      content
      excerpt
      date
      modified
      featuredImage {
        node {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
      author {
        node {
          id
          name
          slug
          avatar {
            url
          }
        }
      }
      categories(first: 5) {
        nodes {
          id
          name
          slug
        }
      }
      tags(first: 10) {
        nodes {
          id
          name
          slug
        }
      }
    }
  }
`;

export const GET_POSTS_BY_CATEGORY_QUERY = `
  query GetPostsByCategory($slug: ID!, $first: Int = 10, $after: String) {
    category(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      posts(first: $first, after: $after) {
        nodes {
          id
          databaseId
          title
          slug
          excerpt
          date
          modified
          featuredImage {
            node {
              sourceUrl
              altText
              mediaDetails {
                width
                height
              }
            }
          }
          author {
            node {
              id
              name
              slug
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const GET_CATEGORIES_QUERY = `
  query GetCategories($first: Int = 20) {
    categories(first: $first) {
      nodes {
        id
        databaseId
        name
        slug
        description
        posts(first: 3) {
          nodes {
            id
            databaseId
            title
            slug
            excerpt
            date
            modified
            featuredImage {
              node {
                sourceUrl
                altText
                mediaDetails {
                  width
                  height
                }
              }
            }
            author {
              node {
                id
                name
                slug
                avatar {
                  url
                }
              }
            }
            categories(first: 3) {
              nodes {
                id
                name
                slug
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_AUTHOR_QUERY = `
  query GetAuthor($slug: String!) {
    userBy(slug: $slug) {
      id
      databaseId
      name
      slug
      description
      avatar {
        url
      }
      posts(first: 10) {
        nodes {
          id
          databaseId
          title
          slug
          excerpt
          date
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  }
`;

export const GET_TAG_QUERY = `
  query GetTag($slug: String!) {
    tag(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      posts(first: 10) {
        nodes {
          id
          databaseId
          title
          slug
          excerpt
          date
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  }
`;

export const GET_RELATED_POSTS_QUERY = `
  query GetRelatedPosts($categoryId: Int!, $excludeId: Int!, $first: Int = 3) {
    posts(first: $first, where: { categoryId: $categoryId }) {
      nodes {
        id
        databaseId
        title
        slug
        excerpt
        date
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;

export const SEARCH_POSTS_QUERY = `
  query SearchPosts($search: String!, $first: Int = 20) {
    posts(first: $first, where: { search: $search }) {
      nodes {
        id
        databaseId
        title
        slug
        excerpt
        date
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;

export const GET_ALL_POSTS_SLUGS_QUERY = `
  query GetAllPostsSlugs($first: Int = 100, $after: String) {
    posts(first: $first, after: $after) {
      nodes {
        slug
        date
        modified
        title
        categories(first: 1) {
          nodes {
            slug
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_ALL_CATEGORIES_SLUGS_QUERY = `
  query GetAllCategoriesSlugs($first: Int = 100) {
    categories(first: $first) {
      nodes {
        slug
      }
    }
  }
`;

export const GET_ALL_AUTHORS_SLUGS_QUERY = `
  query GetAllAuthorsSlugs($first: Int = 100) {
    users(first: $first) {
      nodes {
        slug
      }
    }
  }
`;

export const GET_ALL_TAGS_SLUGS_QUERY = `
  query GetAllTagsSlugs($first: Int = 100) {
    tags(first: $first) {
      nodes {
        slug
      }
    }
  }
`;
