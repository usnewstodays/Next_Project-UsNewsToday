import { getPosts } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const posts = await getPosts(100);
    const searchQuery = query.toLowerCase();

    const results = posts?.nodes?.filter((post: any) => {
      const title = post.title?.toLowerCase() || '';
      const content = post.content?.toLowerCase() || '';
      const excerpt = post.excerpt?.toLowerCase() || '';
      const authorName = post.author?.node?.name?.toLowerCase() || '';

      return (
        title.includes(searchQuery) ||
        content.includes(searchQuery) ||
        excerpt.includes(searchQuery) ||
        authorName.includes(searchQuery)
      );
    }) || [];

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
