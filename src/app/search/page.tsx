
import { Suspense } from 'react';
import PostCard from '@/components/PostCard';
import type { Post } from '@/data/posts';
import { getDocuments } from '@/app/actions/firestoreActions';
import { Loader2 } from 'lucide-react';

function SearchLoader() {
    return (
        <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Searching for posts...</p>
        </div>
    );
}

async function SearchResults({ query }: { query: string }) {
  const allPosts = await getDocuments<Post>('posts', {
    where: [['status', '==', 'published']],
  });

  const filteredPosts = allPosts.filter(post => 
    post.title.toLowerCase().includes(query.toLowerCase()) ||
    (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))) ||
    post.content.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.slug} post={{ ...post, href: `/posts/${post.slug}` }} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold">No posts found for "{query}"</h2>
          <p className="text-muted-foreground mt-2">Try searching for something else.</p>
        </div>
      )}
    </>
  );
}

export default function SearchPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const query = searchParams?.q as string || '';
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Search Results</h1>
        {query && (
            <p className="mt-4 text-xl text-muted-foreground">
                Showing results for: <span className="text-primary font-semibold">"{query}"</span>
            </p>
        )}
      </div>
      
      <Suspense fallback={<SearchLoader />}>
        {query ? <SearchResults query={query} /> : (
            <div className="text-center py-16">
                <h2 className="text-2xl font-semibold">Please enter a search term</h2>
                <p className="text-muted-foreground mt-2">Use the search bar above to find posts.</p>
            </div>
        )}
      </Suspense>
    </div>
  );
}
