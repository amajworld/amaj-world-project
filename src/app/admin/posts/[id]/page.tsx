
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
            tags: [], scheduledAt: undefined, views: 0, date: '' // Using empty string to prevent hydration mismatch
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
