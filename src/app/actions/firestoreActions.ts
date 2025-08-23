
'use server';

import { adminDb, isFirebaseConnected, ensureFirebaseConnected } from '@/lib/firebaseAdmin';
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

// This map is not exhaustive, but provides type safety for common cases
type CollectionTypeMap = {
    'posts': Post;
    'site-data': { id: string, data?: any } | SiteSettings | SocialLink[] | MenuItem[];
    'socialLinks': SocialLink;
    'heroSlides': SlideConfig;
    'ads': AdConfig;
};

// --- LOCAL FALLBACK FIRST DATA ACCESS FUNCTIONS ---

const localDataFiles: { [key in CollectionName]: string } = {
  'posts': 'posts.json',
  'site-data': 'site-data.json', // This is a generic name, specific doc IDs are handled below
  'socialLinks': 'social-links.json',
  'heroSlides': 'hero-slides.json',
  'ads': 'ads.json',
};

async function readFromLocalFallback<T extends {id?: string}>(collectionName: CollectionName, documentId?: string): Promise<any> {
    const handleFileNotFound = (fileName: string) => {
        console.warn(`Local fallback file not found: ${fileName}. Returning empty data.`);
        return documentId ? null : [];
    };
    
    // Special handling for specific documents in 'site-data'
    if (collectionName === 'site-data') {
        if (documentId === 'menu') {
            try {
                // The menu data is now in menu.json, not a .ts file
                const filePath = path.join(process.cwd(), 'src', 'data', 'menu.json');
                const fileContent = await fs.readFile(filePath, 'utf-8');
                const data = JSON.parse(fileContent);
                return { id: 'menu', data: data };
            } catch (e) {
                return handleFileNotFound('menu.json');
            }
        }
        if (documentId === 'settings') {
            try {
                const filePath = path.join(process.cwd(), 'src', 'data', 'site-settings.json');
                const fileContent = await fs.readFile(filePath, 'utf-8');
                return JSON.parse(fileContent);
            } catch (e) {
                return handleFileNotFound('site-settings.json');
            }
        }
    }

    const fileName = localDataFiles[collectionName];
    if (!fileName) {
        console.error(`No local fallback file defined for collection: ${collectionName}`);
        return documentId ? null : [];
    }

    try {
        const filePath = path.join(process.cwd(), 'src', 'data', fileName);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(fileContent);

        if (documentId) {
            if (Array.isArray(data)) {
                // Ensure IDs are compared as strings for consistency
                const doc = data.find(item => String(item.id) === String(documentId));
                return doc || null;
            }
            // For single-object JSON files, if ID matches, return the object.
            if (typeof data === 'object' && data !== null && String((data as any).id) === String(documentId)) {
                return data;
            }
            return null;
        } else {
             return Array.isArray(data) ? data : [];
        }
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return handleFileNotFound(fileName);
        }
        console.error(`Failed to read or parse local fallback file ${fileName}:`, error);
        return documentId ? null : [];
    }
}


/**
 * Retrieves multiple documents. Prefers local files, falls back to Firestore if connected.
 */
export async function getDocuments<T extends {id?: string}>(
  collectionName: CollectionName,
  options?: {
    where?: [string | FieldPath, FirebaseFirestore.WhereFilterOp, any][];
    orderBy?: [string, 'asc' | 'desc'];
    limit?: number;
  }
): Promise<T[]> {
  // For build-time, always use local data. For client-side/run-time, attempt Firestore.
  if (!isFirebaseConnected) {
    // Basic filtering for local data
    let data = await readFromLocalFallback<T>(collectionName);
    if (options?.where) {
        for(const w of options.where){
            data = data.filter((item: any) => {
                // This is a simplified implementation
                if(w[1] === '==') return item[w[0]] === w[2];
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

  try {
    let query: FirebaseFirestore.Query = adminDb!.collection(collectionName);
    if (options?.where) {
      for (const w of options.where) {
        query = query.where(w[0], w[1], w[2]);
      }
    }
    if (options?.orderBy) {
      query = query.orderBy(options.orderBy[0], options.orderBy[1]);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    console.error(`Error getting documents from ${collectionName} in Firestore, using local fallback:`, error);
    return readFromLocalFallback(collectionName);
  }
}

/**
 * Retrieves a single document. Prefers local, falls back to Firestore.
 */
export async function getDocument<T extends object>(collectionName: CollectionName, documentId: string): Promise<T | null> {
  if (!isFirebaseConnected) {
    return readFromLocalFallback(collectionName, documentId);
  }

  try {
    const docRef = adminDb!.collection(collectionName).doc(documentId);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
        return { id: docSnap.id, ...docSnap.data() } as T;
    }
    // If not found in Firestore, still try local as a final fallback
    return readFromLocalFallback(collectionName, documentId);
  } catch (error) {
    console.error(`Error getting document ${documentId} from ${collectionName}, trying local fallback:`, error);
    return readFromLocalFallback(collectionName, documentId);
  }
}

/**
 * Retrieves paginated posts. Prefers local files, falls back to Firestore.
 */
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

const ensureConnectedForWrites = () => {
    ensureFirebaseConnected();
    if (!isFirebaseConnected || !adminDb) {
        throw new Error('Database not connected. Write operations are disabled.');
    }
}

export async function addDocument<T extends object>(collectionName: CollectionName, data: T): Promise<string> {
    ensureConnectedForWrites();
    const docRef = await adminDb!.collection(collectionName).add(data);
    await revalidateRelevantPaths(collectionName);
    return docRef.id;
}

export async function updateDocument<T extends object>(collectionName: CollectionName, documentId: string, data: Partial<T>): Promise<void> {
    ensureConnectedForWrites();
    const docRef = adminDb!.collection(collectionName).doc(documentId);
    await docRef.set(data, { merge: true });
    await revalidateRelevantPaths(collectionName);
}

export async function setDocument(collectionName: CollectionName, documentId: string, data: any): Promise<void> {
    ensureConnectedForWrites();
    await adminDb!.collection(collectionName).doc(documentId).set(data);
    await revalidateRelevantPaths(collectionName);
}

export async function deleteDocument(collectionName: CollectionName, documentId: string): Promise<void> {
    ensureConnectedForWrites();
    await adminDb!.collection(collectionName).doc(documentId).delete();
    await revalidateRelevantPaths(collectionName);
}

// --- REVALIDATION ---

async function revalidateRelevantPaths(collectionName: CollectionName) {
    // Revalidate the entire site for simplicity on any data change.
    // This is a heavy-handed approach but effective for a site of this scale.
    revalidatePath('/', 'layout');
}

    