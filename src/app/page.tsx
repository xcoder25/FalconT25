
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLogo } from '@/components/shared/AppLogo';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [message, setMessage] = useState('Loading Falcon T25... Please wait.');

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage('Initializing application state...');
      // In a real app, you might perform some checks here
      // For now, we directly navigate to auth-check
      router.replace('/auth-check');
    }, 2500); // Reduced splash time, as auth-check will handle further redirection logic

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background text-foreground p-4">
      <div className="animate-pulse mb-6">
        <AppLogo iconSize={64} textSize="text-5xl" />
      </div>
      <div className="flex items-center text-lg text-muted-foreground">
        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  );
}

