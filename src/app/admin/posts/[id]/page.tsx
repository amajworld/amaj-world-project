
'use server';

import { getDocument, getDocuments } from '@/app/actions/firestoreActions';
import type { Post } from '@/data/posts';
import PostEditor from './PostEditor';

// This function tells Next.js which post IDs to pre-render at build time
export async function generateStaticParams() {
  const posts = await getDocuments<Post>('posts');
  const paths = posts.map((post) => ({
    id: post.id,
  }));

  // Also include the 'new' path for creating a new post
  return [...paths, { id: 'new' }];
}

async function getPostData(id: string): Promise<Partial<Post> | null> {
    if (id === 'new') {
        return {
            id: 'new', // Pass 'new' as id to the editor
            title: '', content: '', imageUrl: '', category: '',
            slug: '', status: 'draft', seoTitle: '', seoDescription: '',
            tags: [], scheduledAt: undefined, views: 0, date: new Date().toISOString()
        };
    }
    return await getDocument<Post>('posts', id);
}

export default async function PostEditorPage({ params }: { params: { id:string } }) {
  const postData = await getPostData(params.id);

  if (!postData) {
      return <div>Post not found!</div>
  }

  return <PostEditor initialPost={postData} />;
}
