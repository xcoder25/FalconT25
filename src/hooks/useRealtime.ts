
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  subscribeToStaff,
  subscribeToAttendance,
  subscribeToCameras,
  subscribeToNotifications,
  subscribeToRecognitions,
  subscribeToAuditLogs,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/firestoreService';
import { mockStaffMembers, mockCameras, mockNotifications, mockRecognitions, mockSignInSignOutHistory, mockAuditLogEntries } from '@/lib/mockData';
import type { StaffMember, Camera, AppNotification, Recognition, SignInSignOutRecord, AuditLogEntry } from '@/lib/types';

const USE_MOCK = !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'your_project_id';

// ─────────────────────────────────────────────────────────────
// useRealtimeStaff
// ─────────────────────────────────────────────────────────────
export function useRealtimeStaff() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>(USE_MOCK ? mockStaffMembers : []);
  const [isLoading, setIsLoading] = useState(!USE_MOCK);

  useEffect(() => {
    if (USE_MOCK || !user?.tenantId) { setIsLoading(false); return; }
    setIsLoading(true);
    const unsub = subscribeToStaff(user.tenantId, (data) => {
      setStaff(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, [user?.tenantId]);

  return { staff, isLoading };
}

// ─────────────────────────────────────────────────────────────
// useRealtimeAttendance
// ─────────────────────────────────────────────────────────────
export function useRealtimeAttendance(maxRecords = 100) {
  const { user } = useAuth();
  const [records, setRecords] = useState<SignInSignOutRecord[]>(USE_MOCK ? mockSignInSignOutHistory : []);
  const [isLoading, setIsLoading] = useState(!USE_MOCK);

  useEffect(() => {
    if (USE_MOCK || !user?.tenantId) { setIsLoading(false); return; }
    setIsLoading(true);
    const unsub = subscribeToAttendance(user.tenantId, (data) => {
      setRecords(data);
      setIsLoading(false);
    }, maxRecords);
    return () => unsub();
  }, [user?.tenantId, maxRecords]);

  return { records, isLoading };
}

// ─────────────────────────────────────────────────────────────
// useRealtimeCameras
// ─────────────────────────────────────────────────────────────
export function useRealtimeCameras() {
  const { user } = useAuth();
  const [cameras, setCameras] = useState<Camera[]>(USE_MOCK ? mockCameras : []);
  const [isLoading, setIsLoading] = useState(!USE_MOCK);

  useEffect(() => {
    if (USE_MOCK || !user?.tenantId) { setIsLoading(false); return; }
    setIsLoading(true);
    const unsub = subscribeToCameras(user.tenantId, (data) => {
      setCameras(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, [user?.tenantId]);

  return { cameras, isLoading };
}

// ─────────────────────────────────────────────────────────────
// useRealtimeNotifications
// ─────────────────────────────────────────────────────────────
export function useRealtimeNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>(USE_MOCK ? mockNotifications : []);
  const [isLoading, setIsLoading] = useState(!USE_MOCK);

  useEffect(() => {
    if (USE_MOCK || !user?.tenantId) { setIsLoading(false); return; }
    setIsLoading(true);
    const unsub = subscribeToNotifications(user.tenantId, (data) => {
      setNotifications(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, [user?.tenantId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback(async (id: string) => {
    if (USE_MOCK) {
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
      return;
    }
    if (!user?.tenantId) return;
    await markNotificationRead(user.tenantId, id);
  }, [user?.tenantId]);

  const markAllRead = useCallback(async () => {
    if (USE_MOCK) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      return;
    }
    if (!user?.tenantId) return;
    await markAllNotificationsRead(user.tenantId);
  }, [user?.tenantId]);

  return { notifications, unreadCount, isLoading, markRead, markAllRead };
}

// ─────────────────────────────────────────────────────────────
// useRealtimeRecognitions
// ─────────────────────────────────────────────────────────────
export function useRealtimeRecognitions(maxItems = 50) {
  const { user } = useAuth();
  const [recognitions, setRecognitions] = useState<Recognition[]>(USE_MOCK ? mockRecognitions : []);
  const [isLoading, setIsLoading] = useState(!USE_MOCK);

  useEffect(() => {
    if (USE_MOCK || !user?.tenantId) { setIsLoading(false); return; }
    setIsLoading(true);
    const unsub = subscribeToRecognitions(user.tenantId, (data) => {
      setRecognitions(data);
      setIsLoading(false);
    }, maxItems);
    return () => unsub();
  }, [user?.tenantId, maxItems]);

  return { recognitions, isLoading };
}

// ─────────────────────────────────────────────────────────────
// useRealtimeAuditLogs
// ─────────────────────────────────────────────────────────────
export function useRealtimeAuditLogs(maxItems = 100) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>(USE_MOCK ? mockAuditLogEntries : []);
  const [isLoading, setIsLoading] = useState(!USE_MOCK);

  useEffect(() => {
    if (USE_MOCK || !user?.tenantId) { setIsLoading(false); return; }
    setIsLoading(true);
    const unsub = subscribeToAuditLogs(user.tenantId, (data) => {
      setLogs(data);
      setIsLoading(false);
    }, maxItems);
    return () => unsub();
  }, [user?.tenantId, maxItems]);

  return { logs, isLoading };
}
