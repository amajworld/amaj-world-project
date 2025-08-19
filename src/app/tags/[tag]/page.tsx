import PostCard from '@/components/PostCard';
import type { Post } from '@/data/posts';
import { getDocuments } from '@/app/actions/firestoreActions';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { tag: string } }): Promise<Metadata> {
  const tagName = decodeURIComponent(params.tag);
  return {
    title: `Posts tagged with #${tagName} - Amaj Worlds`,
    description: `Browse all posts tagged with "${tagName}" on Amaj Worlds.`,
  };
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  const tagName = decodeURIComponent(params.tag);
  
  if (!tagName) {
    notFound();
  }

  const allPosts = await getDocuments<Post>('posts', {
    where: [['status', '==', 'published']],
  });

  const filteredPosts = allPosts.filter(post => 
    post.tags && post.tags.map(t => t.toLowerCase()).includes(tagName.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Tagged: <span className="text-indigo-600">#{tagName}</span>
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Showing {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} with this tag.
        </p>
      </div>
      
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.slug} post={{ ...post, href: `/posts/${post.slug}` }} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold">No posts found for this tag.</h2>
          <p className="text-muted-foreground mt-2">Try searching for something else or browse other categories.</p>
        </div>
      )}
    </div>
  );
}
