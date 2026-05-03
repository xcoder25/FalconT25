'use client';

import React from 'react';
import { Home, Clock, Calendar, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function WorkerMobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Home', path: '/mobile/worker/dashboard', icon: Home },
    { name: 'History', path: '/mobile/worker/history', icon: Clock },
    { name: 'Leave', path: '/mobile/worker/leave', icon: Calendar },
    { name: 'Profile', path: '/mobile/worker/profile', icon: User },
  ];

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-24">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 w-full bg-neutral-900/90 backdrop-blur-lg border-t border-white/10 pb-safe">
        <div className="flex justify-around items-center p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center justify-center w-16 h-12 relative ${isActive ? 'text-blue-400' : 'text-neutral-500 hover:text-neutral-300'} transition-colors`}
              >
                {isActive && (
                  <div className="absolute -top-3 w-10 h-1 bg-blue-500 rounded-b-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                )}
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'animate-pulse' : ''}`} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
