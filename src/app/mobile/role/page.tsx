'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Shield, ArrowLeft, Briefcase } from 'lucide-react';

function RoleSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const company = searchParams.get('company') || 'Workspace';

  return (
    <div className="flex flex-col h-full min-h-[100dvh] p-6 relative">
      {/* Top Header */}
      <div className="pt-4 pb-8 flex items-center">
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors text-neutral-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center font-mono text-sm tracking-widest text-neutral-500 mr-8">
          {company}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-light text-white mb-2 text-center"
        >
          Who is logging in?
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-neutral-400 text-sm text-center mb-10"
        >
          Select your role to access the correct dashboard.
        </motion.p>

        <div className="space-y-4">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            onClick={() => router.push(`/mobile/login?role=staff&company=${company}`)}
            className="w-full bg-neutral-900 border border-white/10 hover:border-blue-500/50 hover:bg-neutral-800 transition-all rounded-2xl p-6 text-left flex items-center group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-medium text-lg">Staff Member</h3>
              <p className="text-neutral-500 text-sm">Clock in, view payslips & leave</p>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            onClick={() => router.push(`/mobile/login?role=admin&company=${company}`)}
            className="w-full bg-neutral-900 border border-white/10 hover:border-purple-500/50 hover:bg-neutral-800 transition-all rounded-2xl p-6 text-left flex items-center group relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-medium text-lg">Administrator</h3>
              <p className="text-neutral-500 text-sm">Live monitoring & approvals</p>
            </div>
          </motion.button>
        </div>
      </div>
      
      <div className="mt-auto pt-8 text-center pb-4">
        <div className="inline-flex items-center justify-center space-x-2 text-neutral-600">
          <Briefcase className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-semibold">Falcon OS</span>
        </div>
      </div>
    </div>
  );
}

export default function MobileRolePage() {
  return (
    <Suspense fallback={<div className="h-screen bg-black flex items-center justify-center"><div className="animate-spin w-6 h-6 border-2 border-white/20 border-t-white rounded-full"/></div>}>
      <RoleSelectionContent />
    </Suspense>
  );
}
