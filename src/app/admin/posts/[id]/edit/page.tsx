import PostForm from '../../_components/PostForm';
import { getDocument } from '@/app/actions/firestoreActions';
import type { Post } from '@/data/posts';
import type { MenuItem } from '@/app/admin/menu/page';

export default async function EditPostPage({ params }: { params: { id: string } }) {
    const post = await getDocument<Post>('posts', params.id);
    
    if (!post) {
        return <div>Post not found.</div>;
    }

    const menuDoc = await getDocument<{data: MenuItem[]}>('site-data', 'menu');
    const menuData = menuDoc?.data || [];

    // Flatten menu items to get all possible categories
    const categories = menuData.flatMap(item => 
        item.children ? item.children.map(child => ({ value: child.href, label: `${item.label} > ${child.label}` })) : [{ value: item.href, label: item.label }]
    ).filter(item => item.value !== '/');


    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Edit Post</h1>
            <PostForm post={post} categories={categories} />
        </div>
    );
}
