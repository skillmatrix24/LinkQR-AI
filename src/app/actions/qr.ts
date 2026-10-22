
'use server';

import { logScan } from "@/app/lib/qr-service";
import { headers } from "next/headers";

/**
 * Intelligent Scan Processor (Server-Side Node).
 * Bypasses client-side security rules to reliably increment counts.
 */
export async function processQRScanAction(shortCode: string) {
  try {
    if (!shortCode) return { success: false, error: "MISSING_CODE" };

    const headersList = headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : (realIp || 'unknown');
    const userAgent = headersList.get('user-agent') || 'unknown';

    console.log(`[Scan Node] Processing: ${shortCode} from IP: ${ipAddress}`);

    // Call the robust logging service
    const result = await logScan(shortCode, ipAddress, userAgent);

    if (result === "EXPIRED") {
      return { success: false, error: "EXPIRED" };
    }
    if (result === "INACTIVE") {
      return { success: false, error: "INACTIVE" };
    }
    if (!result) {
      return { success: false, error: "NOT_FOUND" };
    }

    // Success: return the final destination URL
    return { success: true, destination: result };

  } catch (error: any) {
    console.error("[Scan Node] Fault:", error.message);
    return { success: false, error: "SYSTEM_FAULT" };
  }
}
