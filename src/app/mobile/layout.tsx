import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Falcon App',
  description: 'Mobile Portal for Falcon T25',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Falcon App',
  },
};

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex justify-center selection:bg-blue-500/30">
      {/* Mobile Constraint Wrapper */}
      <div className="w-full h-screen max-h-screen overflow-hidden sm:max-w-[400px] sm:border-x sm:border-white/10 relative flex flex-col bg-neutral-950 shadow-2xl">
        
        {/* Subtle Background Glows */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[20%] w-[60%] h-[40%] rounded-full bg-blue-600/10 blur-[80px]"></div>
          <div className="absolute bottom-[10%] -right-[20%] w-[50%] h-[40%] rounded-full bg-purple-600/10 blur-[80px]"></div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
          {children}
        </div>
      </div>

      {/* Global styles for mobile scrollbar hiding */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        .custom-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
