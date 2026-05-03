
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLogo } from '@/components/shared/AppLogo';
import { FalconIcon } from '@/components/shared/FalconIcon';

const SPLASH_MESSAGES = [
  'Initializing AI engines...',
  'Connecting secure channels...',
  'Loading recognition systems...',
  'Preparing your dashboard...',
];

export default function HomePage() {
  const router = useRouter();
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cycle through status messages every 700ms
    const msgTimer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % SPLASH_MESSAGES.length);
    }, 700);

    // Animate progress bar over 3s
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 100));
    }, 60);

    // Navigate after 3 seconds
    const navTimer = setTimeout(() => {
      clearInterval(msgTimer);
      clearInterval(progressInterval);
      try {
        const guideComplete = localStorage.getItem('falconT25GuideComplete') === 'true';
        if (!guideComplete) {
          router.replace('/setup/dev-guide');
        } else {
          router.replace('/auth-check');
        }
      } catch {
        router.replace('/auth-check');
      }
    }, 3000);

    return () => {
      clearTimeout(navTimer);
      clearInterval(msgTimer);
      clearInterval(progressInterval);
    };
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background text-foreground relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-violet-500/5 blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl scale-150 animate-pulse" />
          <AppLogo iconSize={80} textSize="text-5xl" className="relative" />
        </div>

        <p className="text-sm text-muted-foreground/70 tracking-widest uppercase">
          AI-Powered Workforce Platform
        </p>

        {/* Progress bar */}
        <div className="w-64 h-0.5 bg-muted rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-primary rounded-full transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status message */}
        <p className="text-xs text-muted-foreground animate-pulse h-4">
          {SPLASH_MESSAGES[msgIndex]}
        </p>
      </div>

      {/* Version */}
      <div className="absolute bottom-6 text-[10px] text-muted-foreground/40 tracking-wider">
        FALCON T25 · v2.0.0 · ENTERPRISE EDITION
      </div>
    </div>
  );
}
