
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
    }, 30000); // Set delay to 30 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background text-foreground p-4">
      <div className="animate-pulse mb-8"> {/* Increased mb for more space */}
        <AppLogo iconSize={80} textSize="text-6xl" /> {/* Increased logo size */}
      </div>
      <div className="flex items-center text-lg text-muted-foreground">
        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  );
}
