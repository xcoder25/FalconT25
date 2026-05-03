'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Building2, ArrowRight, ScanLine } from 'lucide-react';

export default function MobileCompanyCodePage() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter a company code');
      return;
    }
    
    setError('');
    setIsLoading(true);

    // Simulate API check for company code
    setTimeout(() => {
      // We will just pass it via URL parameters for now
      router.push(`/mobile/role?company=${encodeURIComponent(code.toUpperCase())}`);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full min-h-[100dvh] p-6 relative">
      {/* Top Header Space */}
      <div className="flex-1 flex flex-col justify-center max-h-[40vh]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6"
        >
          <Building2 className="w-8 h-8 text-blue-400" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl font-light tracking-tight text-white mb-2"
        >
          Connect to<br />
          <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            Workspace
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-neutral-400 text-sm"
        >
          Enter your company's unique code or routing number to continue.
        </motion.p>
      </div>

      {/* Form Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex-1 flex flex-col justify-end pb-8"
      >
        <form onSubmit={handleContinue} className="space-y-4">
          <div className="space-y-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <ScanLine className="h-5 w-5 text-neutral-500" />
              </div>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError('');
                }}
                className="block w-full pl-12 pr-4 py-4 bg-neutral-900 border border-white/10 rounded-2xl text-white placeholder-neutral-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono tracking-widest text-lg uppercase"
                placeholder="FALCON-X89"
                maxLength={12}
              />
            </div>
            {error && (
              <p className="text-red-400 text-xs px-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="w-full relative group overflow-hidden rounded-2xl bg-white text-black font-medium py-4 px-4 transition-all hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-neutral-500 text-xs">
            Don't have a code? Ask your HR administrator.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
