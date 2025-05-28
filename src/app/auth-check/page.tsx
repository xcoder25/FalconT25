
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AppLogo } from '@/components/shared/AppLogo';

// Mock function to check setup status. In a real app, this would involve an API call or checking secure storage.
const checkSetupStatus = async (): Promise<boolean> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  // For demo purposes, we'll use localStorage.
  // IMPORTANT: localStorage is not secure for actual auth state in a production app.
  const setupComplete = localStorage.getItem('falconT25SetupComplete') === 'true';
  return setupComplete;
};

export default function AuthCheckPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Checking application status...');

  useEffect(() => {
    const verifySetup = async () => {
      const isSetupDone = await checkSetupStatus();
      if (isSetupDone) {
        setStatus('Setup complete. Redirecting to login...');
        router.replace('/login');
      } else {
        setStatus('Initial setup required. Redirecting to registration...');
        router.replace('/setup/company-registration');
      }
    };

    verifySetup();
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background text-foreground p-4">
      <AppLogo iconSize={48} textSize="text-3xl" className="mb-8" />
      <div className="flex items-center text-lg text-muted-foreground">
        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
        <span>{status}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        (This is a simulated check. In a real app, this involves secure verification.)
      </p>
    </div>
  );
}
