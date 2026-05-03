
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db, doc, onSnapshot } from '@/lib/firebase';

export type PlanTier = 'starter' | 'growth' | 'enterprise' | 'custom';

export interface PlanLimits {
  maxStaff: number;
  maxCameras: number;
  maxBranches: number;
  aiEnabled: boolean;
  advancedAnalytics: boolean;
  whiteLabel: boolean;
  ssoEnabled: boolean;
  apiAccess: boolean;
}

export interface SubscriptionData {
  plan: PlanTier;
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  currentPeriodEnd: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  usage: {
    staffCount: number;
    cameraCount: number;
    branchCount: number;
    aiCallsThisMonth: number;
  };
  limits: PlanLimits;
}

const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  starter: {
    maxStaff: 25,
    maxCameras: 2,
    maxBranches: 1,
    aiEnabled: false,
    advancedAnalytics: false,
    whiteLabel: false,
    ssoEnabled: false,
    apiAccess: false,
  },
  growth: {
    maxStaff: 100,
    maxCameras: 8,
    maxBranches: 3,
    aiEnabled: true,
    advancedAnalytics: false,
    whiteLabel: false,
    ssoEnabled: false,
    apiAccess: false,
  },
  enterprise: {
    maxStaff: Infinity,
    maxCameras: Infinity,
    maxBranches: Infinity,
    aiEnabled: true,
    advancedAnalytics: true,
    whiteLabel: true,
    ssoEnabled: true,
    apiAccess: true,
  },
  custom: {
    maxStaff: Infinity,
    maxCameras: Infinity,
    maxBranches: Infinity,
    aiEnabled: true,
    advancedAnalytics: true,
    whiteLabel: true,
    ssoEnabled: true,
    apiAccess: true,
  },
};

const DEMO_SUBSCRIPTION: SubscriptionData = {
  plan: 'growth',
  status: 'trialing',
  currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  usage: { staffCount: 4, cameraCount: 8, branchCount: 3, aiCallsThisMonth: 12 },
  limits: PLAN_LIMITS['growth'],
};

interface SubscriptionContextValue {
  subscription: SubscriptionData | null;
  isLoading: boolean;
  canUseFeature: (feature: keyof PlanLimits) => boolean;
  isAtLimit: (resource: 'staff' | 'cameras' | 'branches') => boolean;
  planLabel: string;
  daysLeft: number | null;
  isTrialing: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

const PLAN_LABELS: Record<PlanTier, string> = {
  starter: '🚀 Starter',
  growth: '📈 Growth',
  enterprise: '🏢 Enterprise',
  custom: '⚡ Custom',
};

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.tenantId) {
      setSubscription(DEMO_SUBSCRIPTION);
      setIsLoading(false);
      return;
    }

    const subDocRef = doc(db, 'subscriptions', user.tenantId);
    const unsubscribe = onSnapshot(subDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Omit<SubscriptionData, 'limits'> & { plan: PlanTier };
        setSubscription({ ...data, limits: PLAN_LIMITS[data.plan] });
      } else {
        // Default to demo/trial subscription
        setSubscription(DEMO_SUBSCRIPTION);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.tenantId]);

  const canUseFeature = (feature: keyof PlanLimits): boolean => {
    if (!subscription) return false;
    return !!subscription.limits[feature];
  };

  const isAtLimit = (resource: 'staff' | 'cameras' | 'branches'): boolean => {
    if (!subscription) return false;
    const { usage, limits } = subscription;
    if (resource === 'staff') return usage.staffCount >= limits.maxStaff;
    if (resource === 'cameras') return usage.cameraCount >= limits.maxCameras;
    if (resource === 'branches') return usage.branchCount >= limits.maxBranches;
    return false;
  };

  const planLabel = subscription ? PLAN_LABELS[subscription.plan] : '—';

  const daysLeft = subscription?.currentPeriodEnd
    ? Math.max(0, Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const isTrialing = subscription?.status === 'trialing';

  return (
    <SubscriptionContext.Provider
      value={{ subscription, isLoading, canUseFeature, isAtLimit, planLabel, daysLeft, isTrialing }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used inside <SubscriptionProvider>');
  return ctx;
}

export { PLAN_LIMITS };
