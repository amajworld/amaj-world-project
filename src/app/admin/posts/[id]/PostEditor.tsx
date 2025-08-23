
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Link as LinkIcon, AlignLeft,
  AlignCenter, AlignRight, AlignJustify, Save, ArrowLeft, Heading1, Heading2,
  Heading3, Pilcrow, Image as ImageIcon, Send, Calendar as CalendarIcon, X, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Post } from '@/data/posts';
import { menuData } from '@/data/menu';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { addDocument, updateDocument } from '@/app/actions/firestoreActions';
import { revalidatePostPaths } from '@/app/actions/revalidateActions';


const TiptapEditor = ({ content, onChange }: { content: string; onChange: (html: string) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit, Underline, TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false, allowBase64: true }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base m-5 focus:outline-none h-[500px] overflow-y-auto border rounded-md p-4',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  if (!editor) {
    return <Loader2 className="h-8 w-8 animate-spin mx-auto my-4" />;
  }

  return (
    <div>
      {editor && (
        <div className="border rounded-t-md p-2 flex items-center gap-1 flex-wrap bg-muted">
            <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}><Heading1 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}><Heading2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}><Heading3 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? 'is-active' : ''}><Pilcrow className="h-4 w-4" /></Button>
            <div className="border-r h-6 mx-1"></div>
            <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}><Bold className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}><Italic className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'is-active' : ''}><UnderlineIcon className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''}><Strikethrough className="h-4 w-4" /></Button>
            <div className="border-r h-6 mx-1"></div>
            <Button variant="ghost" size="icon" onClick={setLink} className={editor.isActive('link') ? 'is-active' : ''}><LinkIcon className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={addImage}><ImageIcon className="h-4 w-4" /></Button>
            <div className="border-r h-6 mx-1"></div>
            <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}><AlignLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}><AlignCenter className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}><AlignRight className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}><AlignJustify className="h-4 w-4" /></Button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
};


export default function PostEditor({ initialPost }: { initialPost: Partial<Post> | null }) {
  const router = useRouter();
  
  const [post, setPost] = useState<Partial<Post>>(initialPost || {});
  const [isSaving, setIsSaving] = useState(false);
  
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(
    initialPost?.status === 'scheduled' && initialPost.scheduledAt ? new Date(initialPost.scheduledAt) : undefined
  );
  
  const [scheduleTime, setScheduleTime] = useState(() => {
      if (initialPost?.status === 'scheduled' && initialPost.scheduledAt) {
          try {
              return format(new Date(initialPost.scheduledAt), 'HH:mm');
          } catch {
              return '10:00';
          }
      }
      return '10:00';
  });

  const [tagInput, setTagInput] = useState('');

  if (!initialPost) {
    return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-destructive text-lg">Error: Post data could not be loaded.</p>
            <Button onClick={() => router.push('/admin/posts')}>Go back to posts list</Button>
        </div>
    );
  }

  const handleInputChange = (field: keyof Post, value: any) => {
    setPost(prev => ({ ...prev, [field]: value }));
  };

  const handleStatusChange = (value: 'published' | 'draft' | 'scheduled') => {
    handleInputChange('status', value);
    if (value === 'scheduled' && !scheduleDate) {
      setScheduleDate(new Date());
    }
  };

  const handleContentChange = (html: string) => {
    handleInputChange('content', html);
  };

  const generateSlug = (title: string) => {
    if (!title) return '';
    return title.toLowerCase().replace(/[^a-z0-9\\s-]/g, '').trim().replace(/\\s+/g, '-').replace(/-+/g, '-');
  };
  
  const handleTitleBlur = () => {
      if (!post.slug && post.title) {
          handleInputChange('slug', generateSlug(post.title));
      }
  };

  const handleSave = async (publishAction: 'draft' | 'publish') => {
    if (!post.title || !post.category) {
      alert('Title and Category are required.');
      return;
    }
    setIsSaving(true);
    
    let finalStatus = post.status || 'draft';
    if (publishAction === 'publish') {
      finalStatus = post.status === 'scheduled' ? 'scheduled' : 'published';
    } else {
      finalStatus = 'draft';
    }

    if (finalStatus === 'scheduled' && (!scheduleDate || !scheduleTime)) {
      alert('Please select a schedule date and time.');
      setIsSaving(false);
      return;
    }

    let imageUrl = post.imageUrl;
    if (!imageUrl && post.content) {
      const match = post.content.match(/<img src="([^"]+)"/);
      if (match) imageUrl = match[1];
    }
    if (!imageUrl) {
        imageUrl = 'https://placehold.co/600x400.png';
    }

    const finalSlug = post.slug || generateSlug(post.title || '');
    let scheduledAtISO: string | undefined = undefined;
    if (finalStatus === 'scheduled' && scheduleDate) {
      const [hours, minutes] = scheduleTime.split(':');
      const finalScheduleDate = new Date(scheduleDate);
      finalScheduleDate.setHours(parseInt(hours, 10));
      finalScheduleDate.setMinutes(parseInt(minutes, 10));
      scheduledAtISO = finalScheduleDate.toISOString();
    }
    
    const postData: Omit<Post, 'id' | 'href'> = {
        title: post.title,
        slug: finalSlug,
        content: post.content || '',
        category: post.category,
        date: post.date || new Date().toISOString(),
        views: post.views || 0,
        imageUrl: imageUrl,
        status: finalStatus,
        seoTitle: post.seoTitle || '',
        seoDescription: post.seoDescription || '',
        tags: post.tags || [],
        scheduledAt: scheduledAtISO,
    };

    try {
      let savedPostId = post.id;
      if (post.id && post.id !== 'new') {
        await updateDocument('posts', post.id, postData);
      } else {
        const newId = await addDocument('posts', postData);
        savedPostId = newId;
      }
      
      await revalidatePostPaths(finalSlug, post.category);

      alert(`Post saved successfully! Status: ${finalStatus}`);
      
      if (!post.id || post.id === 'new') {
          if(savedPostId) router.push(`/admin/posts/${savedPostId}`);
      } else if (publishAction === 'publish') {
          router.push('/admin/posts');
          router.refresh();
      }

    } catch (error: any) {
      console.error('Failed to save post:', error);
      alert(`Error saving post: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTagAdd = (e?: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (e && 'key' in e && e.key !== 'Enter') return;
    if (tagInput.trim() !== '' && !post.tags?.includes(tagInput.trim())) {
      const newTags = [...(post.tags || []), tagInput.trim()];
      handleInputChange('tags', newTags);
      setTagInput('');
    }
    e?.preventDefault();
  };

  const handleTagRemove = (tagToRemove: string) => {
    const newTags = post.tags?.filter(tag => tag !== tagToRemove);
    handleInputChange('tags', newTags);
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={() => router.back()} disabled={isSaving}><ArrowLeft className="h-4 w-4" /></Button>
            <h1 className="text-2xl font-bold">{post.id && post.id !== 'new' ? 'Edit Post' : 'Create New Post'}</h1>
            <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => handleSave('draft')} disabled={isSaving}><Save className="mr-2 h-4 w-4" />Save Draft</Button>
                <Button onClick={() => handleSave('publish')} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Send className="mr-2 h-4 w-4" />
                  {post.status === 'scheduled' ? 'Schedule' : 'Publish / Schedule'}
                </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader><CardTitle>Post Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2"><Label htmlFor="post-title">Post Title</Label><Input id="post-title" value={post.title || ''} onChange={e => handleInputChange('title', e.target.value)} onBlur={handleTitleBlur} placeholder="Your Awesome Post Title"/></div>
                        <div className="space-y-2"><Label htmlFor="post-slug">Slug</Label><Input id="post-slug" value={post.slug || ''} onChange={e => handleInputChange('slug', e.target.value)} placeholder="your-awesome-post-title"/></div>
                        <div className="space-y-2"><Label>Post Content</Label><TiptapEditor content={post.content || ''} onChange={handleContentChange} /></div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>SEO Settings</CardTitle>
                        <CardDescription>Optimize your post for search engines.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2"><Label htmlFor="seo-title">SEO Title</Label><Input id="seo-title" value={post.seoTitle || ''} onChange={e => handleInputChange('seoTitle', e.target.value)} placeholder="Title for search engines"/></div>
                         <div className="space-y-2"><Label htmlFor="seo-description">SEO Description</Label><Textarea id="seo-description" value={post.seoDescription || ''} onChange={e => handleInputChange('seoDescription', e.target.value)} placeholder="Description for search engines" rows={3}/></div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="post-status">Status</Label>
                            <Select value={post.status || 'draft'} onValueChange={handleStatusChange}>
                                <SelectTrigger id="post-status"><SelectValue placeholder="Select status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {post.status === 'scheduled' && (
                            <div className="space-y-2">
                                <Label>Schedule Date & Time</Label>
                                <div className="flex items-center gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !scheduleDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {scheduleDate ? format(scheduleDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={scheduleDate} onSelect={setScheduleDate} initialFocus/>
                                        </PopoverContent>
                                    </Popover>
                                    <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="w-[120px]"/>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="post-category">Category</Label>
                            <Select value={post.category || ''} onValueChange={(value) => handleInputChange('category', value)}>
                                <SelectTrigger id="post-category">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {menuData.filter(item => item.href !== '/').map(mainItem => {
                                        if (mainItem.children && mainItem.children.length > 0) {
                                            return (
                                                <SelectGroup key={mainItem.href}>
                                                    <Label className="px-2 py-1.5 text-sm font-semibold">{mainItem.label}</Label>
                                                    {mainItem.children.map(childItem => (
                                                        <SelectItem key={childItem.href} value={childItem.href}>{childItem.label}</SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            );
                                        }
                                        return (
                                            <SelectItem key={mainItem.href} value={mainItem.href}>{mainItem.label}</SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tag-input">Tags</Label>
                            <div className="flex items-center gap-2">
                                <Input id="tag-input" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleTagAdd(e); }}} placeholder="Add a tag and press Enter"/>
                                <Button type="button" size="sm" onClick={(e) => handleTagAdd(e)}>Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
                                {post.tags && post.tags.length > 0 ? (post.tags.map((tag, index) => (<Badge key={index} variant="secondary" className="flex items-center gap-2"><span>{tag}</span><button type="button" onClick={() => handleTagRemove(tag)} className="rounded-full hover:bg-muted-foreground/20 p-0.5"><X className="h-3 w-3" /></button></Badge>))) : (<p className="text-sm text-muted-foreground">No tags added yet.</p>)}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Featured Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="featured-image-url">Image URL</Label>
                            <Input 
                                id="featured-image-url" 
                                value={post.imageUrl || ''} 
                                onChange={e => handleInputChange('imageUrl', e.target.value)} 
                                placeholder="https://example.com/image.png"
                            />
                            <p className="text-xs text-muted-foreground">
                                This image will be used on the post card and as a fallback if no image is in the content.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
