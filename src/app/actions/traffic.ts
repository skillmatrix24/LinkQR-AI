'use server';

import { headers } from 'next/headers';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Server Action to log a general website visit (Organic Traffic).
 */
export async function logVisitAction(path: string) {
  try {
    const db = getAdminDb();
    if (!db) return { success: false };

    const headersList = headers();
    const userAgent = headersList.get('user-agent') || 'unknown';
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : (realIp || 'unknown');

    // Filter common bots
    const isBot = /bot|crawler|spider|curl|wget|lighthouse|googlebot|headless|facebookexternalhit|twitterbot|adsbot|bingbot|yandex|baiduspider/i.test(userAgent);

    const trafficData = {
      type: 'visit',
      path: path || '/',
      timestamp: FieldValue.serverTimestamp(),
      ipAddress,
      userAgent,
      deviceType: userAgent.toLowerCase().includes('mobile') ? 'mobile' : 'desktop',
      browserName: userAgent.includes('Chrome') ? 'Chrome' : 
                   userAgent.includes('Firefox') ? 'Firefox' : 
                   userAgent.includes('Safari') ? 'Safari' : 
                   userAgent.includes('Edge') ? 'Edge' : 'Other',
      operatingSystem: userAgent.includes('Windows') ? 'Windows' : 
                       userAgent.includes('Mac') ? 'MacOS' : 
                       userAgent.includes('Android') ? 'Android' : 
                       userAgent.includes('iPhone') ? 'iOS' : 'Unknown',
      isBot,
      botReason: isBot ? "Automated Crawler" : "Organic Human Visit"
    };

    await db.collection("siteTraffic").add(trafficData);
    return { success: true };
  } catch (error) {
    console.error("Traffic Action Error:", error);
    return { success: false };
  }
}
