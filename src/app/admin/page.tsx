
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, Users, BarChart2, Eye, Loader2 } from 'lucide-react';
import { getDocuments } from '@/app/actions/firestoreActions';
import type { Post } from '@/data/posts';
import Link from 'next/link';

type DashboardStats = {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number; // Placeholder
  totalUsers: number; // Placeholder
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const posts = await getDocuments<Post>('posts');
        const totalPosts = posts.length;
        const publishedPosts = posts.filter(p => p.status === 'published').length;
        const draftPosts = posts.filter(p => p.status === 'draft').length;
        
        // Placeholders for other stats
        const totalViews = 125000;
        const totalUsers = 1500;

        setStats({ totalPosts, publishedPosts, draftPosts, totalViews, totalUsers });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPosts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.publishedPosts || 0} published, {stats?.draftPosts || 0} drafts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalViews.toLocaleString() || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Across all posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Site Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString() || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Placeholder data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">Placeholder data</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button asChild>
                <Link href="/admin/posts/new">Create New Post</Link>
            </Button>
            <Button variant="outline" asChild>
                <Link href="/admin/menu">Manage Menu</Link>
            </Button>
            <Button variant="outline" asChild>
                <Link href="/admin/settings">Site Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
