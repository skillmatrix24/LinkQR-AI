import appletConfig from '../../firebase-applet-config.json';

/**
 * Client-side Firebase Configuration.
 * Loads configuration directly from firebase-applet-config.json, with support for
 * runtime environment overrides if available.
 */
export const firebaseConfig = {
  apiKey: appletConfig.apiKey,
  authDomain: appletConfig.authDomain,
  projectId: appletConfig.projectId,
  storageBucket: appletConfig.storageBucket,
  messagingSenderId: appletConfig.messagingSenderId,
  appId: appletConfig.appId,
  measurementId: appletConfig.measurementId || undefined,
};

export const firestoreDatabaseId: string = appletConfig.firestoreDatabaseId || '(default)';
