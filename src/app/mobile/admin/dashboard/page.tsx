'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AdminMobileDashboard() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">HQ Status</h1>
          <p className="text-neutral-400 text-sm">Live Monitoring</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center relative">
          <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/10 rounded-3xl p-5"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-neutral-400">Present</span>
          </div>
          <div className="text-4xl font-light text-white">42<span className="text-xl text-neutral-500">/50</span></div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/10 rounded-3xl p-5"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-neutral-400">On Time</span>
          </div>
          <div className="text-4xl font-light text-white">95<span className="text-xl text-neutral-500">%</span></div>
        </motion.div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-white mb-4">Pending Approvals</h3>
        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 mr-3 flex items-center justify-center text-blue-400 font-medium">JD</div>
              <div>
                <p className="text-sm font-medium text-white">John Doe</p>
                <p className="text-xs text-neutral-500">Sick Leave • Tomorrow</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors">
                <AlertTriangle className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
             <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 mr-3 flex items-center justify-center text-purple-400 font-medium">AW</div>
              <div>
                <p className="text-sm font-medium text-white">Alice Wong</p>
                <p className="text-xs text-neutral-500">Missed Clock-in • Today</p>
              </div>
            </div>
            <div className="flex space-x-2">
               <button className="text-xs font-medium bg-white text-black px-3 py-1.5 rounded-lg">Review</button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Live Camera Feed</h3>
        <div className="w-full h-48 bg-neutral-900 rounded-2xl border border-white/10 relative overflow-hidden flex items-center justify-center group cursor-pointer">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity blur-[1px]" />
          <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span>REC</span>
          </div>
          <div className="absolute inset-0 border-2 border-white/10" />
          <div className="z-10 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white font-medium flex items-center">
             <Activity className="w-4 h-4 mr-2 text-purple-400" />
             View All Cameras
          </div>
        </div>
      </div>
    </div>
  );
}
