import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { addMonths, addYears } from 'date-fns';

/**
 * Razorpay Webhook Handler
 * Securely processes payment confirmation from Razorpay's servers.
 * Uses Payment ID as Document ID for idempotency.
 */
export async function POST(req: NextRequest) {
  try {
    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    }

    // 1. Get Site Config for Webhook Secret
    const siteConfig = await db.collection("config").doc("site").get();
    const webhookSecret = siteConfig.data()?.razorpayWebhookSecret;

    if (!webhookSecret) {
      console.error("Razorpay Webhook: RAZORPAY_WEBHOOK_SECRET is not configured in Dashboard.");
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    // 2. Verify Signature
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error("Razorpay Webhook: Invalid Signature detected.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    // 3. Handle 'payment.captured' event
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const { userId, planId, billingCycle, baseAmount, gstAmount, totalAmount, currency } = payment.notes;

      if (!userId || !planId) {
        console.warn("Razorpay Webhook: Received payment without userId or planId in notes.");
        return NextResponse.json({ status: "ok" });
      }

      console.log(`Razorpay Webhook: Processing successful payment for User ${userId}, Plan ${planId}`);

      const now = new Date();
      const expiryDate = billingCycle === 'yearly' ? addYears(now, 1) : addMonths(now, 1);

      // Record Subscription using payment ID as doc ID to prevent duplicates
      const transactionId = payment.id;
      await db.collection("users").doc(userId).collection("subscriptions").doc(transactionId).set({
        id: transactionId,
        userId,
        planId,
        billingCycle: billingCycle || 'monthly',
        startDate: FieldValue.serverTimestamp(),
        expiryDate: Timestamp.fromDate(expiryDate),
        status: "active",
        paymentProviderTransactionId: transactionId,
        amountPaid: Number(totalAmount) || (payment.amount / 100),
        baseAmount: Number(baseAmount) || (payment.amount / 100) - (Number(gstAmount) || 0),
        gstAmount: Number(gstAmount) || 0,
        currency: currency || payment.currency,
        paymentDate: FieldValue.serverTimestamp(),
        source: "webhook",
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });

      // Update User Profile
      await db.collection("users").doc(userId).update({
        currentPlanId: planId,
        planExpiryDate: Timestamp.fromDate(expiryDate),
        updatedAt: FieldValue.serverTimestamp(),
      });

      console.log(`Razorpay Webhook: Successfully processed Payment ${transactionId} for User ${userId}`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
