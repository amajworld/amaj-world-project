
'use server';

import { adminDb, isFirebaseConnected } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
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

type CollectionTypeMap = {
    'posts': Post;
    'site-data': { id: string, data?: any } | SiteSettings | SocialLink[];
    'socialLinks': SocialLink;
    'heroSlides': SlideConfig;
    'ads': AdConfig;
};

// --- LOCAL DATA HANDLING ---

// A simple in-memory cache to avoid reading files repeatedly within a single request.
const localCache: { [key: string]: any } = {};

async function readLocalData(collectionName: CollectionName) {
    if (localCache[collectionName]) {
        return localCache[collectionName];
    }
    const filePath = path.join(process.cwd(), 'src', 'data', `${collectionName}.json`);
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        localCache[collectionName] = data;
        return data;
    } catch (error) {
        console.error(`Error reading local data for ${collectionName}:`, error);
        // Return a default empty state if file doesn't exist or is invalid
        return collectionName === 'site-data' ? { menu: [], settings: {} } : [];
    }
}

async function writeLocalData(collectionName: CollectionName, data: any) {
    const filePath = path.join(process.cwd(), 'src', 'data', `${collectionName}.json`);
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        // Invalidate cache
        delete localCache[collectionName];
    } catch (error) {
        console.error(`Error writing local data for ${collectionName}:`, error);
    }
}

// --- UNIFIED DATA ACCESS FUNCTIONS ---

export async function getDocuments<T extends {id?: string}>(
  collectionName: CollectionName,
  options?: {
    where?: [string | FieldPath, FirebaseFirestore.WhereFilterOp, any][];
    orderBy?: [string, 'asc' | 'desc'];
    limit?: number;
  }
): Promise<T[]> {
  if (!isFirebaseConnected) {
    // Local fallback logic
    console.warn(`Firestore not connected. Reading from local file: ${collectionName}.json`);
    let data = await readLocalData(collectionName);
    
    // Handle special case for site-data
    if (collectionName === 'site-data') {
      const menu = { id: 'menu', data: data.menu || [] };
      const settings = { id: 'settings', ...(data.settings || {}) };
      return [menu, settings] as unknown as T[];
    }
    
    // Apply local filtering
    if (options?.where) {
        for (const [field, op, value] of options.where) {
            if (op === '==') {
                data = data.filter((item: any) => item[field as string] === value);
            } else if (op === 'in') {
                data = data.filter((item: any) => value.includes(item[field as string]));
            }
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
    return data as T[];
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
    console.error(`Error getting documents from ${collectionName}:`, error);
    return [];
  }
}

export async function getDocument<T extends object>(collectionName: CollectionName, documentId: string): Promise<T | null> {
  if (!isFirebaseConnected) {
    console.warn(`Firestore not connected. Reading from local file for doc: ${documentId}`);
    const data = await readLocalData(collectionName);
    if (collectionName === 'site-data') {
        return (data[documentId] ? { id: documentId, ...data[documentId] } : null) as T;
    }
    const item = data.find((d: any) => d.id === documentId);
    return item ? (item as T) : null;
  }

  try {
    const docRef = adminDb!.collection(collectionName).doc(documentId);
    const docSnap = await docRef.get();
    return docSnap.exists ? ({ id: docSnap.id, ...docSnap.data() } as T) : null;
  } catch (error) {
    console.error(`Error getting document ${documentId} from ${collectionName}:`, error);
    return null;
  }
}

export async function addDocument<T extends object>(collectionName: CollectionName, data: T): Promise<string> {
    if (!isFirebaseConnected) {
        const newId = `local-${Date.now()}`;
        const dataWithId = { ...data, id: newId };

        const allData = await readLocalData(collectionName);
        allData.push(dataWithId);
        await writeLocalData(collectionName, allData);
        
        console.warn(`Firestore not connected. Added document locally to ${collectionName}.json with ID: ${newId}`);
        return newId;
    }
    try {
        const docRef = await adminDb!.collection(collectionName).add(data);
        return docRef.id;
    } catch (error) {
        console.error(`Error adding document to ${collectionName}:`, error);
        throw new Error('Failed to add document.');
    }
}

export async function updateDocument<T extends object>(collectionName: CollectionName, documentId: string, data: Partial<T>): Promise<void> {
    if (!isFirebaseConnected) {
        let allData = await readLocalData(collectionName);
        const docIndex = allData.findIndex((doc: any) => doc.id === documentId);
        
        if (docIndex !== -1) {
            allData[docIndex] = { ...allData[docIndex], ...data };
            await writeLocalData(collectionName, allData);
            console.warn(`Firestore not connected. Updated document locally in ${collectionName}.json with ID: ${documentId}`);
        } else {
            console.warn(`Firestore not connected. Document with ID ${documentId} not found for update.`);
        }
        return;
    }
    try {
        const docRef = adminDb!.collection(collectionName).doc(documentId);
        await docRef.set(data, { merge: true });
    } catch (error) {
        console.error(`Error updating document ${documentId} in ${collectionName}:`, error);
        throw new Error('Failed to update document.');
    }
}

export async function deleteDocument(collectionName: CollectionName, documentId: string): Promise<void> {
    if (!isFirebaseConnected) {
        let allData = await readLocalData(collectionName);
        const updatedData = allData.filter((doc: any) => doc.id !== documentId);
        
        if (allData.length !== updatedData.length) {
            await writeLocalData(collectionName, updatedData);
            console.warn(`Firestore not connected. Deleted document locally from ${collectionName}.json with ID: ${documentId}`);
        } else {
             console.warn(`Firestore not connected. Document with ID ${documentId} not found for deletion.`);
        }
        return;
    }
    try {
        await adminDb!.collection(collectionName).doc(documentId).delete();
    } catch (error) {
        console.error(`Error deleting document ${documentId} from ${collectionName}:`, error);
        throw new Error('Failed to delete document.');
    }
}

// Paginated get for posts
export async function getPaginatedDocuments<T extends {id?: string}>(
  collectionName: 'posts',
  options: {
    page: number;
    limit: number;
    where?: [string, FirebaseFirestore.WhereFilterOp, any][];
    orderBy?: [string, 'asc' | 'desc'];
  }
): Promise<{ documents: T[]; totalPages: number, totalDocs: number }> {
    if (!isFirebaseConnected) {
        console.warn('Firestore is not connected. Using local data for pagination.');
        let allPosts = await readLocalData('posts');

        if (options.where) {
            for (const [field, op, value] of options.where) {
                 if (op === '==') {
                    allPosts = allPosts.filter((p: any) => p[field as string] === value);
                 }
            }
        }
        
        const totalDocs = allPosts.length;
        const totalPages = Math.ceil(totalDocs / options.limit);
        const documents = allPosts.slice((options.page - 1) * options.limit, options.page * options.limit);
        
        return { documents: documents as T[], totalPages, totalDocs };
    }
    
    const { page, limit, where, orderBy } = options;
    const collectionRef = adminDb!.collection(collectionName);
    
    let queryForTotal = collectionRef as FirebaseFirestore.Query;
     if (where) {
        for (const w of where) {
            queryForTotal = queryForTotal.where(w[0], '==', w[2]);
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
