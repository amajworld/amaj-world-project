
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import AdBanner from './AdBanner';
import type { Post } from '@/data/posts';
import { useState, useEffect } from 'react';
import { getDocuments } from '@/app/actions/firestoreActions';
import { Loader2 } from 'lucide-react';

export default function Sidebar() {
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const posts = await getDocuments<Post>('posts', {
          where: [['status', '==', 'published']],
          orderBy: ['date', 'desc'],
          limit: 4
        });
        setPopularPosts(posts);
      } catch (error) {
        console.error('Failed to load data from Firestore for sidebar', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const PopularPostsCard = () => (
      <Card>
        <CardHeader>
          <CardTitle>Popular Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : popularPosts.length > 0 ? (
            <div className="space-y-4">
              {popularPosts.map((post) => (
                <Link href={`/posts/${post.slug}`} key={post.slug} className="group flex items-start space-x-4">
                  <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-md">
                      <Image
                      src={post.imageUrl}
                      alt={post.title}
                      width={100}
                      height={100}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={post.dataAiHint}
                      />
                  </div>
                  <h4 className="flex-grow text-sm font-semibold leading-tight text-card-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {post.title}
                  </h4>
                </Link>
              ))}
            </div>
          ) : (
             <p className="text-sm text-muted-foreground text-center">No popular posts available yet.</p>
          )}
        </CardContent>
      </Card>
  );

  return (
    <div className="space-y-8 pt-8 lg:pt-0">
      <AdBanner
        adName="main-sidebar-ad"
        location="sidebar"
        className="flex justify-center items-center text-sm text-muted-foreground rounded-lg"
      />
      <PopularPostsCard />
    </div>
  );
}
