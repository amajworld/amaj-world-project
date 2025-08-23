
'use server';

import { FieldValue, FieldPath } from 'firebase-admin/firestore';
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

type CollectionName = 'posts' | 'site-data' | 'socialLinks' | 'heroSlides' | 'ads';

// --- LOCAL DATA READING FUNCTIONS (PRIMARY METHOD FOR GET*) ---

const localDataFiles: { [key: string]: string } = {
  'posts': 'posts.json',
  'site-data': 'site-data.json',
  'socialLinks': 'social-links.json',
  'heroSlides': 'hero-slides.json',
  'ads': 'ads.json',
};

async function readFromLocalFile(filePath: string, fileNameForLogs: string) {
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.warn(`Local data file not found: ${fileNameForLogs}. Returning empty data.`);
            return []; // Return empty array for collections, handled separately for single docs
        }
        console.error(`Failed to read or parse local data file ${fileNameForLogs}:`, error);
        throw error; // Re-throw other errors
    }
}

async function getLocalCollectionData(collectionName: CollectionName) {
    const fileName = localDataFiles[collectionName];
    if (!fileName) {
        throw new Error(`No local data file defined for collection: ${collectionName}`);
    }
    const filePath = path.join(process.cwd(), 'src', 'data', fileName);
    return await readFromLocalFile(filePath, fileName);
}


export async function getDocuments<T extends {id?: string}>(
  collectionName: CollectionName,
  options?: {
    where?: [string | FieldPath, FirebaseFirestore.WhereFilterOp, any][];
    orderBy?: [string, 'asc' | 'desc'];
    limit?: number;
  }
): Promise<T[]> {
    let data = await getLocalCollectionData(collectionName);
    
    // Basic filtering for local data
    if (options?.where) {
        for(const w of options.where){
            data = data.filter((item: any) => {
                if(w[1] === '==') return item[w[0]] === w[2];
                // Extend with more operators if needed
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
        let filePath: string;
        let fileName: string;
        if (documentId === 'menu') {
            fileName = 'menu.json';
            filePath = path.join(process.cwd(), 'src', 'data', fileName);
            const data = await readFromLocalFile(filePath, fileName);
            return { id: 'menu', data: data } as T;
        }
        if (documentId === 'settings') {
            fileName = 'site-settings.json';
            filePath = path.join(process.cwd(), 'src', 'data', fileName);
             try {
                return await readFromLocalFile(filePath, fileName);
            } catch (e) {
                return null;
            }
        }
    }

    const data = await getLocalCollectionData(collectionName);
    if (Array.isArray(data)) {
        return data.find((item: any) => String(item.id) === String(documentId)) || null;
    }
    return null;
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
    let allPosts = await getDocuments<T>(collectionName, { orderBy: options.orderBy, where: options.where });
    
    const totalDocs = allPosts.length;
    const totalPages = Math.ceil(totalDocs / options.limit);
    const startIndex = (options.page - 1) * options.limit;
    const documents = allPosts.slice(startIndex, startIndex + options.limit);
    
    return { documents, totalPages, totalDocs };
}


// --- WRITE-ONLY FUNCTIONS (REQUIRE FIREBASE CONNECTION) ---

// This function dynamically imports firebaseAdmin to ensure it's not part of the build bundle.
const getDb = async () => {
    const { ensureFirebaseConnected } = await import('@/lib/firebaseAdmin');
    const { adminDb, isFirebaseConnected } = ensureFirebaseConnected();
    if (!isFirebaseConnected || !adminDb) {
        throw new Error('Database not connected. Write operations are disabled.');
    }
    return adminDb;
}

export async function addDocument<T extends object>(collectionName: CollectionName, data: T): Promise<string> {
    const adminDb = await getDb();
    const docRef = await adminDb.collection(collectionName).add(data);
    await revalidateRelevantPaths(collectionName);
    return docRef.id;
}

export async function updateDocument<T extends object>(collectionName: CollectionName, documentId: string, data: Partial<T>): Promise<void> {
    const adminDb = await getDb();
    const docRef = adminDb.collection(collectionName).doc(documentId);
    await docRef.set(data, { merge: true });
    await revalidateRelevantPaths(collectionName);
}

export async function setDocument(collectionName: CollectionName, documentId: string, data: any): Promise<void> {
    const adminDb = await getDb();
    await adminDb.collection(collectionName).doc(documentId).set(data);
    await revalidateRelevantPaths(collectionName);
}

export async function deleteDocument(collectionName: CollectionName, documentId: string): Promise<void> {
    const adminDb = await getDb();
    await adminDb.collection(collectionName).doc(documentId).delete();
    await revalidateRelevantPaths(collectionName);
}

// --- REVALIDATION ---

async function revalidateRelevantPaths(collectionName: CollectionName) {
    // Revalidate the entire site for simplicity on any data change.
    revalidatePath('/', 'layout');
}
