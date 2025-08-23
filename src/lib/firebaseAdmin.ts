import admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;
let isFirebaseConnected = false;

function ensureFirebaseConnected() {
  if (admin.apps.length > 0) {
    // If already initialized, just ensure exports are set and return
    if (!adminDb) adminDb = admin.firestore();
    if (!adminAuth) adminAuth = admin.auth();
    isFirebaseConnected = true; // Assume connected if initialized
    return;
  }

  try {
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      adminDb = admin.firestore();
      adminAuth = admin.auth();
      isFirebaseConnected = true;
      console.log('Firebase Admin SDK initialized successfully.');
    } else {
      isFirebaseConnected = false;
      console.log('Firebase Admin SDK credentials not found. Running in local mode.');
    }
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.stack);
    isFirebaseConnected = false;
  }
}

// Initial call to set up the connection status
ensureFirebaseConnected();

export { adminDb, adminAuth, isFirebaseConnected, ensureFirebaseConnected };