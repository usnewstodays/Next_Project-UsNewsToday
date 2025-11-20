import { getPosts } from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import Link from 'next/link';

export const runtime = 'edge';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryName = category.replace('-', ' ');
  return {
    title: `${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Articles`,
    description: `Read articles about ${categoryName.toLowerCase()}`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category } = await params;
  const { page } = await searchParams;
  const currentPage = parseInt(page || '1', 10);
  const postsPerPage = 12;

  // Fetch posts for category
  const allPosts = await getPosts(100);
  const categoryPosts =
    allPosts?.nodes?.filter(
      (post: any) =>
        post.categories?.nodes?.some(
          (cat: any) => cat.slug === category
        )
    ) || [];

  const totalPages = Math.ceil(categoryPosts.length / postsPerPage);
  const paginatedPosts = categoryPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const categoryName = category.replace('-', ' ').toUpperCase();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-gray-900">
      {/* Category Header */}
      <section className="bg-neutral-900 dark:bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-primary-400 hover:text-primary-300 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-serif font-bold mb-4">{categoryName}</h1>
          <p className="text-xl text-neutral-300">
            {categoryPosts.length} article{categoryPosts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {paginatedPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedPosts.map((post: any) => (
                  <ArticleCard key={post.id} {...post} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  baseUrl={`/${category}`}
                />
              )}
            </>
          ) : (
            <p className="text-center text-neutral-600 dark:text-neutral-400 py-20">
              No articles found in this category.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
