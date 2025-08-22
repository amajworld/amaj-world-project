import admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;
let isFirebaseConnected = false;

function ensureFirebaseConnected() {
  if (isFirebaseConnected && admin.apps.length > 0) {
      // If already connected and initialized, ensure exports are set
      if (!adminDb) adminDb = admin.firestore();
      if (!adminAuth) adminAuth = admin.auth();
      return;
  }

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
      adminAuth = admin.auth(); // Set adminAuth here
      isFirebaseConnected = true;
    } else {
      isFirebaseConnected = false;
    }
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.stack);
    isFirebaseConnected = false;
  }
}

export { adminDb, adminAuth, isFirebaseConnected, ensureFirebaseConnected };
