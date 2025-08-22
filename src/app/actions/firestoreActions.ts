
'use server';

import { adminDb, isFirebaseConnected } from '@/lib/firebaseAdmin';
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

type CollectionTypeMap = {
    'posts': Post;
    'site-data': { id: string, data?: any } | SiteSettings | SocialLink[];
    'socialLinks': SocialLink;
    'heroSlides': SlideConfig;
    'ads': AdConfig;
};

// --- DATA ACCESS FUNCTIONS ---

export async function getDocuments<T extends {id?: string}>(
  collectionName: CollectionName,
  options?: {
    where?: [string | FieldPath, FirebaseFirestore.WhereFilterOp, any][];
    orderBy?: [string, 'asc' | 'desc'];
    limit?: number;
  }
): Promise<T[]> {
  if (!isFirebaseConnected || !adminDb) {
    console.error('Database not connected. Cannot get documents.');
    return [];
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
    console.error(`Error getting documents from ${collectionName}:`, error);
    return [];
  }
}

export async function getDocument<T extends object>(collectionName: CollectionName, documentId: string): Promise<T | null> {
  if (!isFirebaseConnected || !adminDb) {
    console.error('Database not connected. Cannot get document.');
    return null;
  }

  try {
    const docRef = adminDb.collection(collectionName).doc(documentId);
    const docSnap = await docRef.get();
    return docSnap.exists ? ({ id: docSnap.id, ...docSnap.data() } as T) : null;
  } catch (error) {
    console.error(`Error getting document ${documentId} from ${collectionName}:`, error);
    return null;
  }
}

export async function addDocument<T extends object>(collectionName: CollectionName, data: T): Promise<string> {
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

export async function updateDocument<T extends object>(collectionName: CollectionName, documentId: string, data: Partial<T>): Promise<void> {
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

export async function deleteDocument(collectionName: CollectionName, documentId: string): Promise<void> {
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
    if (!isFirebaseConnected || !adminDb) {
        console.error('Database not connected. Cannot get paginated documents.');
        return { documents: [], totalPages: 0, totalDocs: 0 };
    }
    
    const { page, limit, where, orderBy } = options;
    const collectionRef = adminDb.collection(collectionName);
    
    let queryForTotal: FirebaseFirestore.Query = collectionRef;
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
