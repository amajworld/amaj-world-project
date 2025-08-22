
import React from 'react';
import PostCard from '@/components/PostCard';
import Sidebar from '@/components/Sidebar';
import Pagination from '@/components/Pagination';
import type { Post } from '@/data/posts';
import { getDocuments } from '@/app/actions/firestoreActions';
import AdBanner from '@/components/AdBanner';
import HeroSlider from '@/components/HeroSlider';
import { Suspense } from 'react';

const POSTS_PER_PAGE_INITIAL = 15;
const POSTS_PER_PAGE_SECONDARY = 18;

function PostsLoader({ count }: { count: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col">
                    <div className="relative bg-muted animate-pulse" style={{ paddingTop: '133.33%' }}></div>
                    <div className="p-6 space-y-4">
                        <div className="h-6 bg-muted rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

async function PostsGrid({ currentPage }: { currentPage: number }) {
    const allPublishedPosts = await getDocuments<Post>('posts', {
        where: [['status', '==', 'published']],
        orderBy: ['date', 'desc']
    });
    
    const initialPosts = allPublishedPosts.slice(0, POSTS_PER_PAGE_INITIAL);
    const remainingPosts = allPublishedPosts.slice(POSTS_PER_PAGE_INITIAL);
    const totalPages = Math.ceil(remainingPosts.length / POSTS_PER_PAGE_SECONDARY) + 1;

    // This logic handles pagination for pages after the first one
    const paginatedPosts = currentPage > 1 
        ? remainingPosts.slice(
            (currentPage - 2) * POSTS_PER_PAGE_SECONDARY,
            (currentPage - 1) * POSTS_PER_PAGE_SECONDARY
          )
        : [];

    const postsToShow = currentPage === 1 ? initialPosts : paginatedPosts;
    const noPostsFound = allPublishedPosts.length === 0;

    return (
      <>
        {noPostsFound ? (
           <div className="text-center py-16">
            <h2 className="text-2xl font-semibold">No posts found yet.</h2>
            <p className="text-muted-foreground mt-2">Please check back later!</p>
          </div>
        ) : (
          <>
            {postsToShow.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {postsToShow.map((post) => (
                    <PostCard key={post.id || post.slug} post={{...post, href:`/posts/${post.slug}`}} />
                ))}
              </div>
            )}
            
            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} />}
          </>
        )}
      </>
    );
}

export default function Home({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const currentPage = Number(searchParams?.['page'] || '1');

  return (
    <>
      <HeroSlider /> 
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdBanner adName="post-top-banner" location="top-banner" className="w-full flex justify-center" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
              <div>
                  <Suspense fallback={<PostsLoader count={POSTS_PER_PAGE_INITIAL} />}>
                      <PostsGrid currentPage={currentPage} />
                  </Suspense>
              </div>
          </div>

          <aside className="lg:col-span-1">
            <Sidebar />
          </aside>

        </div>
      </div>
    </>
  );
}
