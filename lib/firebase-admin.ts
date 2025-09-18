import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

const rawBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert(serviceAccount as any),
      storageBucket: rawBucket,
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    console.error('Check FIREBASE_PRIVATE_KEY in .env.local - it must be the full PEM string with literal \\n');
    // Fallback: do not initialize, exports will be undefined, handle in code
  }
}

let adminDb, adminAuth, adminStorage;

if (getApps().length > 0) {
  adminDb = getFirestore();
  adminAuth = getAuth();
  adminStorage = getStorage();
} else {
  adminDb = null;
  adminAuth = null;
  adminStorage = null;
}

export { adminDb, adminAuth, adminStorage };