
'use server';

import { revalidatePath } from 'next/cache';
import { isFirebaseConnected } from '@/lib/firebaseAdmin';

// Server Action for revalidation
export async function revalidatePostPaths(slug: string, category?: string) {
    // If Firebase is not connected (e.g., in a local/disconnected environment),
    // skip revalidation to prevent fetch errors.
    if (!isFirebaseConnected) {
        console.log('Firebase not connected, skipping revalidation.');
        return;
    }

    try {
        // Revalidate the home page to catch recent posts on sidebars etc.
        revalidatePath('/', 'layout');
        
        // Revalidate the "all posts" page
        revalidatePath('/all-posts');

        // Revalidate the specific category page and its parent paths if nested
        if (category) {
            // e.g., for category '/fashion/womens-fashion', revalidate both
            // '/fashion/womens-fashion' and '/fashion'
            const pathSegments = category.split('/').filter(Boolean);
            let currentPath = '';
            for (const segment of pathSegments) {
                currentPath += `/${segment}`;
                revalidatePath(currentPath, 'page'); // Use 'page' for more specific revalidation
            }
        }

        // Revalidate the post's own page
        revalidatePath(`/posts/${slug}`);
        
        console.log(`Revalidated paths for slug: ${slug} and category: ${category}`);
    } catch (error) {
        console.error('Failed to revalidate post paths:', error);
        // We throw an error here to make it visible in the UI if revalidation fails on the live site.
        throw new Error('Failed to revalidate post paths.');
    }
}
