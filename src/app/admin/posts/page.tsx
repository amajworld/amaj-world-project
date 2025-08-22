
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  PlusCircle, Edit, Trash2, Search, Loader2, ChevronsUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import type { Post } from '@/data/posts';
import { deleteDocument, getDocuments } from '@/app/actions/firestoreActions';
import { revalidatePostPaths } from '@/app/actions/revalidateActions';
import { format } from 'date-fns';

type SortConfig = {
    key: keyof Post;
    direction: 'ascending' | 'descending';
};

export default function PostsListPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'date', direction: 'descending' });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const fetchedPosts = await getDocuments<Post>('posts');
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (postToDelete: Post) => {
    if (window.confirm('Are you sure you want to delete this post? This cannot be undone.')) {
      try {
        await deleteDocument('posts', postToDelete.id);
        await revalidatePostPaths(postToDelete.slug, postToDelete.category);
        setPosts(posts.filter((post) => post.id !== postToDelete.id));
      } catch (error) {
        console.error('Failed to delete post:', error);
        alert('Failed to delete post.');
      }
    }
  };

  const requestSort = (key: keyof Post) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedPosts = useMemo(() => {
      let sortableItems = [...posts];
      if (sortConfig !== null) {
          sortableItems.sort((a, b) => {
              const aValue = a[sortConfig.key] ?? '';
              const bValue = b[sortConfig.key] ?? '';

              if (aValue < bValue) {
                  return sortConfig.direction === 'ascending' ? -1 : 1;
              }
              if (aValue > bValue) {
                  return sortConfig.direction === 'ascending' ? 1 : -1;
              }
              return 0;
          });
      }
      return sortableItems;
  }, [posts, sortConfig]);


  const filteredPosts = sortedPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSortIcon = (key: keyof Post) => {
      if (!sortConfig || sortConfig.key !== key) {
          return <ChevronsUpDown className="ml-2 h-4 w-4" />;
      }
      if (sortConfig.direction === 'ascending') {
          return <ArrowUp className="ml-2 h-4 w-4" />;
      }
      return <ArrowDown className="ml-2 h-4 w-4" />;
  };


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>All Posts</CardTitle>
          <CardDescription>Manage your blog posts here.</CardDescription>
        </div>
        <Button onClick={() => router.push('/admin/posts/new')}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Post
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search posts by title or category..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                      <Button variant="ghost" onClick={() => requestSort('title')}>
                        Title {getSortIcon('title')}
                      </Button>
                  </TableHead>
                  <TableHead>
                      <Button variant="ghost" onClick={() => requestSort('status')}>
                          Status {getSortIcon('status')}
                      </Button>
                  </TableHead>
                  <TableHead>
                      <Button variant="ghost" onClick={() => requestSort('category')}>
                          Category {getSortIcon('category')}
                      </Button>
                  </TableHead>
                  <TableHead>
                      <Button variant="ghost" onClick={() => requestSort('date')}>
                        Date {getSortIcon('date')}
                      </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>
                        <Badge variant={
                          post.status === 'published' ? 'default' : 
                          post.status === 'draft' ? 'secondary' : 'outline'
                        }>
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{post.category}</TableCell>
                      <TableCell>
                        {format(new Date(post.date), 'PPP')}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/admin/posts/${post.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                           <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(post)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No posts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
