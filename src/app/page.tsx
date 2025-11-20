import { getPosts } from '@/lib/api';
import HeroSection from '@/components/HeroSection';
import ArticleCard from '@/components/ArticleCard';

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const postsData = await getPosts(12);
  const posts = postsData?.nodes || [];
  const featuredPost = posts[0];

  return (
    <>
      {/* Featured Article Hero */}
      {featuredPost && <HeroSection post={featuredPost} />}

      {/* Recent Posts Grid */}
      <section className="py-20 bg-neutral-50 dark:bg-gray-900">
        <div className="container-main">
          <h2 className="text-4xl font-bold mb-12 text-neutral-900 dark:text-white">Latest Posts</h2>

          {posts && posts.length > 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.slice(1).map((post: any) => (
                <ArticleCard key={post.id} {...post} />
              ))}
            </div>
          ) : (
            <p className="text-neutral-600 dark:text-neutral-400 text-center py-12">No posts available yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
