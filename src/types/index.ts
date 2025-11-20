export interface WPGraphQLPost {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  modified: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
      mediaDetails?: {
        width: number;
        height: number;
      };
    };
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
  categories?: {
    nodes: Array<{
      id: string;
      name: string;
      slug: string;
      description: string;
    }>;
  };
  tags?: {
    nodes: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  };
}

export interface WPGraphQLCategory {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description: string;
  posts?: {
    nodes: WPGraphQLPost[];
    pageInfo?: {
      hasNextPage: boolean;
      endCursor: string;
    };
  };
}

export interface WPGraphQLAuthor {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description: string;
  avatar?: {
    url: string;
  };
  posts?: {
    nodes: WPGraphQLPost[];
  };
}

export interface WPGraphQLTag {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description: string;
  posts?: {
    nodes: WPGraphQLPost[];
  };
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SEOMetadata {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: 'website' | 'article';
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
}
