
import admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

// Check if the required environment variables for Firebase Admin are set.
const hasFirebaseEnvVars = 
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    (process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY_B64);

// We will only initialize Firebase if the environment variables are present.
if (hasFirebaseEnvVars) {
  if (!admin.apps.length) {
    try {
      // The private key can be provided directly or as a Base64 encoded string.
      // Base64 is preferred for environments that have issues with newlines in variables.
      const privateKey = process.env.FIREBASE_PRIVATE_KEY_B64
        ? Buffer.from(process.env.FIREBASE_PRIVATE_KEY_B64, 'base64').toString('utf-8')
        : process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n');
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          privateKey: privateKey,
        }),
      });

      adminDb = admin.firestore();
      adminAuth = admin.auth();
      console.log('Firebase Admin SDK initialized successfully.');

    } catch (error: any) {
      console.error('Firebase admin initialization error:', error.stack);
      console.error('Check your FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY_B64 environment variables.');
    }
  } else {
    // If admin.apps.length is not 0, it means it's already initialized.
    // In Next.js hot-reloading environment, this can happen.
    // We can safely assume adminDb and adminAuth are available.
    if (!adminDb) adminDb = admin.firestore();
    if (!adminAuth) adminAuth = admin.auth();
  }
} else if (!admin.apps.length) {
    console.log('Firebase Admin SDK not initialized: Required environment variables are missing. Using local JSON files as fallback.');
}

// A boolean to export, indicating if the app is connected to a real Firebase backend.
const isFirebaseConnected = !!adminDb;

if (typeof process.env.VERCEL_ENV !== 'undefined' && process.env.VERCEL_ENV !== '') {
    console.log(`Running on Vercel Environment: ${process.env.VERCEL_ENV}`);
    console.log(`Firebase Connected: ${isFirebaseConnected}`);
    if (!isFirebaseConnected) {
        console.warn('CRITICAL: Vercel environment detected but Firebase is NOT connected. Check environment variables.');
    }
}


export { adminDb, adminAuth, isFirebaseConnected };
