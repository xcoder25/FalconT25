
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Shield } from 'lucide-react';
import { AppLogo } from '@/components/shared/AppLogo';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function AuthCheckPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Verifying session...');

  useEffect(() => {
    // Wait for Firebase to resolve auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Already authenticated — go straight to dashboard
        setStatus('Session found. Loading dashboard...');
        router.replace('/dashboard');
      } else {
        // Check if initial setup has been completed
        try {
          const setupComplete = localStorage.getItem('falconT25SetupComplete') === 'true';
          if (setupComplete) {
            setStatus('Redirecting to login...');
            router.replace('/login');
          } else {
            setStatus('First time setup required...');
            router.replace('/setup/company-registration');
          }
        } catch {
          router.replace('/login');
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background text-foreground p-4 gap-6">
      <AppLogo iconSize={48} textSize="text-3xl" />
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">{status}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
          <Shield className="h-3 w-3" />
          <span>Secured with Firebase Authentication</span>
        </div>
      </div>
    </div>
  );
}
