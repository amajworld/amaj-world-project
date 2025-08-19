import type { Post } from '@/data/posts';
import PostCard from './PostCard';

interface RelatedPostsProps {
  posts: Post[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  return (
    <div className="mt-16">
      <h2 className="text-3xl font-extrabold tracking-tight text-primary mb-8">
        Related Posts
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={{ ...post, href: `/posts/${post.slug}` }} />
        ))}
      </div>
    </div>
  );
}
