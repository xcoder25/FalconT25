'use client';

import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Mail, Lock, LogIn, Users, Shield } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const company = searchParams.get('company') || 'Workspace';
  const role = searchParams.get('role') as 'staff' | 'admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isStaff = role === 'staff';
  const Icon = isStaff ? Users : Shield;
  const colorClass = isStaff ? 'text-blue-400' : 'text-purple-400';
  const bgClass = isStaff ? 'bg-blue-500/10' : 'bg-purple-500/10';
  const borderClass = isStaff ? 'focus:border-blue-500 focus:ring-blue-500/50' : 'focus:border-purple-500 focus:ring-purple-500/50';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    setError('');
    setIsLoading(true);

    // Simulate authentication
    setTimeout(() => {
      if (isStaff) {
        router.push('/mobile/worker/dashboard');
      } else {
        router.push('/mobile/admin/dashboard');
      }
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full min-h-[100dvh] p-6 relative">
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

      <div className="flex-1 flex flex-col justify-center pb-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className={`w-20 h-20 rounded-3xl mx-auto ${bgClass} flex items-center justify-center mb-8 shadow-2xl`}
        >
          <Icon className={`w-10 h-10 ${colorClass}`} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-semibold text-white mb-1">
            {isStaff ? 'Staff Portal' : 'Admin Access'}
          </h2>
          <p className="text-neutral-400 text-sm">
            Sign in to your {company} account
          </p>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleLogin} 
          className="space-y-4"
        >
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-neutral-500" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className={`block w-full pl-12 pr-4 py-4 bg-neutral-900 border border-white/10 rounded-2xl text-white placeholder-neutral-500 focus:ring-2 transition-all ${borderClass}`}
                placeholder="Email address"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className={`block w-full pl-12 pr-4 py-4 bg-neutral-900 border border-white/10 rounded-2xl text-white placeholder-neutral-500 focus:ring-2 transition-all ${borderClass}`}
                placeholder="Password"
              />
            </div>
            
            {error && (
              <p className="text-red-400 text-xs px-2 text-center">{error}</p>
            )}
          </div>

          <div className="flex justify-end px-1 pt-2">
            <a href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full relative group overflow-hidden rounded-2xl ${isStaff ? 'bg-blue-600 hover:bg-blue-500' : 'bg-purple-600 hover:bg-purple-500'} text-white font-medium py-4 px-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-6`}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Secure Login</span>
                <LogIn className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}

export default function MobileLoginPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-black flex items-center justify-center"><div className="animate-spin w-6 h-6 border-2 border-white/20 border-t-white rounded-full"/></div>}>
      <LoginContent />
    </Suspense>
  );
}
