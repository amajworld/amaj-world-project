
'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

// --- TYPE DEFINITIONS ---
import type { Post } from '@/data/posts';
import type { MenuItem } from '@/app/admin/menu/page';
import type { SiteSettings } from '@/app/admin/settings/page';
import type { SocialLink } from '@/app/admin/social-links/page';
import type { SlideConfig } from '@/app/admin/hero-slider/page';
import type { AdConfig } from '@/app/admin/ads/page';
import { FieldPath } from 'firebase-admin/firestore';

type CollectionName = 'posts' | 'site-data' | 'socialLinks' | 'heroSlides' | 'ads';
type DocumentId = 'menu' | 'settings';

// --- LOCAL DATA FILE MAPPING ---
const localDataFiles: { [key: string]: string } = {
  posts: 'posts.json',
  socialLinks: 'social-links.json',
  heroSlides: 'hero-slides.json',
  ads: 'ads.json',
  'site-data_menu': 'menu.json',
  'site-data_settings': 'site-settings.json',
};

// --- CORE LOCAL FILE I/O FUNCTIONS ---

async function readLocalFile(collection: CollectionName, docId?: DocumentId): Promise<any> {
    const fileName = localDataFiles[docId ? `${collection}_${docId}` : collection];
    if (!fileName) {
        throw new Error(`Local data file not configured for: ${collection}/${docId || ''}`);
    }
    const filePath = path.join(process.cwd(), 'src', 'data', fileName);
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.warn(`Local data file not found: ${fileName}. Returning default empty state.`);
            if (docId === 'settings') return {}; // settings is an object
            if(docId === 'menu') return [];
            return []; // Collections are arrays
        }
        console.error(`Failed to read or parse ${fileName}:`, error);
        throw error;
    }
}

async function writeLocalFile(collection: CollectionName, data: any, docId?: DocumentId): Promise<void> {
    const fileName = localDataFiles[docId ? `${collection}_${docId}` : collection];
    if (!fileName) {
        throw new Error(`Local data file not configured for: ${collection}/${docId || ''}`);
    }
    const filePath = path.join(process.cwd(), 'src', 'data', fileName);
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
        // Revalidate the entire site to reflect changes globally.
        revalidatePath('/', 'layout');
    } catch (error) {
        console.error(`Failed to write to ${fileName}:`, error);
        throw error;
    }
}


// --- PUBLIC DATA ACCESS FUNCTIONS (CRUD) ---

export async function getDocuments<T extends {id?: string}>(
  collectionName: CollectionName,
  options?: {
    where?: [string | FieldPath, FirebaseFirestore.WhereFilterOp, any][];
    orderBy?: [string, 'asc' | 'desc'];
    limit?: number;
  }
): Promise<T[]> {
    let data: T[] = await readLocalFile(collectionName);
    
    if (options?.where) {
        for(const w of options.where){
            data = data.filter((item: any) => {
                const operator = w[1];
                const key = w[0] as string;
                const value = w[2];
                if(operator === '==') return item[key] === value;
                // Extend with more operators if needed for local filtering
                return true;
            });
        }
    }
    if (options?.orderBy) {
        const [field, direction] = options.orderBy;
        data.sort((a: any, b: any) => {
            if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
            if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
    if (options?.limit) {
        data = data.slice(0, options.limit);
    }
    return data;
}

export async function getDocument<T extends object>(collectionName: CollectionName, documentId: string): Promise<T | null> {
     if (collectionName === 'site-data') {
        if (documentId === 'menu') {
            const data = await readLocalFile('site-data', 'menu');
            return { id: 'menu', data: data } as T;
        }
        if (documentId === 'settings') {
            return await readLocalFile('site-data', 'settings');
        }
        return null;
    }

    const data = await getDocuments<T & { id?: string }>(collectionName);
    return data.find((item: any) => String(item.id) === String(documentId)) || null;
}

export async function addDocument<T extends object>(collectionName: CollectionName, data: T): Promise<string> {
    const allDocs = await readLocalFile(collectionName);
    const newId = String(Date.now()); // Simple unique ID
    const newDoc = { ...data, id: newId };
    allDocs.push(newDoc);
    await writeLocalFile(collectionName, allDocs);
    return newId;
}

export async function updateDocument<T extends object>(collectionName: CollectionName, documentId: string, data: Partial<T>): Promise<void> {
    const allDocs = await readLocalFile(collectionName);
    const docIndex = allDocs.findIndex((doc: any) => doc.id === documentId);
    if (docIndex === -1) throw new Error('Document not found for update.');
    
    allDocs[docIndex] = { ...allDocs[docIndex], ...data };
    await writeLocalFile(collectionName, allDocs);
}

export async function setDocument(collectionName: CollectionName, documentId: DocumentId, data: any): Promise<void> {
    if (collectionName !== 'site-data') {
        throw new Error('setDocument is only supported for site-data collection.');
    }
    // For menu, we expect data to be { data: MenuItem[] }
    const dataToWrite = data?.data ? data.data : data;
    await writeLocalFile(collectionName, dataToWrite, documentId);
}

export async function deleteDocument(collectionName: CollectionName, documentId: string): Promise<void> {
    const allDocs = await readLocalFile(collectionName);
    const updatedDocs = allDocs.filter((doc: any) => doc.id !== documentId);
    if (allDocs.length === updatedDocs.length) {
        console.warn(`Document with id ${documentId} not found for deletion.`);
    }
    await writeLocalFile(collectionName, updatedDocs);
}

export async function getPaginatedDocuments<T extends {id?: string}>(
  collectionName: 'posts',
  options: {
    page: number;
    limit: number;
    where?: [string, FirebaseFirestore.WhereFilterOp, any][];
    orderBy?: [string, 'asc' | 'desc'];
  }
): Promise<{ documents: T[]; totalPages: number; totalDocs: number }> {
    const allPosts = await getDocuments<T>(collectionName, { orderBy: options.orderBy, where: options.where });
    
    const totalDocs = allPosts.length;
    const totalPages = Math.ceil(totalDocs / options.limit);
    const startIndex = (options.page - 1) * options.limit;
    const documents = allPosts.slice(startIndex, startIndex + options.limit);
    
    return { documents, totalPages, totalDocs };
}
