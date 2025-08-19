
import admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

// Check if the required environment variables for Firebase Admin are set.
const hasFirebaseEnvVars = 
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    (process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY_B64);

// We will only initialize Firebase if the environment variables are present.
if (hasFirebaseEnvVars && !admin.apps.length) {
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
    console.log('Firebase Admin SDK initialized successfully from environment variables.');

  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.stack);
  }
} else if (!admin.apps.length) {
    console.log('Firebase Admin SDK not initialized: Credentials not found in environment variables. Using local JSON files as fallback.');
}

// A boolean to export, indicating if the app is connected to a real Firebase backend.
const isFirebaseConnected = !!adminDb;

export { adminDb, adminAuth, isFirebaseConnected };
