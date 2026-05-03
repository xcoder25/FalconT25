
import { NextRequest } from 'next/server';
import { verifyToken, getAdminSdk, ok, fail, unauthorized, forbidden, hasRole } from '@/lib/adminSdk';

// POST /api/staff — Create new staff member
export async function POST(req: NextRequest) {
  const session = await verifyToken(req);
  if (!session) return unauthorized();
  if (!hasRole(session.role, 'manager')) return forbidden();

  try {
    const body = await req.json();
    const { name, email, department, branchId, imageUrl } = body;

    if (!name || !email) return fail('Name and email are required.');

    const { db } = getAdminSdk();
    const staffRef = db.collection('tenants').doc(session.tenantId).collection('staff').doc();

    const staffData = {
      name,
      email,
      department: department || '',
      branchId: branchId || null,
      imageUrl: imageUrl || '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await staffRef.set(staffData);

    // Log to audit trail
    await db.collection('tenants').doc(session.tenantId).collection('auditLogs').add({
      timestamp: new Date().toISOString(),
      userId: session.uid,
      userName: 'Admin',
      action: 'STAFF_ADDED',
      details: `Staff member "${name}" added.`,
      targetId: staffRef.id,
    });

    return ok({ id: staffRef.id, ...staffData });
  } catch (err: any) {
    return fail(err.message || 'Failed to create staff member.', 500);
  }
}

// GET /api/staff — List all staff for the tenant
export async function GET(req: NextRequest) {
  const session = await verifyToken(req);
  if (!session) return unauthorized();

  try {
    const { db } = getAdminSdk();
    const snap = await db
      .collection('tenants')
      .doc(session.tenantId)
      .collection('staff')
      .orderBy('name')
      .get();

    const staff = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return ok(staff);
  } catch (err: any) {
    return fail(err.message || 'Failed to fetch staff.', 500);
  }
}
