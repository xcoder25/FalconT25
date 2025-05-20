
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLogo } from '@/components/shared/AppLogo';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 5000); // Display splash screen for 5 seconds

    return () => clearTimeout(timer); // Cleanup the timer if the component unmounts
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background text-foreground p-4">
      <div className="animate-pulse mb-6">
        <AppLogo iconSize={64} textSize="text-5xl" />
      </div>
      <div className="flex items-center text-lg text-muted-foreground">
        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
        <span>Loading Falcon T25... Please wait.</span>
      </div>
    </div>
  );
}
