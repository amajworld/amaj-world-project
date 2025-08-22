
'use server';

import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import localPostsData from '@/data/posts.json';
import { menuData as localMenu } from '@/data/menu';
import localSocialLinks from '@/data/social-links.json';
import localHeroSlides from '@/data/hero-slides.json';
import localAds from '@/data/ads.json';
import localSiteSettings from '@/data/site-settings.json';

// --- TYPE DEFINITIONS ---
import type { Post } from '@/data/posts';
import type { MenuItem } from '@/app/admin/menu/page';
import type { SiteSettings } from '@/app/admin/settings/page';
import type { SocialLink } from '@/app/admin/social-links/page';
import type { SlideConfig } from '@/app/admin/hero-slider/page';
import type { AdConfig } from '@/app/admin/ads/page';

type CollectionName = 'posts' | 'site-data' | 'socialLinks' | 'heroSlides' | 'ads';

type DocumentType<T extends CollectionName> = T extends 'posts'
  ? Post
  : T extends 'site-data'
  ? { id: string, data?: any } | SiteSettings | SocialLink[]
  : T extends 'socialLinks'
  ? SocialLink
  : T extends 'heroSlides'
  ? SlideConfig
  : T extends 'ads'
  ? AdConfig
  : never;


// --- UNIFIED DATA ACCESS FUNCTIONS ---

// Generic function to get all documents from a collection
export async function getDocuments<T extends {id?: string}>(
  collectionName: CollectionName,
  options?: {
    where?: [string, FirebaseFirestore.WhereFilterOp, any][];
    orderBy?: [string, 'asc' | 'desc'];
    limit?: number;
  }
): Promise<T[]> {
  if (!adminDb) {
    console.warn(`Firestore is not connected. Returning local data for ${collectionName}.`);
    // Local fallback logic
    switch (collectionName) {
        case 'posts':
            return JSON.parse(JSON.stringify(localPostsData)) as T[];
        case 'socialLinks':
            return JSON.parse(JSON.stringify(localSocialLinks)) as T[];
        case 'heroSlides':
            return JSON.parse(JSON.stringify(localHeroSlides)) as T[];
        case 'ads':
            return JSON.parse(JSON.stringify(localAds)) as T[];
        case 'site-data':
            // This is a bit tricky as site-data can hold different things
            const menu = { id: 'menu', data: localMenu };
            const settings = { id: 'settings', ...localSiteSettings };
            return [menu, settings] as unknown as T[];
        default:
            return [];
    }
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
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    return [];
  }
}

// Generic function to get a single document by ID
export async function getDocument<T extends object>(collectionName: CollectionName, documentId: string): Promise<T | null> {
  if (!adminDb) {
    console.warn(`Firestore is not connected. Returning local data for '${documentId}'.`);
     // Local fallback logic for specific single documents
    if (collectionName === 'site-data') {
        if (documentId === 'menu') {
            return { data: localMenu } as T;
        }
        if (documentId === 'settings') {
            return localSiteSettings as T;
        }
    }
    if (collectionName === 'posts') {
        const post = localPostsData.find(p => p.id === documentId);
        return post ? post as T : null;
    }
    return null;
  }

  try {
    const docRef = adminDb.collection(collectionName).doc(documentId);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error(`Error getting document ${documentId} from ${collectionName}:`, error);
    return null;
  }
}

// Generic function to add a document to a collection
export async function addDocument<T extends object>(collectionName: CollectionName, data: T): Promise<string> {
    if (!adminDb) {
        console.error('Firestore is not connected. Cannot add document.');
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

// Generic function to update a document
export async function updateDocument<T extends object>(collectionName: CollectionName, documentId: string, data: Partial<T>): Promise<void> {
    if (!adminDb) {
        console.error('Firestore is not connected. Cannot update document.');
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

// Generic function to delete a document
export async function deleteDocument(collectionName: CollectionName, documentId: string): Promise<void> {
    if (!adminDb) {
        console.error('Firestore is not connected. Cannot delete document.');
        throw new Error('Database not connected. Cannot delete document.');
    }
    try {
        await adminDb.collection(collectionName).doc(documentId).delete();
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
    where?: [string, '==', any][];
    orderBy?: [string, 'asc' | 'desc'];
  }
): Promise<{ documents: T[]; totalPages: number, totalDocs: number }> {
    if (!adminDb) {
        console.warn('Firestore is not connected. Cannot get paginated documents.');
        // Local fallback
        const filteredPosts = localPostsData.filter(p => p.status === 'published');
        const totalDocs = filteredPosts.length;
        const totalPages = Math.ceil(totalDocs / options.limit);
        const documents = filteredPosts.slice((options.page - 1) * options.limit, options.page * options.limit);
        return { documents: documents as T[], totalPages, totalDocs };
    }
    
    const { page, limit, where, orderBy } = options;
    const collectionRef = adminDb.collection(collectionName);
    
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
