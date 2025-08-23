
import { getDocuments, getDocument } from '@/app/actions/firestoreActions';
import type { Post } from '@/data/posts';
import type { MenuItem } from '@/app/admin/menu/page';
import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://amajworlds.vercel.app';


function getCategoryPaths(menuItems: MenuItem[]): string[] {
    let paths: string[] = [];
    menuItems.forEach(item => {
        if (item.href !== '/') {
             paths.push(item.href);
        }
        if (item.children) {
            item.children.forEach(child => {
                paths.push(child.href);
            });
        }
    });
    return paths;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'yearly', priority: 1 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/all-posts`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ];

  const posts = await getDocuments<Post>('posts', { where: [['status', '==', 'published']] });

  // Dynamic pages: Posts
  const postRoutes = posts.map(post => ({
    url: `${BASE_URL}/posts/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // Dynamic pages: Categories
  const menuDoc = await getDocument<{data: MenuItem[]}>('site-data', 'menu');
  const menuData = menuDoc?.data || [];
  const categoryPaths = getCategoryPaths(menuData);
  const categoryRoutes = categoryPaths.map(path => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Dynamic pages: Tags
  const allTags = new Set<string>();
  posts.forEach(post => {
    if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => allTags.add(tag));
    }
  });

  const tagRoutes = Array.from(allTags).map(tag => ({
    url: `${BASE_URL}/tags/${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));


  return [...staticRoutes, ...postRoutes, ...categoryRoutes, ...tagRoutes];
}
