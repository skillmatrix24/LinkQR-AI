'use server';

import { sendEmailAction } from "./email";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Server Action to notify owner of a new lead and sync to external webhooks.
 */
export async function processNewLeadAction({
  ownerId,
  micrositeId,
  leadData
}: {
  ownerId: string;
  micrositeId: string;
  leadData: any;
}) {
  try {
    const db = getAdminDb();
    if (!db) return { success: false, error: "DB_OFFLINE" };

    // 1. Fetch Microsite Settings for Automation
    const siteSnap = await db.collection("users").doc(ownerId).collection("microsites").doc(micrositeId).get();
    if (!siteSnap.exists) return { success: false, error: "SITE_NOT_FOUND" };
    
    const settings = siteSnap.data();
    const targetEmail = settings?.notificationEmail || "";
    const webhookUrl = settings?.webhookUrl || "";
    const notificationsEnabled = settings?.emailNotificationsEnabled !== false;

    // 2. Trigger Email Notification
    if (notificationsEnabled && targetEmail) {
      const subject = `🔥 New Lead from ${settings?.businessName || 'Smart Page'}`;
      const html = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 15px;">
          <h2 style="color: #6750A4;">You have a new inquiry!</h2>
          <p><strong>Customer Name:</strong> ${leadData.name}</p>
          <p><strong>Mobile:</strong> ${leadData.mobile}</p>
          ${leadData.business ? `<p><strong>Business/Note:</strong> ${leadData.business}</p>` : ''}
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">Sent via LinkQR AI Automation Engine.</p>
          <a to="https://linkqr.in/dashboard/qrs/microsite/leads" style="display: inline-block; padding: 10px 20px; background: #6750A4; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">View in CRM</a>
        </div>
      `;
      
      await sendEmailAction({
        to: targetEmail,
        subject,
        html,
        text: `New Lead: ${leadData.name} (${leadData.mobile})`
      }).catch(e => console.error("Lead Email Notify Failed:", e));
    }

    // 3. Trigger External Webhook (e.g. Google Sheets / Zapier)
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'LinkQR_SmartPage',
          siteName: settings?.businessName,
          timestamp: new Date().toISOString(),
          ...leadData
        })
      }).catch(e => console.error("Webhook Sync Failed:", e));
    }

    return { success: true };
  } catch (error) {
    console.error("Automation Logic Error:", error);
    return { success: false };
  }
}
