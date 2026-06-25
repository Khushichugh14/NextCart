"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FiUser, FiMail, FiMapPin, FiSettings, FiCheckCircle, FiShield, FiLogOut } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-transparent py-24 text-center text-foreground">
        <div className="glass-panel max-w-md w-full p-8 sm:p-10 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full flex items-center justify-center mx-auto border border-cyan-500/20">
            <FiUser className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Please Sign In</h2>
          <p className="text-sm text-slate-400 font-semibold">You need to be logged in to view your account details and order history.</p>
          <Link href="/login" className="w-full inline-flex items-center justify-center py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition shadow-lg shadow-cyan-600/20 active:scale-95">
            Login Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-24 px-4 sm:px-6 lg:px-8 text-foreground">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="glass-panel p-8 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
              <FiUser className="w-10 h-10" />
            </div>
            <div className="text-center sm:text-left space-y-1.5">
              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center justify-center sm:justify-start gap-2">
                <span>{user.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">Verified Account</span>
              </h1>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Active Member since June 2026 ({user.role})
              </p>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 text-slate-600 dark:text-slate-400 font-bold transition flex items-center gap-2 cursor-pointer text-sm"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Profile Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Details */}
          <div className="glass-panel p-6 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center gap-2">
              <FiShield className="text-cyan-600 dark:text-cyan-400" />
              <span>Account Information</span>
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</span>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.email}</span>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Role Type</label>
                <span className="text-sm font-semibold text-slate-850 dark:text-slate-250 font-bold">{user.role}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="glass-panel p-6 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center gap-2">
              <FiMapPin className="text-cyan-600 dark:text-cyan-400" />
              <span>Default Shipping Address</span>
            </h2>
            <div className="space-y-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <p>{user.name}</p>
              <p>1234 E-Commerce Way, Suite 100</p>
              <p>Silicon Valley, CA 94025</p>
              <p>United States</p>
            </div>
          </div>
        </div>

        {/* Settings Placeholder */}
        <div className="glass-panel p-6 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center gap-2">
            <FiSettings className="text-cyan-600 dark:text-cyan-400" />
            <span>Preferences</span>
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/40 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <span>Email Notifications</span>
              <span className="text-emerald-500 font-bold">Enabled</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/40 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <span>SMS Order Updates</span>
              <span className="text-slate-400 font-bold">Disabled</span>
            </div>
            <div className="flex justify-between items-center py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <span>Language</span>
              <span className="text-slate-800 dark:text-slate-200">English (US)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
