
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLogo } from '@/components/shared/AppLogo';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  // Set the initial message directly.
  const [message, setMessage] = useState('Loading Falcon T25... Please wait.');

  useEffect(() => {
    // This timer will handle the navigation after 30 seconds.
    const navigationTimer = setTimeout(() => {
      setMessage('Initializing application state...'); // Update message before navigating
      router.replace('/auth-check');
    }, 30000); // 30 seconds delay

    // Cleanup timer on component unmount
    return () => {
      clearTimeout(navigationTimer);
    };
  }, [router]); // Only re-run if router changes (which it shouldn't in this context)

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
