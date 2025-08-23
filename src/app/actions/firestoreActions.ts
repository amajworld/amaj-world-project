
'use server';

import { adminDb, isFirebaseConnected, ensureFirebaseConnected } from '@/lib/firebaseAdmin';
import { FieldValue, FieldPath } from 'firebase-admin/firestore';
import { promises as fs } from 'fs';
import path from 'path';

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

// --- GENERIC DATA ACCESS FUNCTIONS ---

/**
 * Retrieves multiple documents from a Firestore collection.
 * @param collectionName The name of the collection.
 * @param options Query options like where, orderBy, and limit.
 * @returns An array of documents.
 */
export async function getDocuments<T extends {id?: string}>(
  collectionName: CollectionName,
  options?: {
    where?: [string | FieldPath, FirebaseFirestore.WhereFilterOp, any][];
    orderBy?: [string, 'asc' | 'desc'];
    limit?: number;
  }
): Promise<T[]> {
  ensureFirebaseConnected();
  if (!isFirebaseConnected || !adminDb) {
    console.warn(`Database not connected. Attempting to read from local fallback for ${collectionName}.`);
    return readFromLocalFallback(collectionName);
  }

  try {
    let query: FirebaseFirestore.Query = adminDb.collection(collectionName);

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
    console.error(`Error getting documents from ${collectionName} in Firestore, trying local fallback:`, error);
    return readFromLocalFallback(collectionName);
  }
}

/**
 * Retrieves a single document from a Firestore collection.
 * @param collectionName The name of the collection.
 * @param documentId The ID of the document.
 * @returns The document data or null if not found.
 */
export async function getDocument<T extends object>(collectionName: CollectionName, documentId: string): Promise<T | null> {
  ensureFirebaseConnected();
  if (!isFirebaseConnected || !adminDb) {
    console.warn(`Database not connected. Attempting to read from local fallback for ${collectionName}/${documentId}.`);
    return readFromLocalFallback(collectionName, documentId);
  }

  try {
    const docRef = adminDb.collection(collectionName).doc(documentId);
    const docSnap = await docRef.get();
    return docSnap.exists ? ({ id: docSnap.id, ...docSnap.data() } as T) : null;
  } catch (error) {
    console.error(`Error getting document ${documentId} from ${collectionName}, trying local fallback:`, error);
    return readFromLocalFallback(collectionName, documentId);
  }
}

/**
 * Adds a new document to a Firestore collection with a randomly generated ID.
 * @param collectionName The name of the collection.
 * @param data The data for the new document.
 * @returns The ID of the newly created document.
 */
export async function addDocument<T extends object>(collectionName: CollectionName, data: T): Promise<string> {
    ensureFirebaseConnected();
    if (!isFirebaseConnected || !adminDb) {
        throw new Error('Database not connected. Cannot add document.');
    }
    try {
        const docRef = await adminDb.collection(collectionName).add(data);
        return docRef.id;
    } catch (error) {
        console.error(`Error adding document to ${collectionName}:`, error);
        throw new Error('Failed to add document.');
    }
}

/**
 * Updates an existing document in a Firestore collection.
 * @param collectionName The name of the collection.
 * @param documentId The ID of the document to update.
 * @param data The partial data to merge with the existing document.
 */
export async function updateDocument<T extends object>(collectionName: CollectionName, documentId: string, data: Partial<T>): Promise<void> {
    ensureFirebaseConnected();
    if (!isFirebaseConnected || !adminDb) {
        throw new Error('Database not connected. Cannot update document.');
    }
    try {
        const docRef = adminDb.collection(collectionName).doc(documentId);
        await docRef.set(data, { merge: true });
    } catch (error) {
        console.error(`Error updating document ${documentId} in ${collectionName}:`, error);
        throw new Error('Failed to update document.');
    }
}

/**
 * Sets a document in a Firestore collection, overwriting it if it exists.
 * @param collectionName The name of the collection.
 * @param documentId The ID of the document to set.
 * @param data The data for the document.
 */
export async function setDocument(collectionName: CollectionName, documentId: string, data: any): Promise<void> {
    ensureFirebaseConnected();
    if (!isFirebaseConnected || !adminDb) {
        throw new Error('Database not connected. Cannot set document.');
    }
    try {
        await adminDb.collection(collectionName).doc(documentId).set(data);
    } catch (error) {
        console.error(`Error setting document ${documentId} in ${collectionName}:`, error);
        throw new Error('Failed to set document.');
    }
}


/**
 * Deletes a document from a Firestore collection.
 * @param collectionName The name of the collection.
 * @param documentId The ID of the document to delete.
 */
export async function deleteDocument(collectionName: CollectionName, documentId: string): Promise<void> {
    ensureFirebaseConnected();
    if (!isFirebaseConnected || !adminDb) {
        throw new Error('Database not connected. Cannot delete document.');
    }
    try {
        await adminDb.collection(collectionName).doc(documentId).delete();
    } catch (error) {
        console.error(`Error deleting document ${documentId} from ${collectionName}:`, error);
        throw new Error('Failed to delete document.');
    }
}

/**
 * Retrieves paginated documents, specifically for the 'posts' collection.
 * @param collectionName Must be 'posts'.
 * @param options Pagination and query options.
 * @returns An object containing the documents, total pages, and total document count.
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
    ensureFirebaseConnected();
    if (!isFirebaseConnected || !adminDb) {
        console.warn('Database not connected. Cannot get paginated documents.');
        // Basic fallback for local development if needed
        const allPosts = await readFromLocalFallback<T>('posts');
        const totalDocs = allPosts.length;
        const totalPages = Math.ceil(totalDocs / options.limit);
        const startIndex = (options.page - 1) * options.limit;
        const documents = allPosts.slice(startIndex, startIndex + options.limit);
        return { documents, totalPages, totalDocs };
    }
    
    const { page, limit, where, orderBy } = options;
    const collectionRef = adminDb.collection(collectionName);
    
    let queryForTotal: FirebaseFirestore.Query = collectionRef;
    if (where) {
        for (const w of where) {
            queryForTotal = queryForTotal.where(w[0], w[1], w[2]);
        }
    }
    const totalSnapshot = await queryForTotal.count().get();
    const totalDocs = totalSnapshot.data().count;
    const totalPages = Math.ceil(totalDocs / limit);
    
    let query = queryForTotal;
    if (orderBy) {
      query = query.orderBy(orderBy[0], orderBy[1]);
    }
    
    query = query.limit(limit).offset((page - 1) * limit);

    const documentsSnapshot = await query.get();
    const documents = documentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));

    return { documents, totalPages, totalDocs };
}

// --- LOCAL FALLBACK FUNCTIONS ---

const localDataFiles = {
  'posts': 'posts.json',
  'site-data': 'site-data.json',
  'socialLinks': 'social-links.json',
  'heroSlides': 'hero-slides.json',
  'ads': 'ads.json',
  'menu': 'menu.ts' // Special case
};

async function readFromLocalFallback<T extends {id?: string}>(collectionName: string, documentId?: string): Promise<any> {
    const fileName = (localDataFiles as any)[collectionName];
    if (!fileName) {
        console.error(`No local fallback file defined for collection: ${collectionName}`);
        return documentId ? null : [];
    }

    // Special handling for menu as it's a .ts file
    if (collectionName === 'site-data' && documentId === 'menu') {
        try {
            const { menuData } = await import('@/data/menu');
            return { id: 'menu', data: menuData };
        } catch (e) {
            console.error('Error reading local menu.ts fallback:', e);
            return null;
        }
    }
    
    if (collectionName === 'site-data' && documentId === 'settings') {
        try {
            const filePath = path.join(process.cwd(), 'src', 'data', 'site-settings.json');
            const fileContent = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(fileContent);
        } catch(e) {
            return {};
        }
    }

    try {
        const filePath = path.join(process.cwd(), 'src', 'data', fileName);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(fileContent);

        if (documentId) {
            if (Array.isArray(data)) {
                 // The 'id' might be a number or a string in JSON files
                const doc = data.find(item => String(item.id) === String(documentId));
                return doc || null;
            } else if (typeof data === 'object' && data !== null) {
                // For single-object JSON files like site-settings.json
                return data;
            }
            return null;
        } else {
            return Array.isArray(data) ? data : [];
        }
    } catch (error) {
        console.error(`Failed to read local fallback file ${fileName}:`, error);
        return documentId ? null : [];
    }
}
