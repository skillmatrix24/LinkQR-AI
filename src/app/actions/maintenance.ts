'use server';

import { getAdminDb, getAdminStorage } from "@/lib/firebase-admin";
import { subDays } from "date-fns";

/**
 * Server Action to cleanup storage for expired users.
 * Targets users whose plan expired more than 30 days ago.
 * Fix 4: Implemented Batched Processing (50 users per run) to prevent Server Action Timeouts.
 * CRITICAL: Preserves 'logos/' folder to ensure printed QR codes stay visually intact.
 */
export async function cleanupExpiredStorageAction() {
  try {
    const db = getAdminDb();
    const storage = getAdminStorage();
    if (!db || !storage) return { success: false, error: "SERVICES_OFFLINE" };

    const bucket = storage.bucket();
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    // Fetch in a small batch of 50 to ensure we stay within the 30-60s execution limit
    const expiredUsersSnap = await db.collection("users")
      .where("planExpiryDate", "<", thirtyDaysAgo)
      .limit(50) 
      .get();

    if (expiredUsersSnap.empty) {
      return { success: true, count: 0, message: "No pending expired accounts found in this batch." };
    }

    let purgedCount = 0;
    const batch = db.batch();

    for (const userDoc of expiredUsersSnap.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;

      // Skip if admin or already purged
      if (userData.isAdmin || userData.storagePurgedAt) {
        batch.update(userDoc.ref, { storagePurgedAt: new Date() });
        continue;
      }

      // Selective Deletion: Delete microsite heavy assets but PRESERVE QR logos
      try {
        const prefix = `users/${userId}/microsites/`;
        const [files] = await bucket.getFiles({ prefix });
        
        if (files.length > 0) {
          // Process deletes in small chunks internally if needed
          await Promise.all(files.map(file => file.delete()));
          purgedCount++;
        }
        
        // Mark user profile as storage-purged
        batch.update(userDoc.ref, {
          storagePurgedAt: new Date(),
          updatedAt: new Date()
        });
      } catch (err) {
        console.error(`Maintenance: Failed to purge media for ${userId}`, err);
      }
    }

    await batch.commit();

    return { 
      success: true, 
      count: purgedCount, 
      message: `Batch processed: ${purgedCount} accounts purged. QR Logos were safely preserved.` 
    };
  } catch (error: any) {
    console.error("Critical Maintenance Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Action to count total potential storage savings.
 */
export async function getMaintenanceStatsAction() {
  try {
    const db = getAdminDb();
    if (!db) return { count: 0 };

    const thirtyDaysAgo = subDays(new Date(), 30);
    const snap = await db.collection("users")
      .where("planExpiryDate", "<", thirtyDaysAgo)
      .where("storagePurgedAt", "==", null) // Only count those not yet purged
      .get();

    return { count: snap.size };
  } catch (e) {
    return { count: 0 };
  }
}
