import { graphqlClient, GET_POSTS_QUERY, GET_POST_BY_SLUG_QUERY, GET_POSTS_BY_CATEGORY_QUERY, GET_CATEGORIES_QUERY, GET_AUTHOR_QUERY, GET_TAG_QUERY, GET_RELATED_POSTS_QUERY, SEARCH_POSTS_QUERY, GET_ALL_POSTS_SLUGS_QUERY, GET_ALL_CATEGORIES_SLUGS_QUERY, GET_ALL_AUTHORS_SLUGS_QUERY, GET_ALL_TAGS_SLUGS_QUERY } from './graphql';
import type { WPGraphQLPost, WPGraphQLCategory, WPGraphQLAuthor, WPGraphQLTag } from '../types';

export async function getPosts(first: number = 10, after?: string) {
  try {
    const data: any = await graphqlClient.request(GET_POSTS_QUERY, { first, after });
    return data.posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } };
  }
}

export async function getPostBySlug(slug: string): Promise<WPGraphQLPost | null> {
  try {
    const data: any = await graphqlClient.request(GET_POST_BY_SLUG_QUERY, { slug });
    return data.postBy;
  } catch (error) {
    console.error(`Error fetching post with slug ${slug}:`, error);
    return null;
  }
}

export async function getPostsByCategory(slug: string, first: number = 10, after?: string) {
  try {
    const data: any = await graphqlClient.request(GET_POSTS_BY_CATEGORY_QUERY, { slug, first, after });
    return data.category;
  } catch (error) {
    console.error(`Error fetching posts for category ${slug}:`, error);
    return null;
  }
}

export async function getCategories(first: number = 20) {
  try {
    const data: any = await graphqlClient.request(GET_CATEGORIES_QUERY, { first });
    return data.categories.nodes;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getAuthor(slug: string): Promise<WPGraphQLAuthor | null> {
  try {
    const data: any = await graphqlClient.request(GET_AUTHOR_QUERY, { slug });
    return data.userBy;
  } catch (error) {
    console.error(`Error fetching author ${slug}:`, error);
    return null;
  }
}

export async function getTag(slug: string): Promise<WPGraphQLTag | null> {
  try {
    const data: any = await graphqlClient.request(GET_TAG_QUERY, { slug });
    return data.tag;
  } catch (error) {
    console.error(`Error fetching tag ${slug}:`, error);
    return null;
  }
}

export async function getRelatedPosts(categoryId: string, excludeId: string, first: number = 3) {
  try {
    // Convert IDs to integers if they're base64 encoded (from GraphQL)
    let catId: number;
    let postId: number;
    
    try {
      // Try to decode base64 and extract the ID number
      catId = parseInt(Buffer.from(categoryId, 'base64').toString().split(':')[1] || categoryId);
      postId = parseInt(Buffer.from(excludeId, 'base64').toString().split(':')[1] || excludeId);
    } catch {
      catId = parseInt(categoryId);
      postId = parseInt(excludeId);
    }
    
    const data: any = await graphqlClient.request(GET_RELATED_POSTS_QUERY, { categoryId: catId, excludeId: postId, first });
    // Filter out the current post manually since GraphQL doesn't support excludeIds
    return data.posts.nodes.filter((post: any) => post.id !== excludeId);
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

export async function searchPosts(search: string, first: number = 20) {
  try {
    const data: any = await graphqlClient.request(SEARCH_POSTS_QUERY, { search, first });
    return data.posts.nodes;
  } catch (error) {
    console.error(`Error searching posts for "${search}":`, error);
    return [];
  }
}

export async function getAllPostsSlugs() {
  try {
    const slugs: string[] = [];
    let hasNextPage = true;
    let after: string | null = null;

    while (hasNextPage) {
      const data: any = await graphqlClient.request(GET_ALL_POSTS_SLUGS_QUERY, { first: 100, after });
      slugs.push(...data.posts.nodes.map((post: any) => post.slug));
      hasNextPage = data.posts.pageInfo.hasNextPage;
      after = data.posts.pageInfo.endCursor;
    }

    return slugs;
  } catch (error) {
    console.error('Error fetching all post slugs:', error);
    return [];
  }
}

export async function getAllPostsWithDates() {
  try {
    const posts: any[] = [];
    let hasNextPage = true;
    let after: string | null = null;

    while (hasNextPage) {
      const data: any = await graphqlClient.request(GET_ALL_POSTS_SLUGS_QUERY, { first: 100, after });
      posts.push(...data.posts.nodes);
      hasNextPage = data.posts.pageInfo.hasNextPage;
      after = data.posts.pageInfo.endCursor;
    }

    return posts;
  } catch (error) {
    console.error('Error fetching all posts with dates:', error);
    return [];
  }
}

export async function getAllCategoriesSlugs() {
  try {
    const data: any = await graphqlClient.request(GET_ALL_CATEGORIES_SLUGS_QUERY, { first: 100 });
    return data.categories.nodes.map((cat: any) => cat.slug);
  } catch (error) {
    console.error('Error fetching all category slugs:', error);
    return [];
  }
}

export async function getAllAuthorsSlugs() {
  try {
    const data: any = await graphqlClient.request(GET_ALL_AUTHORS_SLUGS_QUERY, { first: 100 });
    return data.users.nodes.map((user: any) => user.slug);
  } catch (error) {
    console.error('Error fetching all author slugs:', error);
    return [];
  }
}

export async function getAllTagsSlugs() {
  try {
    const data: any = await graphqlClient.request(GET_ALL_TAGS_SLUGS_QUERY, { first: 100 });
    return data.tags.nodes.map((tag: any) => tag.slug);
  } catch (error) {
    console.error('Error fetching all tag slugs:', error);
    return [];
  }
}

export function calculateReadingTime(content: string | undefined): number {
  if (!content) return 1;
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export function stripHtml(html: string | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}

export function truncateText(text: string | undefined, length: number = 160): string {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
}
