
'use server';

import { adminDb, isFirebaseConnected } from '@/lib/firebaseAdmin';
import type { Post } from '@/data/posts';
import type { MenuItem } from '@/app/admin/menu/page';
import type { SiteSettings } from '@/app/admin/settings/page';
import type { SocialLink } from '@/app/admin/social-links/page';
import type { SlideConfig } from '@/app/admin/hero-slider/page';
import type { AdConfig } from '@/app/admin/ads/page';

import * as fs from 'fs/promises';
import path from 'path';

// --- Local JSON File Data Access ---
const dataFilePath = path.join(process.cwd(), 'src', 'data', 'posts.json');

async function readPostsFile(): Promise<Post[]> {
    try {
        const fileContent = await fs.readFile(dataFilePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return [];
        }
        console.error("Error reading posts.json:", error);
        return [];
    }
}

async function writePostsFile(data: Post[]): Promise<void> {
    try {
        await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error("Error writing to posts.json:", error);
    }
}

// Collection types for Firestore
type CollectionName = 'posts' | 'site-data' | 'socialLinks' | 'heroSlides' | 'ads';

// --- UNIFIED DATA ACCESS FUNCTIONS ---

// Generic function to get all documents from a collection
export async function getDocuments<T>(
  collectionName: CollectionName,
  options?: {
    where?: [string, FirebaseFirestore.WhereFilterOp, any][];
    orderBy?: [string, 'asc' | 'desc'];
    limit?: number;
  }
): Promise<T[]> {
  if (isFirebaseConnected && adminDb) {
      try {
        let query: FirebaseFirestore.Query = adminDb.collection(collectionName);
        if (options?.where) {
          for (const w of options.where) { query = query.where(w[0], w[1], w[2]); }
        }
        if (options?.orderBy) { query = query.orderBy(options.orderBy[0], options.orderBy[1]); }
        if (options?.limit) { query = query.limit(options.limit); }
        const snapshot = await query.get();
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
      } catch (error) {
        console.error(`Error fetching documents from Firestore (${collectionName}):`, error);
        throw new Error('Failed to fetch data from database.');
      }
  } else {
    // Local JSON fallback
    if (collectionName === 'posts') {
        let posts = await readPostsFile() as any[];
        // Basic filtering for local implementation
        if (options?.where) {
            for (const w of options.where) {
                posts = posts.filter(p => p[w[0]] === w[2]);
            }
        }
        if (options?.orderBy) {
             posts.sort((a, b) => {
                const aVal = a[options.orderBy![0]];
                const bVal = b[options.orderBy![0]];
                if (aVal < bVal) return options.orderBy![1] === 'asc' ? -1 : 1;
                if (aVal > bVal) return options.orderBy![1] === 'asc' ? 1 : -1;
                return 0;
            });
        }
        if (options?.limit) {
            posts = posts.slice(0, options.limit);
        }
        return posts as T[];
    }
    console.warn(`Local mode: getDocuments for '${collectionName}' is not fully implemented and returns an empty array.`);
    return [];
  }
}

// Generic function to get a single document by ID
export async function getDocument<T>(collectionName: CollectionName, documentId: string): Promise<T | null> {
    if (isFirebaseConnected && adminDb) {
        try {
            const docRef = adminDb.collection(collectionName).doc(documentId);
            const docSnap = await docRef.get();
            if (!docSnap.exists) return null;
            return { id: docSnap.id, ...docSnap.data() } as T;
        } catch (error) {
            console.error(`Error fetching document from Firestore (${documentId}):`, error);
            throw new Error('Failed to fetch document from database.');
        }
    } else {
        if (collectionName === 'posts') {
            const posts = await readPostsFile();
            const post = posts.find(p => p.id === documentId);
            return (post as T) || null;
        }
        console.warn(`Local mode: getDocument for '${collectionName}' is not implemented and returns null.`);
        return null;
    }
}

// Generic function to add a document to a collection
export async function addDocument<T extends object>(collectionName: CollectionName, data: T): Promise<string> {
    if (isFirebaseConnected && adminDb) {
        try {
            const docRef = await adminDb.collection(collectionName).add(data);
            return docRef.id;
        } catch (error) {
            console.error(`Error adding document to Firestore (${collectionName}):`, error);
            throw new Error('Failed to add document to database.');
        }
    } else {
        if (collectionName === 'posts') {
            const posts = await readPostsFile();
            const newId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
            const newPostWithId = { ...data, id: newId };
            posts.push(newPostWithId as Post);
            await writePostsFile(posts);
            return newId;
        }
        console.warn(`Local mode: addDocument for '${collectionName}' is not implemented.`);
        return '';
    }
}

// Generic function to update a document
export async function updateDocument<T extends object>(collectionName: CollectionName, documentId: string, data: Partial<T>): Promise<void> {
    if (isFirebaseConnected && adminDb) {
        try {
            const docRef = adminDb.collection(collectionName).doc(documentId);
            await docRef.set(data, { merge: true });
        } catch (error) {
            console.error(`Error updating document in Firestore (${documentId}):`, error);
            throw new Error('Failed to update document in database.');
        }
    } else {
        if (collectionName === 'posts') {
            let posts = await readPostsFile();
            const index = posts.findIndex(p => p.id === documentId);
            if (index !== -1) {
                posts[index] = { ...posts[index], ...data };
                await writePostsFile(posts);
            }
            return;
        }
        console.warn(`Local mode: updateDocument for '${collectionName}' is not implemented.`);
    }
}

// Generic function to delete a document
export async function deleteDocument(collectionName: CollectionName, documentId: string): Promise<void> {
    if (isFirebaseConnected && adminDb) {
        try {
            const docRef = adminDb.collection(collectionName).doc(documentId);
            await docRef.delete();
        } catch (error) {
            console.error(`Error deleting document from Firestore (${documentId}):`, error);
            throw new Error('Failed to delete document from database.');
        }
    } else {
        if (collectionName === 'posts') {
            let posts = await readPostsFile();
            posts = posts.filter(p => p.id !== documentId);
            await writePostsFile(posts);
            return;
        }
        console.warn(`Local mode: deleteDocument for '${collectionName}' is not implemented.`);
    }
}

// Paginated get for posts
export async function getPaginatedDocuments<T>(
  collectionName: 'posts',
  options: {
    page: number;
    limit: number;
    where?: [string, any, any][];
    orderBy?: [string, 'asc' | 'desc'];
  }
): Promise<{ documents: T[]; totalPages: number, totalDocs: number }> {
    const { page, limit, where, orderBy } = options;

    if (isFirebaseConnected && adminDb) {
        // Firestore implementation remains the same
        try {
            let collectionRef: FirebaseFirestore.Query = adminDb.collection(collectionName);
            let countQuery = collectionRef;
            if (where) { for (const w of where) { countQuery = countQuery.where(w[0], w[1], w[2]); } }
            const totalDocsSnapshot = await countQuery.count().get();
            const totalDocs = totalDocsSnapshot.data().count;
            const totalPages = Math.ceil(totalDocs / limit);

            let query: FirebaseFirestore.Query = collectionRef;
            if (where) { for (const w of where) { query = query.where(w[0], w[1], w[2]); } }
            if (orderBy) { query = query.orderBy(orderBy[0], orderBy[1]); }
            query = query.limit(limit).offset((page - 1) * limit);

            const snapshot = await query.get();
            const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
            
            return { documents, totalPages, totalDocs };
        } catch (error) {
            console.error(`Error fetching paginated documents from ${collectionName}:`, error);
            throw new Error('Failed to fetch paginated data from database.');
        }
    } else {
        // Local JSON fallback implementation
        let allPosts = await readPostsFile();
        
        let filteredPosts = allPosts;
        if (where) {
            for (const w of where) {
                // This is a simplified filter for local files, assuming '=='
                 filteredPosts = filteredPosts.filter(p => p[w[0]] === w[2]);
            }
        }

        if (orderBy) {
            filteredPosts.sort((a, b) => {
                const aValue = a[orderBy[0] as keyof Post] || '';
                const bValue = b[orderBy[0] as keyof Post] || '';
                if (aValue < bValue) return orderBy[1] === 'asc' ? -1 : 1;
                if (aValue > bValue) return orderBy[1] === 'asc' ? 1 : -1;
                return 0;
            });
        }
        
        const totalDocs = filteredPosts.length;
        const totalPages = Math.ceil(totalDocs / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const documents = filteredPosts.slice(startIndex, endIndex);
        
        return { documents: documents as unknown as T[], totalPages, totalDocs };
    }
}
