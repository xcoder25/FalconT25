
import { NextRequest } from 'next/server';
import { verifyToken, getAdminSdk, ok, fail, unauthorized, forbidden, hasRole } from '@/lib/adminSdk';

// POST /api/attendance/event — Camera system pushes a recognition event
export async function POST(req: NextRequest) {
  // Camera events can use a service API key OR user token
  const apiKey = req.headers.get('x-api-key');
  const isServiceKey = apiKey === process.env.CAMERA_SERVICE_API_KEY;

  let tenantId: string | null = null;

  if (isServiceKey) {
    const body = await req.clone().json();
    tenantId = body.tenantId;
  } else {
    const session = await verifyToken(req);
    if (!session) return unauthorized();
    tenantId = session.tenantId;
  }

  if (!tenantId) return fail('tenantId is required.', 400);

  try {
    const body = await req.json();
    const { staffMemberId, type, camera, snapshotImageUrl, branchName } = body;

    if (!staffMemberId || !type || !camera) {
      return fail('staffMemberId, type, and camera are required.');
    }

    const { db } = getAdminSdk();

    // Resolve staff name
    let staffName = 'Unrecognized Person';
    if (staffMemberId !== 'unrecognized') {
      const staffDoc = await db
        .collection('tenants').doc(tenantId)
        .collection('staff').doc(staffMemberId)
        .get();
      if (staffDoc.exists) {
        staffName = staffDoc.data()!.name || 'Unknown';
      }
    }

    const record = {
      staffMemberId,
      staffName,
      type,
      camera,
      snapshotImageUrl: snapshotImageUrl || null,
      branchName: branchName || null,
      timestamp: new Date().toISOString(),
    };

    const docRef = await db
      .collection('tenants').doc(tenantId)
      .collection('attendance')
      .add(record);

    // Push security alert for unrecognized persons
    if (type === 'sighting') {
      await db.collection('tenants').doc(tenantId).collection('notifications').add({
        title: '⚠️ Security Alert: Unrecognized Person',
        message: `Unrecognized face detected at ${camera}${branchName ? ` (${branchName})` : ''}.`,
        type: 'warning',
        read: false,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Sign-in / sign-out notification
      await db.collection('tenants').doc(tenantId).collection('notifications').add({
        title: type === 'signin' ? `✅ Staff Signed In` : `🚪 Staff Signed Out`,
        message: `${staffName} ${type === 'signin' ? 'arrived at' : 'left'} ${camera}.`,
        type: 'info',
        read: false,
        timestamp: new Date().toISOString(),
      });
    }

    return ok({ id: docRef.id, ...record });
  } catch (err: any) {
    return fail(err.message || 'Failed to log attendance event.', 500);
  }
}

// GET /api/attendance/event — Get recent attendance records
export async function GET(req: NextRequest) {
  const session = await verifyToken(req);
  if (!session) return unauthorized();

  const { searchParams } = new URL(req.url);
  const limitCount = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
  const staffId = searchParams.get('staffId');
  const camera = searchParams.get('camera');

  try {
    const { db } = getAdminSdk();
    let q = db
      .collection('tenants').doc(session.tenantId)
      .collection('attendance')
      .orderBy('timestamp', 'desc')
      .limit(limitCount) as FirebaseFirestore.Query;

    if (staffId) q = q.where('staffMemberId', '==', staffId);
    if (camera) q = q.where('camera', '==', camera);

    const snap = await q.get();
    const records = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return ok(records);
  } catch (err: any) {
    return fail(err.message || 'Failed to fetch attendance.', 500);
  }
}
