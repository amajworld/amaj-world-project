
'use client';

import PostCard from '@/components/PostCard';
import Pagination from '@/components/Pagination';
import type { Post } from '@/data/posts';
import React from 'react';

export default function CategoryView({
    initialPosts,
    topPosts,
    paginatedPosts,
    currentPage,
    totalPages
}: {
    initialPosts: Post[],
    topPosts: Post[],
    paginatedPosts: Post[],
    currentPage: number,
    totalPages: number
}) {
    const noPostsFound = initialPosts.length === 0 && topPosts.length === 0 && paginatedPosts.length === 0;

  return (
    <>
      {noPostsFound ? (
         <div className="text-center py-16">
          <h2 className="text-2xl font-semibold">No posts found in this category yet.</h2>
          <p className="text-muted-foreground mt-2">Please check back later!</p>
        </div>
      ) : (
        <>
          {currentPage === 1 && (
            <>
              {initialPosts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {initialPosts.map((post) => (
                      <PostCard key={post.slug} post={{...post, href: `/posts/${post.slug}`}} />
                  ))}
                </div>
              )}
              {topPosts.length > 0 && (
                <div className="mt-16">
                  <h2 className="text-3xl font-bold mb-8 text-center">Top Posts in this Category</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {topPosts.map((post) => (
                          <PostCard key={post.slug} post={{...post, href: `/posts/${post.slug}`}} />
                      ))}
                  </div>
                </div>
              )}
            </>
          )}

          {currentPage > 1 && paginatedPosts.length > 0 && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedPosts.map((post) => (
                    <PostCard key={post.slug} post={{...post, href: `/posts/${post.slug}`}} />
                ))}
            </div>
          )}

          {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} />}
        </>
      )}
    </>
  );
}
