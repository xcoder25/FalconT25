
import { db, storage, auth } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  Timestamp,
  setDoc,
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import type {
  StaffMember,
  SignInSignOutRecord,
  Camera,
  AppNotification,
  AuditLogEntry,
  Recognition,
  Branch,
} from './types';

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function tenantCol(tenantId: string, col: string) {
  return collection(db, 'tenants', tenantId, col);
}

function tenantDoc(tenantId: string, col: string, id: string) {
  return doc(db, 'tenants', tenantId, col, id);
}

async function writeAuditLog(
  tenantId: string,
  action: string,
  details: string,
  targetId?: string
) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await addDoc(tenantCol(tenantId, 'auditLogs'), {
      timestamp: serverTimestamp(),
      userId: user.uid,
      userName: user.displayName || user.email || 'Unknown',
      action,
      details,
      targetId: targetId || null,
      ipAddress: null, // populated server-side in API route
    } satisfies Omit<AuditLogEntry, 'id'>);
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

// ─────────────────────────────────────────────────────────────
// STAFF
// ─────────────────────────────────────────────────────────────

export async function getStaffMembers(tenantId: string): Promise<StaffMember[]> {
  const snap = await getDocs(tenantCol(tenantId, 'staff'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as StaffMember));
}

export function subscribeToStaff(
  tenantId: string,
  callback: (staff: StaffMember[]) => void
) {
  const q = query(tenantCol(tenantId, 'staff'), orderBy('name'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as StaffMember)));
  });
}

export async function addStaffMember(
  tenantId: string,
  data: Omit<StaffMember, 'id'>,
  photoFile?: File
): Promise<StaffMember> {
  let imageUrl = data.imageUrl;
  if (photoFile) {
    const path = `tenants/${tenantId}/staff/${Date.now()}_${photoFile.name}`;
    const ref = storageRef(storage, path);
    await uploadBytes(ref, photoFile);
    imageUrl = await getDownloadURL(ref);
  }
  const docRef = await addDoc(tenantCol(tenantId, 'staff'), {
    ...data,
    imageUrl,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await writeAuditLog(tenantId, 'STAFF_ADDED', `Added staff member "${data.name}"`, docRef.id);
  return { id: docRef.id, ...data, imageUrl };
}

export async function updateStaffMember(
  tenantId: string,
  staffId: string,
  updates: Partial<StaffMember>,
  photoFile?: File
): Promise<void> {
  let imageUrl = updates.imageUrl;
  if (photoFile) {
    const path = `tenants/${tenantId}/staff/${staffId}_${Date.now()}.jpg`;
    const ref = storageRef(storage, path);
    await uploadBytes(ref, photoFile);
    imageUrl = await getDownloadURL(ref);
  }
  await updateDoc(tenantDoc(tenantId, 'staff', staffId), {
    ...updates,
    ...(imageUrl ? { imageUrl } : {}),
    updatedAt: serverTimestamp(),
  });
  await writeAuditLog(tenantId, 'STAFF_UPDATED', `Updated staff "${updates.name || staffId}"`, staffId);
}

export async function deleteStaffMember(tenantId: string, staffId: string): Promise<void> {
  await deleteDoc(tenantDoc(tenantId, 'staff', staffId));
  await writeAuditLog(tenantId, 'STAFF_DELETED', `Deleted staff member (ID: ${staffId})`, staffId);
}

// ─────────────────────────────────────────────────────────────
// ATTENDANCE
// ─────────────────────────────────────────────────────────────

export function subscribeToAttendance(
  tenantId: string,
  callback: (records: SignInSignOutRecord[]) => void,
  maxRecords = 100
) {
  const q = query(
    tenantCol(tenantId, 'attendance'),
    orderBy('timestamp', 'desc'),
    limit(maxRecords)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SignInSignOutRecord)));
  });
}

export async function addAttendanceEvent(
  tenantId: string,
  event: Omit<SignInSignOutRecord, 'id'>
): Promise<string> {
  const docRef = await addDoc(tenantCol(tenantId, 'attendance'), {
    ...event,
    timestamp: serverTimestamp(),
  });
  // Push real-time notification for unknown sightings
  if (event.type === 'sighting') {
    await addNotification(tenantId, {
      title: '⚠️ Security Alert: Unrecognized Person',
      message: `Unrecognized face detected at ${event.camera}.`,
      type: 'warning',
      read: false,
      timestamp: new Date().toISOString(),
    });
  }
  return docRef.id;
}

// ─────────────────────────────────────────────────────────────
// CAMERAS
// ─────────────────────────────────────────────────────────────

export function subscribeToCameras(
  tenantId: string,
  callback: (cameras: Camera[]) => void
) {
  return onSnapshot(tenantCol(tenantId, 'cameras'), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Camera)));
  });
}

export async function addCamera(tenantId: string, camera: Omit<Camera, 'id'>): Promise<string> {
  const docRef = await addDoc(tenantCol(tenantId, 'cameras'), {
    ...camera,
    createdAt: serverTimestamp(),
  });
  await writeAuditLog(tenantId, 'CAMERA_ADDED', `Added camera "${camera.name}"`, docRef.id);
  return docRef.id;
}

export async function updateCameraStatus(
  tenantId: string,
  cameraId: string,
  status: Camera['status']
): Promise<void> {
  await updateDoc(tenantDoc(tenantId, 'cameras', cameraId), { status, updatedAt: serverTimestamp() });
}

export async function deleteCamera(tenantId: string, cameraId: string): Promise<void> {
  await deleteDoc(tenantDoc(tenantId, 'cameras', cameraId));
  await writeAuditLog(tenantId, 'CAMERA_DELETED', `Removed camera (ID: ${cameraId})`, cameraId);
}

// ─────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

export function subscribeToNotifications(
  tenantId: string,
  callback: (notifications: AppNotification[]) => void,
  maxItems = 30
) {
  const q = query(
    tenantCol(tenantId, 'notifications'),
    orderBy('timestamp', 'desc'),
    limit(maxItems)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification)));
  });
}

export async function addNotification(
  tenantId: string,
  notif: Omit<AppNotification, 'id'>
): Promise<void> {
  await addDoc(tenantCol(tenantId, 'notifications'), {
    ...notif,
    timestamp: serverTimestamp(),
  });
}

export async function markNotificationRead(tenantId: string, notifId: string): Promise<void> {
  await updateDoc(tenantDoc(tenantId, 'notifications', notifId), { read: true });
}

export async function markAllNotificationsRead(tenantId: string): Promise<void> {
  const q = query(tenantCol(tenantId, 'notifications'), where('read', '==', false));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
  await batch.commit();
}

// ─────────────────────────────────────────────────────────────
// RECOGNITIONS
// ─────────────────────────────────────────────────────────────

export function subscribeToRecognitions(
  tenantId: string,
  callback: (recognitions: Recognition[]) => void,
  maxItems = 50
) {
  const q = query(
    tenantCol(tenantId, 'recognitions'),
    orderBy('timestamp', 'desc'),
    limit(maxItems)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Recognition)));
  });
}

export async function addRecognition(
  tenantId: string,
  recognition: Omit<Recognition, 'id'>
): Promise<string> {
  const docRef = await addDoc(tenantCol(tenantId, 'recognitions'), {
    ...recognition,
    timestamp: serverTimestamp(),
    reactions: [],
    comments: [],
  });
  await addNotification(tenantId, {
    title: '🏆 New Recognition!',
    message: `${recognition.giver.name} recognized ${recognition.receiver.name} for ${recognition.value || 'their contribution'}.`,
    type: 'recognition',
    read: false,
    timestamp: new Date().toISOString(),
  });
  await writeAuditLog(tenantId, 'RECOGNITION_GIVEN', `${recognition.giver.name} → ${recognition.receiver.name}`, docRef.id);
  return docRef.id;
}

export async function addReactionToRecognition(
  tenantId: string,
  recognitionId: string,
  reaction: Recognition['reactions'][0]
): Promise<void> {
  const docRef = tenantDoc(tenantId, 'recognitions', recognitionId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;
  const existing = (snap.data().reactions || []) as Recognition['reactions'];
  // Toggle: remove if same user+emoji, else add
  const filtered = existing.filter((r) => !(r.user.id === reaction.user.id && r.emoji === reaction.emoji));
  const newReactions = filtered.length === existing.length ? [...existing, reaction] : filtered;
  await updateDoc(docRef, { reactions: newReactions });
}

export async function addCommentToRecognition(
  tenantId: string,
  recognitionId: string,
  comment: Recognition['comments'][0]
): Promise<void> {
  const docRef = tenantDoc(tenantId, 'recognitions', recognitionId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;
  const comments = [...(snap.data().comments || []), comment];
  await updateDoc(docRef, { comments, updatedAt: serverTimestamp() });
}

// ─────────────────────────────────────────────────────────────
// AUDIT LOGS
// ─────────────────────────────────────────────────────────────

export function subscribeToAuditLogs(
  tenantId: string,
  callback: (logs: AuditLogEntry[]) => void,
  maxItems = 100
) {
  const q = query(
    tenantCol(tenantId, 'auditLogs'),
    orderBy('timestamp', 'desc'),
    limit(maxItems)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLogEntry)));
  });
}

// ─────────────────────────────────────────────────────────────
// COMPANY / TENANT SETUP
// ─────────────────────────────────────────────────────────────

export async function createTenant(
  tenantId: string,
  companyData: {
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
    industryType: string;
    companySize: string;
    logoUrl?: string;
  }
): Promise<void> {
  await setDoc(doc(db, 'tenants', tenantId), {
    ...companyData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: 'active',
  });
  // Create default subscription (trialing growth plan)
  await setDoc(doc(db, 'subscriptions', tenantId), {
    plan: 'growth',
    status: 'trialing',
    currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    usage: { staffCount: 0, cameraCount: 0, branchCount: 0, aiCallsThisMonth: 0 },
    createdAt: serverTimestamp(),
  });
}

export async function uploadCompanyLogo(tenantId: string, file: File): Promise<string> {
  const ref = storageRef(storage, `tenants/${tenantId}/logo_${Date.now()}.jpg`);
  await uploadBytes(ref, file);
  return getDownloadURL(ref);
}
