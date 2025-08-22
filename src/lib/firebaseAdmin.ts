import admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;
let isFirebaseConnected = false;

function ensureFirebaseConnected() {
  if (isFirebaseConnected) return;

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
    } else {
      isFirebaseConnected = false;
    }
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.stack);
    isFirebaseConnected = false;
  }
}

export { adminDb, adminAuth, isFirebaseConnected, ensureFirebaseConnected };
