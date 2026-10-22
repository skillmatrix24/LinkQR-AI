'use server';

import nodemailer from 'nodemailer';
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Server Action to send an email using Gmail SMTP.
 * Dynamically fetches credentials from Firestore (config/site) or falls back to environment variables.
 */
export async function sendEmailAction({
  to,
  subject,
  html,
  text
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  let user = process.env.GMAIL_USER;
  let pass = process.env.GMAIL_APP_PASSWORD;

  // Attempt to fetch from Firestore first (for user-managed settings)
  try {
    const db = getAdminDb();
    if (db) {
      const siteConfig = await db.collection("config").doc("site").get();
      if (siteConfig.exists) {
        const data = siteConfig.data();
        if (data?.gmailUser) user = data.gmailUser;
        if (data?.gmailAppPassword) pass = data.gmailAppPassword;
      }
    }
  } catch (dbError) {
    console.warn("Email Action: Could not fetch SMTP config from DB, falling back to ENV.", dbError);
  }

  if (!user || !pass) {
    console.error("Email Error: Gmail credentials not configured in Dashboard or ENV.");
    throw new Error("Server is not configured for sending emails. Please set Gmail credentials in Owner Hub > Site Settings.");
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"LinkQR AI Admin" <${user}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Critical Email Dispatch Error:", error);
    throw new Error(error.message || "Failed to dispatch email. Check your Gmail App Password.");
  }
}
