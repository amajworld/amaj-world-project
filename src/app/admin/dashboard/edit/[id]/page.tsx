
import { getDocument } from '@/app/actions/firestoreActions';
import type { Post } from '@/types/posts';
import PostEditor from '../../PostEditor';
import { notFound } from 'next/navigation';

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await getDocument<Post>('posts', params.id);
  
  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Edit Post</h1>
      <PostEditor post={post} />
    </div>
  );
}
