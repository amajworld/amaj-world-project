
'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import type { Post } from '@/types/posts';

const postsFilePath = path.join(process.cwd(), 'src', 'data', 'posts.json');

async function readPosts(): Promise<Post[]> {
  try {
    const fileContent = await fs.readFile(postsFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // If the file doesn't exist, return an empty array.
    return [];
  }
}

async function writePosts(posts: Post[]) {
  await fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), 'utf-8');
}

export async function savePostAction(postData: Post, postId?: string) {
  const posts = await readPosts();
  
  if (postId) {
    // Update existing post
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
      posts[index] = { ...posts[index], ...postData, id: postId };
    }
  } else {
    // Create new post
    const newPost: Post = {
      ...postData,
      id: new Date().getTime().toString(), // Simple unique ID
      date: new Date().toISOString(),
    };
    posts.unshift(newPost); // Add to the beginning
  }
  
  await writePosts(posts);
  
  // Revalidate paths to show the new/updated post
  revalidatePath('/', 'layout');
}

export async function deletePostAction(postId: string) {
    const posts = await readPosts();
    const updatedPosts = posts.filter(p => p.id !== postId);
    await writePosts(updatedPosts);
    revalidatePath('/', 'layout');
}
