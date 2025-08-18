
import { Suspense } from 'react';
import PostCard from '@/components/PostCard';
import Pagination from '@/components/Pagination';
import type { Post } from '@/data/posts';
import { getPaginatedDocuments } from '@/app/actions/firestoreActions';
import { Loader2 } from 'lucide-react';

const POSTS_PER_PAGE = 18;

function PostsGridLoader() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: POSTS_PER_PAGE }).map((_, index) => (
                <div key={index} className="rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col">
                    <div className="relative bg-muted" style={{ paddingTop: '133.33%' }}></div>
                    <div className="p-6 space-y-4">
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

async function AllPostsGrid({ currentPage }: { currentPage: number }) {
  const { documents: posts, totalPages } = await getPaginatedDocuments<Post>('posts', {
    page: currentPage,
    limit: POSTS_PER_PAGE,
    where: [['status', '==', 'published']],
    orderBy: ['date', 'desc'],
  });

  return (
    <>
      {posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {posts.map((post) => (
              <PostCard key={post.slug} post={{ ...post, href: `/posts/${post.slug}` }} />
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold">No posts found.</h2>
          <p className="text-muted-foreground mt-2">Please check back later!</p>
        </div>
      )}
    </>
  );
}

export default function AllPostsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const currentPage = Number(searchParams?.['page'] || '1');
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">All Posts</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Browse through all our articles and find what you're looking for.
        </p>
      </div>
      
      <Suspense fallback={<PostsGridLoader />}>
        <AllPostsGrid currentPage={currentPage} />
      </Suspense>
    </div>
  );
}
