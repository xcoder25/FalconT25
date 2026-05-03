
import { NextRequest } from 'next/server';
import { verifyToken, getAdminSdk, ok, fail, unauthorized } from '@/lib/adminSdk';

// GET /api/billing/plan — Current subscription info
export async function GET(req: NextRequest) {
  const session = await verifyToken(req);
  if (!session) return unauthorized();

  try {
    const { db } = getAdminSdk();
    const subSnap = await db.collection('subscriptions').doc(session.tenantId).get();
    if (!subSnap.exists) return fail('Subscription not found.', 404);
    return ok({ id: subSnap.id, ...subSnap.data() });
  } catch (err: any) {
    return fail(err.message || 'Failed to fetch plan.', 500);
  }
}

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

// POST /api/billing/plan — Upgrade plan (Stripe flow)
export async function POST(req: NextRequest) {
  const session = await verifyToken(req);
  if (!session) return unauthorized();

  try {
    const { plan } = await req.json();
    const validPlans = ['starter', 'growth', 'enterprise'];
    if (!validPlans.includes(plan)) return fail('Invalid plan selected.');

    // Map plans to mock Stripe price IDs (in production these would be real IDs from Stripe dashboard)
    const planPrices: Record<string, string> = {
      starter: 'price_starter_mock',
      growth: 'price_growth_mock',
      enterprise: 'price_enterprise_mock',
    };

    // Create a Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: planPrices[plan],
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      client_reference_id: session.tenantId, // Store tenantId for webhook fulfillment
      metadata: {
        tenantId: session.tenantId,
        plan,
      },
    });

    return ok({
      message: 'Checkout session created.',
      stripeCheckoutUrl: checkoutSession.url,
    });
  } catch (err: any) {
    console.error('Stripe Checkout Error:', err);
    return fail(err.message || 'Failed to create checkout session.', 500);
  }
}
