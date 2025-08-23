
'use client';

import type { Post } from '@/data/posts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { deleteDocument } from '@/app/actions/firestoreActions';
import { revalidatePostPaths } from '@/app/actions/revalidateActions';
import { useRouter } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';
import { useState, useEffect } from 'react';


// Helper function to safely convert date
const toDate = (date: any): Date | null => {
    if (!date) return null;
    if (date instanceof Date) return date;
    if (typeof date === 'object' && date !== null && typeof date.toDate === 'function') {
        return date.toDate();
    }
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
    }
    return null;
}

// Client-side component to prevent hydration mismatch for dates
const ClientDate = ({ date }: { date: any }) => {
    const [displayDate, setDisplayDate] = useState<string | null>(null);

    useEffect(() => {
        const dateObj = toDate(date);
        setDisplayDate(dateObj ? format(dateObj, 'MMMM d, yyyy') : 'No date');
    }, [date]);

    // Render a placeholder on the server and initial client render
    if (displayDate === null) {
        return <>...</>;
    }

    return <>{displayDate}</>;
};


export default function PostList({ posts }: { posts: Post[] }) {
    const router = useRouter();

    const handleDelete = async (post: Post) => {
        if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
            try {
                await deleteDocument('posts', post.id);
                await revalidatePostPaths(post.slug, post.category);
                router.refresh();
            } catch (error) {
                console.error("Failed to delete post:", error);
                alert("Could not delete post. See console for details.");
            }
        }
    };
    
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="hidden md:table-cell">Date</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => {
          return (
            <TableRow key={post.id}>
                <TableCell className="hidden sm:table-cell">
                <Image
                    alt={post.title}
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={post.imageUrl || '/placeholder.svg'}
                    width="64"
                />
                </TableCell>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>
                <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                    {post.status}
                </Badge>
                </TableCell>
                <TableCell>
                    {post.category?.split('/').filter(Boolean).pop()?.replace(/-/g, ' ')}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                    <ClientDate date={post.date} />
                </TableCell>
                <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/posts/${post.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4"/> Edit
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(post)}>
                        <Trash2 className="mr-2 h-4 w-4 text-destructive"/> Delete
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
