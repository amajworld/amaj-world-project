import admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;
let isFirebaseConnected = false;

try {
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    }
    adminDb = admin.firestore();
    adminAuth = admin.auth();
    isFirebaseConnected = true;
    console.log('Firebase Admin SDK connected successfully.');
  } else {
    console.warn(
      'Firebase environment variables are not set. App is in a disconnected state. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.'
    );
  }
} catch (error: any) {
  console.error('Firebase Admin SDK initialization error:', error.stack);
}

export { adminDb, adminAuth, isFirebaseConnected };