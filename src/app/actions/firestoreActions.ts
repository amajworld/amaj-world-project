
'use server';

// This file is modified to EXCLUSIVELY use local JSON files.
// Firebase connectivity is bypassed to ensure the app is functional.

import type { Post } from '@/data/posts';
import type { MenuItem } from '@/app/admin/menu/page';
import type { SiteSettings } from '@/app/admin/settings/page';
import type { SocialLink } from '@/app/admin/social-links/page';
import type { SlideConfig } from '@/app/admin/hero-slider/page';
import type { AdConfig } from '@/app/admin/ads/page';

import * as fs from 'fs/promises';
import path from 'path';

// --- Local JSON File Data Access ---
const dataDir = path.join(process.cwd(), 'src', 'data');
const getFilePath = (fileName: string) => path.join(dataDir, fileName);

async function readJsonFile<T>(fileName: string): Promise<T[]> {
    try {
        await fs.mkdir(dataDir, { recursive: true }); // Ensure directory exists
        const filePath = getFilePath(fileName);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            await writeJsonFile(fileName, []); // Create file if it doesn't exist
            return [];
        }
        console.error(`Error reading ${fileName}:`, error);
        return [];
    }
}

async function writeJsonFile<T>(fileName:string, data: T[]): Promise<void> {
    try {
        await fs.mkdir(dataDir, { recursive: true });
        const filePath = getFilePath(fileName);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Error writing to ${fileName}:`, error);
    }
}

const collections: Record<CollectionName, string> = {
    'posts': 'posts.json',
    'site-data': 'site-data.json',
    'socialLinks': 'socialLinks.json',
    'heroSlides': 'heroSlides.json',
    'ads': 'ads.json'
};

type CollectionName = 'posts' | 'site-data' | 'socialLinks' | 'heroSlides' | 'ads';

// --- UNIFIED DATA ACCESS FUNCTIONS ---

// Generic function to get all documents from a collection
export async function getDocuments<T extends {id?: string}>(
  collectionName: CollectionName,
  options?: {
    where?: [string, '==', any][];
    orderBy?: [string, 'asc' | 'desc'];
    limit?: number;
  }
): Promise<T[]> {
    const fileName = collections[collectionName];
    if (!fileName) {
        console.warn(`Local mode: No file mapping for collection '${collectionName}'.`);
        return [];
    }
    
    let documents = await readJsonFile<T>(fileName);

    if (options?.where) {
        for (const w of options.where) {
            documents = documents.filter(doc => (doc as any)[w[0]] === w[2]);
        }
    }

    if (options?.orderBy) {
        documents.sort((a, b) => {
            const aVal = (a as any)[options.orderBy![0]];
            const bVal = (b as any)[options.orderBy![0]];
            if (aVal < bVal) return options.orderBy![1] === 'asc' ? -1 : 1;
            if (aVal > bVal) return options.orderBy![1] === 'asc' ? 1 : -1;
            return 0;
        });
    }

    if (options?.limit) {
        documents = documents.slice(0, options.limit);
    }

    return documents;
}

// Generic function to get a single document by ID
export async function getDocument<T extends {id?: string}>(collectionName: CollectionName, documentId: string): Promise<T | null> {
    const fileName = collections[collectionName];
    if (!fileName) return null;
    
    const documents = await readJsonFile<T>(fileName);
    const doc = documents.find(d => d.id === documentId);
    return doc || null;
}

// Generic function to add a document to a collection
export async function addDocument<T extends object>(collectionName: CollectionName, data: T): Promise<string> {
    const fileName = collections[collectionName];
    if (!fileName) return '';

    const documents = await readJsonFile<any>(fileName);
    const newId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const newDocWithId = { ...data, id: newId };
    documents.push(newDocWithId);
    await writeJsonFile(fileName, documents);
    return newId;
}

// Generic function to update a document
export async function updateDocument<T extends object>(collectionName: CollectionName, documentId: string, data: Partial<T>): Promise<void> {
    const fileName = collections[collectionName];
    if (!fileName) return;

    let documents = await readJsonFile<any>(fileName);
    const index = documents.findIndex(d => d.id === documentId);

    if (index !== -1) {
        documents[index] = { ...documents[index], ...data };
    } else {
        // If document doesn't exist (like site-data), create it.
        documents.push({ id: documentId, ...data });
    }
    await writeJsonFile(fileName, documents);
}

// Generic function to delete a document
export async function deleteDocument(collectionName: CollectionName, documentId: string): Promise<void> {
    const fileName = collections[collectionName];
    if (!fileName) return;
    
    let documents = await readJsonFile<any>(fileName);
    documents = documents.filter(d => d.id !== documentId);
    await writeJsonFile(fileName, documents);
}

// Paginated get for posts
export async function getPaginatedDocuments<T extends {id?: string}>(
  collectionName: 'posts',
  options: {
    page: number;
    limit: number;
    where?: [string, '==', any][];
    orderBy?: [string, 'asc' | 'desc'];
  }
): Promise<{ documents: T[]; totalPages: number, totalDocs: number }> {
    const { page, limit, where, orderBy } = options;

    let allPosts = await getDocuments<T>(collectionName, { where, orderBy });
    
    const totalDocs = allPosts.length;
    const totalPages = Math.ceil(totalDocs / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const documents = allPosts.slice(startIndex, endIndex);
    
    return { documents: documents, totalPages, totalDocs };
}
