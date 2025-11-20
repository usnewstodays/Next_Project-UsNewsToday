import { getPosts } from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';
import Link from 'next/link';
import Image from 'next/image';

export const runtime = 'edge';

interface AuthorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const allPosts = await getPosts(100);
  const authorPosts = allPosts?.nodes?.filter(
    (post: any) => post.author?.node?.slug === slug
  ) || [];

  const author = authorPosts[0]?.author?.node;

  if (!author) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">Author not found</h1>
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-gray-900">
      {/* Author Header */}
      <section className="bg-neutral-900 dark:bg-black text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link href="/" className="text-primary-400 hover:text-primary-300 mb-4 inline-block">
            ← Back to Home
          </Link>

          {author.avatar?.url && (
            <div className="relative w-32 h-32 mx-auto mb-6">
              <Image
                src={author.avatar.url}
                alt={author.name}
                fill
                className="rounded-full object-cover"
                sizes="128px"
              />
            </div>
          )}

          <h1 className="text-5xl font-serif font-bold mb-4">{author.name}</h1>
          <p className="text-xl text-neutral-300 mb-4">
            {authorPosts.length} article{authorPosts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {authorPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {authorPosts.map((post: any) => (
                <ArticleCard key={post.id} {...post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-neutral-600 dark:text-neutral-400 py-20">
              No articles found from this author.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
