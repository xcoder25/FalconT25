'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Fingerprint, Bell, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { addAttendanceEvent } from '@/lib/firestoreService';
import { useToast } from '@/hooks/use-toast';

export default function WorkerDashboardPage() {
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [status, setStatus] = useState<'out' | 'in'>('out');
  const { user } = useAuth();
  const { toast } = useToast();

  const handleRemoteClockIn = async () => {
    setIsClockingIn(true);
    
    try {
      // Simulate getting GPS location
      await new Promise(r => setTimeout(r, 1000));
      
      // Use the actual backend if user has a tenantId, otherwise fallback to demo
      const tenantIdToUse = user?.tenantId || 'demo-tenant';
      const staffIdToUse = user?.uid || 'staff-remote';
      const staffNameToUse = user?.displayName || 'Sarah (Remote)';

      await addAttendanceEvent(tenantIdToUse, {
        staffMemberId: staffIdToUse,
        staffName: staffNameToUse,
        type: 'signin',
        camera: 'Mobile App (GPS Verified)',
        timestamp: new Date().toISOString(),
      });

      setStatus('in');
      toast({
        title: "Clocked In Successfully",
        description: "Your location was verified via GPS.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Clock In Failed",
        description: error.message || "Could not connect to server.",
        variant: "destructive"
      });
    } finally {
      setIsClockingIn(false);
    }
  };

  const handleRemoteClockOut = async () => {
    try {
      const tenantIdToUse = user?.tenantId || 'demo-tenant';
      const staffIdToUse = user?.uid || 'staff-remote';
      const staffNameToUse = user?.displayName || 'Sarah (Remote)';

      await addAttendanceEvent(tenantIdToUse, {
        staffMemberId: staffIdToUse,
        staffName: staffNameToUse,
        type: 'signout',
        camera: 'Mobile App (GPS Verified)',
        timestamp: new Date().toISOString(),
      });

      setStatus('out');
      toast({
        title: "Clocked Out",
        description: "Your session has ended.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not connect to server.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Hi, Sarah</h1>
          <p className="text-neutral-400 text-sm">Product Designer • HQ</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center relative">
          <Bell className="w-5 h-5 text-neutral-400" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border border-neutral-900" />
        </button>
      </div>

      {/* Main Status Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 mb-8"
      >
        <div className={`absolute inset-0 opacity-20 ${status === 'in' ? 'bg-gradient-to-br from-green-500 to-emerald-700' : 'bg-gradient-to-br from-blue-500 to-indigo-700'}`} />
        <div className={`absolute inset-0 border rounded-3xl ${status === 'in' ? 'border-green-500/30' : 'border-blue-500/30'}`} />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${status === 'in' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-neutral-900 text-neutral-400 border border-white/10'}`}>
              <div className={`w-2 h-2 rounded-full ${status === 'in' ? 'bg-green-400 animate-pulse' : 'bg-neutral-500'}`} />
              <span>{status === 'in' ? 'Currently Clocked In' : 'Currently Clocked Out'}</span>
            </div>
            {status === 'in' && (
              <span className="text-sm font-medium text-white">Since 8:52 AM</span>
            )}
          </div>

          <div className="text-center py-4">
            <h2 className="text-5xl font-light text-white mb-2 tracking-tight">
              {status === 'in' ? '04:12' : '--:--'}
            </h2>
            <p className="text-neutral-400 text-sm">Hours logged today</p>
          </div>

          {status === 'out' && (
            <button 
              onClick={handleRemoteClockIn}
              disabled={isClockingIn}
              className="w-full mt-4 bg-white text-black rounded-2xl py-4 font-semibold flex items-center justify-center transition-all active:scale-95 disabled:opacity-80"
            >
              {isClockingIn ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  <span>Locating GPS...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Remote Clock In</span>
                </div>
              )}
            </button>
          )}

          {status === 'in' && (
            <button 
              onClick={handleRemoteClockOut}
              className="w-full mt-4 bg-neutral-900/50 backdrop-blur border border-white/10 text-white rounded-2xl py-4 font-medium flex items-center justify-center transition-all active:scale-95"
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-neutral-400" />
                <span>Clock Out</span>
              </div>
            </button>
          )}
        </div>
      </motion.div>

      {/* Action Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-4 flex flex-col justify-between h-32">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Fingerprint className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">Face ID</h3>
            <p className="text-neutral-500 text-xs">Active & trained</p>
          </div>
        </div>
        
        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-4 flex flex-col justify-between h-32">
          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-medium text-lg">38.5</h3>
            <p className="text-neutral-500 text-xs">Hours this week</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Recent Activity</h3>
          <button className="text-sm text-blue-400 flex items-center">
            View all <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        <div className="space-y-3">
          {[
            { title: 'Clocked Out', time: 'Yesterday, 5:00 PM', type: 'ai' },
            { title: 'Clocked In', time: 'Yesterday, 8:55 AM', type: 'ai' },
            { title: 'Remote Clock In', time: 'Mon, 9:02 AM', type: 'gps' },
          ].map((activity, i) => (
            <div key={i} className="bg-neutral-900 rounded-2xl p-4 flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${activity.type === 'ai' ? 'bg-blue-500/10' : 'bg-green-500/10'}`}>
                {activity.type === 'ai' ? <Fingerprint className="w-5 h-5 text-blue-400" /> : <MapPin className="w-5 h-5 text-green-400" />}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm">{activity.title}</h4>
                <p className="text-neutral-500 text-xs">{activity.time}</p>
              </div>
              <div className="text-xs font-medium px-2 py-1 rounded-md bg-neutral-800 text-neutral-400">
                {activity.type === 'ai' ? 'Office Camera' : 'GPS Verified'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
