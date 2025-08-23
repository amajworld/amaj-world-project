'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

// --- TYPE DEFINITIONS ---
import type { Post } from '@/types/posts';
import type { MenuItem } from '@/types/menu';
import type { SiteSettings } from '@/types/site-settings';
import type { SocialLink } from '@/types/social-links';
import type { SlideConfig } from '@/types/hero-slides';
import type { AdConfig } from '@/types/ads';


// --- DATA FILE PATHS ---
const postsFilePath = path.join(process.cwd(), 'src', 'data', 'posts.json');
const menuFilePath = path.join(process.cwd(), 'src', 'data', 'menu.json');
const settingsFilePath = path.join(process.cwd(), 'src/data', 'site-settings.json');
const socialLinksFilePath = path.join(process.cwd(), 'src/data', 'social-links.json');
const heroSlidesFilePath = path.join(process.cwd(), 'src/data', 'hero-slides.json');
const adsFilePath = path.join(process.cwd(), 'src/data', 'ads.json');


// --- GENERIC READ/WRITE FUNCTIONS ---

async function readData(filePath: string, defaultValue: any = []) {
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.warn(`Data file not found: ${filePath}. Returning default.`);
            return defaultValue;
        }
        console.error(`Failed to read or parse ${filePath}:`, error);
        throw error;
    }
}

async function writeData(filePath: string, data: any) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Failed to write to ${filePath}:`, error);
        throw error;
    }
}


// --- PUBLIC DATA ACCESSOR FUNCTIONS ---

export async function getDocuments<T>(
  collectionName: 'posts' | 'socialLinks' | 'heroSlides' | 'ads',
  options?: {
    where?: [string, '==', any][];
    orderBy?: [string, 'asc' | 'desc'];
    limit?: number;
  }
): Promise<T[]> {
    let filePath;
    switch (collectionName) {
        case 'posts': filePath = postsFilePath; break;
        case 'socialLinks': filePath = socialLinksFilePath; break;
        case 'heroSlides': filePath = heroSlidesFilePath; break;
        case 'ads': filePath = adsFilePath; break;
        default: throw new Error(`Unknown collection: ${collectionName}`);
    }

    let data: T[] = await readData(filePath);

    if (options?.where) {
        for (const w of options.where) {
            data = data.filter((item: any) => item[w[0]] === w[2]);
        }
    }
    if (options?.orderBy) {
        const [field, direction] = options.orderBy;
        data.sort((a: any, b: any) => {
            const valA = field === 'date' ? new Date(a[field]).getTime() : a[field];
            const valB = field === 'date' ? new Date(b[field]).getTime() : b[field];
            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
    if (options?.limit) {
        data = data.slice(0, options.limit);
    }
    return data;
}

export async function getDocument<T>(collectionName: 'site-data' | 'posts', documentId: string): Promise<T | null> {
    if (collectionName === 'site-data') {
        if (documentId === 'menu') {
            const data = await readData(menuFilePath, []);
            return { data } as T;
        }
        if (documentId === 'settings') {
            return await readData(settingsFilePath, {});
        }
        return null;
    }

    if (collectionName === 'posts') {
        const posts = await readData(postsFilePath);
        return posts.find((p: any) => p.slug === documentId || p.id === documentId) || null;
    }
    
    return null;
}
