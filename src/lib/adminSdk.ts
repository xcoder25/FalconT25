
import { NextRequest, NextResponse } from 'next/server';

// ─── Firebase Admin SDK Init ───────────────────────────────────────────────────
import { initializeApp, cert, getApps, getApp, App } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

let adminApp: App;

function getAdminApp(): App {
  if (getApps().length > 0) return getApp();
  const serviceAccountKey = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error('FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY is not set.');
  }
  const serviceAccount = JSON.parse(serviceAccountKey);
  return initializeApp({ credential: cert(serviceAccount) });
}

export function getAdminSdk() {
  const app = getAdminApp();
  return {
    auth: getAdminAuth(app),
    db: getAdminFirestore(app),
  };
}

// ─── Session Token Verification ────────────────────────────────────────────────
export async function verifyToken(req: NextRequest): Promise<{
  uid: string;
  tenantId: string;
  role: string;
} | null> {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.split('Bearer ')[1];
    const { auth, db } = getAdminSdk();
    const decoded = await auth.verifyIdToken(token);
    // Fetch user profile for tenantId and role
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (!userDoc.exists) return null;
    const data = userDoc.data()!;
    return {
      uid: decoded.uid,
      tenantId: data.tenantId || decoded.uid,
      role: data.role || 'staff',
    };
  } catch {
    return null;
  }
}

// ─── Standard API Response Helpers ────────────────────────────────────────────
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function unauthorized() {
  return fail('Unauthorized. Valid token required.', 401);
}

export function forbidden() {
  return fail('Forbidden. Insufficient permissions.', 403);
}

// ─── Role Guards ───────────────────────────────────────────────────────────────
const ROLE_LEVELS: Record<string, number> = {
  super_admin: 5,
  admin: 4,
  manager: 3,
  staff: 2,
  viewer: 1,
};

export function hasRole(userRole: string, required: string): boolean {
  return (ROLE_LEVELS[userRole] || 0) >= (ROLE_LEVELS[required] || 0);
}
