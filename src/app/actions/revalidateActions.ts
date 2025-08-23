
'use server';

import { revalidatePath } from 'next/cache';
import { isFirebaseConnected } from '@/lib/firebaseAdmin';

// Server Action for revalidation
export async function revalidatePostPaths(slug: string, category?: string) {
    if (!isFirebaseConnected) {
        console.log('Firebase not connected, skipping revalidation.');
        return;
    }

    try {
        // Revalidate the home page to catch recent posts and other updates
        revalidatePath('/', 'layout');
        
        // Revalidate the "all posts" page
        revalidatePath('/all-posts');

        // Revalidate the specific category page
        if (category) {
            const pathSegments = category.split('/').filter(Boolean);
            let currentPath = '';
            for (const segment of pathSegments) {
                currentPath += `/${segment}`;
                revalidatePath(currentPath, 'page');
            }
        }

        // Revalidate the post's own page
        revalidatePath(`/posts/${slug}`);
        
        console.log(`Revalidated paths for slug: ${slug}, category: ${category}`);
    } catch (error) {
        console.error('Failed to revalidate paths:', error);
        throw new Error('Failed to revalidate paths.');
    }
}
