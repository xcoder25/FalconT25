
import { NextRequest } from 'next/server';
import { verifyToken, getAdminSdk, ok, fail, unauthorized } from '@/lib/adminSdk';

// POST /api/recognitions — Create a new recognition
export async function POST(req: NextRequest) {
  const session = await verifyToken(req);
  if (!session) return unauthorized();

  try {
    const body = await req.json();
    const { giver, receiver, value, reason, message } = body;

    if (!giver || !receiver || !reason) {
      return fail('giver, receiver, and reason are required.');
    }

    const { db } = getAdminSdk();
    const docRef = await db
      .collection('tenants').doc(session.tenantId)
      .collection('recognitions')
      .add({
        giver,
        receiver,
        value: value || null,
        reason,
        message: message || null,
        timestamp: new Date().toISOString(),
        reactions: [],
        comments: [],
        createdBy: session.uid,
      });

    // Fire notification
    await db.collection('tenants').doc(session.tenantId).collection('notifications').add({
      title: '🏆 New Recognition!',
      message: `${giver.name} recognized ${receiver.name}${value ? ` for "${value}"` : ''}.`,
      type: 'recognition',
      read: false,
      timestamp: new Date().toISOString(),
    });

    // Audit log
    await db.collection('tenants').doc(session.tenantId).collection('auditLogs').add({
      timestamp: new Date().toISOString(),
      userId: session.uid,
      userName: giver.name,
      action: 'RECOGNITION_GIVEN',
      details: `${giver.name} recognized ${receiver.name} for "${value || reason}".`,
      targetId: docRef.id,
    });

    return ok({ id: docRef.id }, 201);
  } catch (err: any) {
    return fail(err.message || 'Failed to create recognition.', 500);
  }
}

// GET /api/recognitions — Paginated recognition feed
export async function GET(req: NextRequest) {
  const session = await verifyToken(req);
  if (!session) return unauthorized();

  const { searchParams } = new URL(req.url);
  const limitCount = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

  try {
    const { db } = getAdminSdk();
    const snap = await db
      .collection('tenants').doc(session.tenantId)
      .collection('recognitions')
      .orderBy('timestamp', 'desc')
      .limit(limitCount)
      .get();

    const recognitions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return ok(recognitions);
  } catch (err: any) {
    return fail(err.message || 'Failed to fetch recognitions.', 500);
  }
}
