
'use client';

import { useEffect, useState } from 'react';
import type { Post } from '@/data/posts';
import { getDocuments } from '@/app/actions/firestoreActions';
import PostCard from './PostCard';

interface RelatedPostsProps {
  currentPostId: string;
  category: string;
}

export default function RelatedPosts({ currentPostId, category }: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      setLoading(true);
      try {
        const allPosts = await getDocuments<Post>('posts', {
          where: [['status', '==', 'published']],
        });
        
        const filtered = allPosts
          .filter(p => p.id !== currentPostId && p.category === category)
          .slice(0, 3);
          
        setRelatedPosts(filtered);
      } catch (error) {
        console.error("Failed to fetch related posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPosts();
  }, [currentPostId, category]);

  if (loading) {
    return <div>Loading related posts...</div>;
  }
  
  if(relatedPosts.length === 0) {
    return null; // Don't render anything if no related posts are found
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {relatedPosts.map(post => (
          <PostCard key={post.id} post={{...post, href: `/posts/${post.slug}`}} />
        ))}
      </div>
    </div>
  );
}
