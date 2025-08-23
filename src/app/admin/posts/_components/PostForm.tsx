
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import {
  addDocument,
  updateDocument,
} from '@/app/actions/firestoreActions';
import { revalidatePostPaths } from '@/app/actions/revalidateActions';
import type { Post } from '@/data/posts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import TiptapEditor from '@/components/TiptapEditor';
import { Timestamp } from 'firebase/firestore';

interface PostFormProps {
  post?: Post;
  categories: { value: string; label: string }[];
}

export default function PostForm({ post, categories }: PostFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Post>({
    defaultValues: post
      ? { ...post, date: post.date ? (post.date as Timestamp).toDate() : new Date() }
      : { status: 'draft', date: new Date() },
  });

  const contentValue = watch('content');
  const titleValue = watch('title');

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setValue('title', title);
    setValue('slug', generateSlug(title));
  };

  const onSubmit = async (data: Post) => {
    setIsLoading(true);
    setErrorMessage('');
    
    // Convert date to Firestore Timestamp
    const submissionData = {
        ...data,
        date: Timestamp.fromDate(new Date(data.date)),
        scheduledAt: data.scheduledAt ? Timestamp.fromDate(new Date(data.scheduledAt)) : null,
    };

    try {
      if (post?.id) {
        await updateDocument('posts', post.id, submissionData);
      } else {
        await addDocument('posts', submissionData);
      }
      // Revalidate paths to reflect changes
      await revalidatePostPaths(submissionData.slug, submissionData.category);

      router.push('/admin/posts');
      router.refresh(); // To ensure the posts list is updated
    } catch (error: any) {
      setErrorMessage(error.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Main Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register('title', { required: 'Title is required' })}
                onChange={handleTitleChange}
                placeholder="Enter post title"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                {...register('slug', { required: 'Slug is required' })}
                placeholder="post-slug-will-be-here"
              />
              {errors.slug && (
                <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
               <Controller
                name="content"
                control={control}
                rules={{ required: 'Content is required.' }}
                render={({ field }) => (
                  <TiptapEditor
                    content={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.content && (
                <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="seoTitle">SEO Title</Label>
                    <Input id="seoTitle" {...register('seoTitle')} placeholder="Enter SEO title"/>
                </div>
                <div>
                    <Label htmlFor="seoDescription">SEO Description</Label>
                    <Textarea id="seoDescription" {...register('seoDescription')} placeholder="Enter SEO description"/>
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {isClient && (
                 <div>
                    <Label htmlFor="date">Publication Date</Label>
                    <Controller
                        name="date"
                        control={control}
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={field.value ? new Date(field.value) : undefined}
                                        onSelect={field.onChange}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                </div>
            )}
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
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
              )}
            </div>
             <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="tags"
                      placeholder="e.g. tech, news, feature"
                      value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(tag => tag.trim());
                        field.onChange(tags);
                      }}
                    />
                  )}
                />
            </div>
          </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Image</CardTitle>
            </CardHeader>
            <CardContent>
                <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input id="imageUrl" {...register('imageUrl', { required: 'Image URL is required' })} placeholder="https://example.com/image.png"/>
                    {errors.imageUrl && (
                        <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>
                    )}
                </div>
                 <div className="mt-2">
                    <Label htmlFor="dataAiHint">Image AI Hint</Label>
                    <Input id="dataAiHint" {...register('dataAiHint')} placeholder="e.g. futuristic city"/>
                </div>
            </CardContent>
        </Card>
        <div className="flex flex-col space-y-2">
            <Button type="submit" disabled={isLoading}>
                {isLoading ? (post ? 'Updating...' : 'Creating...') : (post ? 'Update Post' : 'Create Post')}
            </Button>
            {errorMessage && (
                <p className="text-sm text-destructive text-center">{errorMessage}</p>
            )}
        </div>
      </div>
    </form>
  );
}
