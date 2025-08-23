
import Link from 'next/link';
import { getPaginatedDocuments } from '@/app/actions/firestoreActions';
import type { Post } from '@/data/posts';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import PostList from './_components/PostList';
import PaginationControls from '@/components/PaginationControls';

export const revalidate = 0; // Revalidate this page on every request

// Helper to safely convert Firestore Timestamps or other date formats to ISO strings
const toISOStringSafe = (date: any): string | null => {
    if (!date) return null;
    if (typeof date === 'string') return date;
    if (date instanceof Date) return date.toISOString();
    if (typeof date.toDate === 'function') return date.toDate().toISOString();
    return null;
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
  const limit = typeof searchParams.limit === 'string' ? Number(searchParams.limit) : 10;

  const { documents, totalPages, totalDocs } = await getPaginatedDocuments<Post>('posts', {
    page,
    limit,
    orderBy: ['date', 'desc'],
  });

  // Convert dates to ISO strings on the server before passing to the client component
  const posts = documents.map(post => ({
    ...post,
    date: toISOStringSafe(post.date),
  }));


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold">Posts</h1>
            <p className="text-muted-foreground">Manage your blog posts here.</p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/new">Create New Post</Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
          <CardDescription>
             A list of all posts in your blog. Total: {totalDocs} posts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PostList posts={posts} />
        </CardContent>
      </Card>
      {totalPages > 1 && (
         <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            baseUrl="/admin/posts"
        />
      )}
    </div>
  );
}
