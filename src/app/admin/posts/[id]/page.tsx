
'use server';

import { getDocument } from '@/app/actions/firestoreActions';
import type { Post } from '@/data/posts';
import PostEditor from './PostEditor';

// This function was causing build failures on Vercel and is not needed for a dynamic site.
// export async function generateStaticParams() { ... }

async function getPostData(id: string): Promise<Partial<Post> | null> {
    if (id === 'new') {
        return {
            id: 'new', // Pass 'new' as id to the editor
            title: '', content: '', imageUrl: '', category: '',
            slug: '', status: 'draft', seoTitle: '', seoDescription: '',
            tags: [], scheduledAt: undefined, views: 0, date: new Date().toISOString()
        };
    }
    const post = await getDocument<Post>('posts', id);
    if (post) {
      // Ensure date fields are ISO strings to prevent hydration mismatch
      return {
        ...post,
        date: post.date ? new Date(post.date).toISOString() : new Date().toISOString(),
        scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString() : undefined,
      };
    }
    return null;
}

export default async function PostEditorPage({ params }: { params: { id:string } }) {
  const postData = await getPostData(params.id);

  if (!postData) {
      return <div>Post not found!</div>
  }

  return <PostEditor initialPost={postData} />;
}
