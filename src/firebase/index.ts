/**
 * Firebase Client SDK Entry Point.
 * Centralizes exports for the application while avoiding circular references.
 */

export { initializeFirebase } from './init-client';

export {
  FirebaseProvider,
  useFirebase,
  useAuth,
  useFirestore,
  useStorage,
  useFirebaseApp,
  useUser,
  useMemoFirebase,
} from './provider';

export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
