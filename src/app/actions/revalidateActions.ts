
'use server';

import { revalidatePath } from 'next/cache';

// Server Action for revalidation
export async function revalidatePostPaths(slug: string, category?: string) {
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
}
