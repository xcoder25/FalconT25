
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLogo } from '@/components/shared/AppLogo';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isSplashReady, setIsSplashReady] = useState(false); // New state

  useEffect(() => {
    // Brief delay to ensure client-side readiness for the splash display
    const readyTimer = setTimeout(() => {
      setIsSplashReady(true);
      setMessage('Loading Falcon T25... Please wait.');
    }, 100); // 100ms delay for client-side readiness

    // Navigation timer: 30 seconds after the splash is considered ready
    const navigationTimer = setTimeout(() => {
      setMessage('Initializing application state...');
      router.replace('/auth-check');
    }, 30000 + 100); // Total 30.1 seconds from component mount

    return () => {
      clearTimeout(readyTimer);
      clearTimeout(navigationTimer);
    };
  }, [router]);

  if (!isSplashReady) {
    // Minimal loader shown for the first 100ms or until splash is ready
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background text-foreground p-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background text-foreground p-4">
      <div className="animate-pulse mb-8">
        <AppLogo iconSize={80} textSize="text-6xl" />
      </div>
      <div className="flex items-center text-lg text-muted-foreground">
        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  );
}
