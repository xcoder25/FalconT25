import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminSdk } from '@/lib/adminSdk';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    if (!webhookSecret) throw new Error('Missing STRIPE_WEBHOOK_SECRET');
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Fulfill the purchase
    // pull if env active
    const tenantId = session.client_reference_id;
    const plan = session.metadata?.plan;

    if (tenantId && plan) {
      try {
        const { db } = getAdminSdk();

        await db.collection('subscriptions').doc(tenantId).update({
          plan,
          status: 'active',
          updatedAt: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

        // Audit log
        await db.collection('tenants').doc(tenantId).collection('auditLogs').add({
          timestamp: new Date().toISOString(),
          userId: 'SYSTEM',
          userName: 'Stripe Webhook',
          action: 'SUBSCRIPTION_UPGRADED',
          details: `Subscription upgraded to "${plan}" plan via Stripe Checkout.`,
        });

        console.log(`Successfully upgraded tenant ${tenantId} to ${plan}`);
      } catch (e) {
        console.error('Error fulfilling subscription:', e);
      }
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ received: true });
}
