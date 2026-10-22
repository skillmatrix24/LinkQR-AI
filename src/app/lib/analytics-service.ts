import { collection, addDoc, serverTimestamp, Firestore } from 'firebase/firestore';

/**
 * Privacy-minimal Analytics Tracker for Click Events.
 * Dispatches a fire-and-forget write to Firestore.
 */
export const trackClickEvent = (
  db: Firestore | null,
  userId: string,
  cardId: string,
  collectionName: string,
  type: string,
  metadata: any = {}
) => {
  if (!db || !userId || !cardId) return;

  // Determination of device type for simple segmentation
  const deviceType = typeof window !== 'undefined' && 
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';

  // Path: users/{userId}/{collection}/{cardId}/clickevents
  const clickEventsRef = collection(db, "users", userId, collectionName, cardId, "clickevents");

  // Non-blocking write
  addDoc(clickEventsRef, {
    type,
    ...metadata,
    deviceType,
    timestamp: serverTimestamp()
  }).catch(() => {
    // Fail silently to ensure no impact on user experience
  });
};
