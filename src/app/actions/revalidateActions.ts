
'use server';

import { revalidatePath } from 'next/cache';

// Server Action for revalidation
export async function revalidatePostPaths(slug: string, category?: string) {
    // Revalidate the home page layout to catch recent posts on sidebars etc.
    revalidatePath('/', 'layout');
    
    // Revalidate the "all posts" page
    revalidatePath('/all-posts');

    // Revalidate the specific category page
    if (category) {
        // The category path might be like "/fashion/womens-fashion"
        // We revalidate the layout for that path to cover all sub-pages and query params
        revalidatePath(category, 'layout');
    }

    // Revalidate the post's own page
    revalidatePath(`/posts/${slug}`);
    
    console.log(`Revalidated paths for slug: ${slug} and category: ${category}`);
}
