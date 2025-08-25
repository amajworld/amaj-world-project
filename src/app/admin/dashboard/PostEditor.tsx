'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import TiptapEditor from '@/components/TiptapEditor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDocument } from '@/app/actions/firestoreActions';
import type { MenuItem } from '@/types/menu';
import type { Post } from '@/types/posts';
import { savePostAction } from './actions';

interface PostEditorProps {
    post?: Post;
}

function generateSlug(title: string) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric characters except spaces and hyphens
        .trim()
        .replace(/\s+/g, '-') // replace spaces with hyphens
        .replace(/-+/g, '-'); // remove consecutive hyphens
}

const PostEditor = ({ post }: PostEditorProps) => {
    const router = useRouter();
    const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm<Post>({
        defaultValues: post || {
            title: '',
            slug: '',
            content: '',
            category: '',
            status: 'draft',
            imageUrl: '',
            tags: [],
        },
    });
    
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

    useEffect(() => {
        const fetchMenu = async () => {
            const menuDoc = await getDocument<{ data: MenuItem[] }>('site-data', 'menu');
            const items = menuDoc?.data.flatMap(item =>
                item.children ? item.children : (item.href !== '/' ? item : [])
            ) || [];
            setMenuItems(items);
        };
        fetchMenu();
    }, []);
    
    const titleValue = watch('title');
    useEffect(() => {
        if (titleValue && !post) { // Only auto-generate slug for new posts
            setValue('slug', generateSlug(titleValue));
        }
    }, [titleValue, setValue, post]);

    const onSubmit = async (data: Post) => {
        try {
            const finalData = { ...data };
            await savePostAction(finalData, post?.id);
            router.push('/admin/dashboard');
            router.refresh(); // To reflect changes
        } catch (error) {
            console.error('Failed to save post:', error);
            alert('An error occurred. Please check the console.');
        }
    };
    
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register('title', { required: 'Title is required' })} />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" {...register('slug', { required: 'Slug is required' })} />
                {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
            </div>
            
            <div>
                <Label htmlFor="content">Content</Label>
                <Controller
                    name="content"
                    control={control}
                    rules={{ required: 'Content cannot be empty' }}
                    render={({ field }) => <TiptapEditor content={field.value} onChange={field.onChange} />}
                />
                {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
            </div>
            
             <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input id="imageUrl" {...register('imageUrl')} placeholder="https://placehold.co/600x400.png"/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="category">Category</Label>
                    <Controller
                        name="category"
                        control={control}
                        rules={{ required: 'Category is required' }}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {menuItems.map(item => (
                                        <SelectItem key={item.id} value={item.href}>{item.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                </div>

                <div>
                    <Label htmlFor="status">Status</Label>
                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </div>
            
            <div>
                <Label htmlFor="tags">Tags</Label>
                <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                        <Input 
                            id="tags"
                            value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                            onChange={(e) => field.onChange(e.target.value.split(',').map(tag => tag.trim()))}
                            placeholder="e.g. fashion, tech, lifestyle"
                        />
                    )}
                />
                <p className="text-sm text-muted-foreground mt-1">Separate tags with a comma.</p>
            </div>

            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Post'}
            </Button>
        </form>
    );
};

export default PostEditor;
