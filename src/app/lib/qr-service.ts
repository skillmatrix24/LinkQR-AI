
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Super-Robust Scan Logging & Redirection Service (Admin Node).
 * Hardened: Ensures redirection happens even if counting fails.
 */
export async function logScan(shortCode: string, ipAddress: string, userAgent: string) {
  const db = getAdminDb();
  
  if (!db) {
    console.error("QR Service: REDIRECTION_ENGINE_OFFLINE");
    return null;
  }

  if (!shortCode) return null;

  // Normalize: trim and remove params
  const normalizedCode = shortCode.trim().split('?')[0].replace(/\/$/, "");

  try {
    console.log(`QR Service: Resolving code [${normalizedCode}]`);

    // 1. Resolve Link Data from Public Registry
    let publicSnap = await db.collection("publicShortLinks").doc(normalizedCode).get();
    let publicData = publicSnap.data();

    // Fallback: If not found by ID, search by field (case-insensitive check)
    if (!publicSnap.exists || !publicData) {
      const fieldSearch = await db.collection("publicShortLinks")
        .where("shortCode", "==", normalizedCode)
        .limit(1)
        .get();

      if (!fieldSearch.empty) {
        publicData = fieldSearch.docs[0].data();
      } else {
        const lowerSnap = await db.collection("publicShortLinks").doc(normalizedCode.toLowerCase()).get();
        if (lowerSnap.exists) {
          publicData = lowerSnap.data();
        }
      }
    }

    if (!publicData) {
      console.warn(`QR Service: Code [${normalizedCode}] not found in registry.`);
      return null;
    }

    const { userId, qrCodeId, originalUrl: backupUrl, isActive: publicIsActive } = publicData;

    // 2. Security & Subscription Checks (Bypass for Admins)
    const userSnap = await db.collection("users").doc(userId).get();
    const userData = userSnap.data();
    
    const adminEmails = ['admin@test.com', 'skillmatrix24@gmail.com', 'thegingerleaf77@gmail.com'];
    const isAdmin = userData?.isAdmin === true || (userData?.email && adminEmails.includes(userData.email));

    if (userData?.planExpiryDate && !isAdmin) {
      const expiry = userData.planExpiryDate.toDate ? userData.planExpiryDate.toDate() : new Date(userData.planExpiryDate);
      if (expiry < new Date()) return "EXPIRED";
    }

    // 3. Determine Status and Target
    let destination = backupUrl;
    let isActive = publicIsActive !== false;

    if (qrCodeId && userId) {
      const qrSnap = await db.collection("users").doc(userId).collection("qrcodes").doc(qrCodeId).get();
      if (qrSnap.exists) {
        const qrData = qrSnap.data();
        if (qrData?.isActive === false) isActive = false;
        if (qrData?.originalUrl) destination = qrData.originalUrl;
      }
    }

    if (!isActive) return "INACTIVE";

    // 4. TRANSACTIONAL LOGGING (Non-Blocking)
    const isBot = /bot|crawler|spider|curl|wget|lighthouse|googlebot|headless|facebookexternalhit|twitterbot|adsbot|bingbot|yandex|baiduspider/i.test(userAgent);
    
    if (qrCodeId && userId) {
      // Fire and forget logging
      Promise.all([
        db.collection("users").doc(userId).collection("qrcodes").doc(qrCodeId).collection("scanevents").add({
          qrCodeId,
          userId,
          timestamp: FieldValue.serverTimestamp(),
          ipAddress: ipAddress || "unknown",
          userAgent,
          deviceType: userAgent.toLowerCase().includes('mobile') ? 'mobile' : 'desktop',
          browserName: userAgent.includes('Chrome') ? 'Chrome' : 
                       userAgent.includes('Firefox') ? 'Firefox' : 
                       userAgent.includes('Safari') ? 'Safari' : 'Other',
          operatingSystem: userAgent.includes('Windows') ? 'Windows' : 
                           userAgent.includes('Mac') ? 'MacOS' : 
                           userAgent.includes('Android') ? 'Android' : 'Other',
          isBot,
          botReason: isBot ? "Automated Scan Pattern" : "Verified Human Interaction"
        }),
        db.collection("users").doc(userId).collection("qrcodes").doc(qrCodeId).update({
          totalScans: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp()
        })
      ]).catch(e => console.error("QR Background Logging Failed:", e));
    }

    return destination;
  } catch (error: any) {
    console.error("QR Service Failure:", error);
    return null;
  }
}
