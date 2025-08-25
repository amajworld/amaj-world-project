
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getDocuments } from '@/app/actions/firestoreActions';
import type { Post } from '@/types/posts';
import PostsDataTable from './PostsDataTable';

export default async function AdminDashboard() {
  const posts = await getDocuments<Post>('posts', { orderBy: ['date', 'desc'] });

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button asChild>
          <Link href="/admin/dashboard/new">Create New Post</Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
         <PostsDataTable posts={posts} />
      </div>
    </div>
  );
}
