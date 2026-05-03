
import { NextRequest } from 'next/server';
import { getAdminSdk, ok, fail, unauthorized } from '@/lib/adminSdk';

// POST /api/auth/register — Create company + admin account
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, displayName, companyName, companyEmail, companyPhone,
            companyAddress, industryType, companySize } = body;

    if (!email || !password || !displayName || !companyName) {
      return fail('email, password, displayName, and companyName are required.');
    }

    const { auth, db } = getAdminSdk();

    // Create Firebase Auth user
    const userRecord = await auth.createUser({ email, password, displayName });
    const tenantId = userRecord.uid; // owner's UID is the tenantId

    // Create tenant document
    const tenantRef = db.collection('tenants').doc(tenantId);
    await tenantRef.set({
      companyName,
      companyEmail: companyEmail || email,
      companyPhone: companyPhone || '',
      companyAddress: companyAddress || '',
      industryType: industryType || '',
      companySize: companySize || '',
      logoUrl: null,
      ownerId: userRecord.uid,
      createdAt: new Date().toISOString(),
      status: 'active',
    });

    // Create user profile doc with admin role
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName,
      photoURL: null,
      role: 'admin',
      tenantId,
      companyName,
      createdAt: new Date().toISOString(),
    });

    // Create trial subscription
    await db.collection('subscriptions').doc(tenantId).set({
      plan: 'growth',
      status: 'trialing',
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      usage: { staffCount: 0, cameraCount: 0, branchCount: 0, aiCallsThisMonth: 0 },
      createdAt: new Date().toISOString(),
    });

    // Set custom claims for role-based access
    await auth.setCustomUserClaims(userRecord.uid, { role: 'admin', tenantId });

    // Initial audit log
    await tenantRef.collection('auditLogs').add({
      timestamp: new Date().toISOString(),
      userId: userRecord.uid,
      userName: displayName,
      action: 'ACCOUNT_CREATED',
      details: `Admin account and company "${companyName}" created successfully.`,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    });

    return ok({ uid: userRecord.uid, tenantId, companyName }, 201);
  } catch (err: any) {
    if (err.code === 'auth/email-already-exists') {
      return fail('An account with this email already exists.', 409);
    }
    return fail(err.message || 'Registration failed.', 500);
  }
}
