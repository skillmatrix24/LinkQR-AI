import { initializeApp, getApps, cert, getApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getStorage, type Storage } from "firebase-admin/storage";

/**
 * Server-side Firebase Admin initialization.
 * Hardened to prevent crashes if the service account key is missing or invalid.
 */
function getAdminApp(): App | null {
  try {
    // Only execute on server side
    if (typeof window !== 'undefined') return null;

    if (getApps().length > 0) {
      return getApp();
    }

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
      if (process.env.NODE_ENV === 'development') {
        console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is not set. Admin features will be disabled.");
      }
      return null;
    }

    let serviceAccount;
    try {
      // Handle potential double-quoting from env vars
      const cleanedKey = (typeof serviceAccountKey === 'string' && serviceAccountKey.startsWith('"') && serviceAccountKey.endsWith('"'))
        ? JSON.parse(serviceAccountKey)
        : serviceAccountKey;
        
      serviceAccount = typeof cleanedKey === 'string' ? JSON.parse(cleanedKey) : cleanedKey;
    } catch (parseError) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it is valid JSON.");
      return null;
    }
    
    return initializeApp({
      credential: cert(serviceAccount),
      storageBucket: "studio-9013164069-59e80.firebasestorage.app"
    });
  } catch (e) {
    console.error("Critical failure initializing Firebase Admin:", e);
    return null;
  }
}

let _app: App | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;
let _storage: Storage | null = null;

function ensureInitialized() {
  if (typeof window !== 'undefined') return;
  
  try {
    if (!_app) {
      _app = getAdminApp();
      if (_app) {
        _db = getFirestore(_app);
        _auth = getAuth(_app);
        _storage = getStorage(_app);
      }
    }
  } catch (err) {
    console.error("Failed to initialize Admin services in ensureInitialized:", err);
  }
}

export const getAdminDb = (): Firestore | null => {
  ensureInitialized();
  return _db;
};

export const getAdminAuth = (): Auth | null => {
  ensureInitialized();
  return _auth;
};

export const getAdminStorage = (): Storage | null => {
  ensureInitialized();
  return _storage;
};
