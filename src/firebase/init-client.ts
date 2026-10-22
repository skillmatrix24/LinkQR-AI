import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

/**
 * Core Firebase initialization logic for the client side.
 * Updated to include Firebase Storage.
 */
export function initializeFirebase(): {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  storage: FirebaseStorage | null;
} {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null, storage: null };
  }

  try {
    const existingApps = getApps();
    const firebaseApp = existingApps.length 
      ? existingApps[0] 
      : initializeApp(firebaseConfig);

    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);
    const storage = getStorage(firebaseApp);

    return { firebaseApp, auth, firestore, storage };
  } catch (err) {
    console.error("Firebase Initialization Error:", err);
    return { firebaseApp: null, auth: null, firestore: null, storage: null };
  }
}
