import PostCard from '@/components/PostCard';
import postsData from '@/data/posts.json';
import type { Post } from '@/data/posts';

export default function Home() {
  const allPosts: Post[] = postsData.map(post => ({
    ...post,
    href: `/posts/${post.slug}`,
  }));

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Latest Posts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
