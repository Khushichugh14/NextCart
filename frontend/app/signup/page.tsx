"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FiLock, FiMail, FiUser, FiArrowRight, FiPhone, FiGlobe } from 'react-icons/fi';
import { REGIONS } from '@/context/AuthContext';

function SignupFormContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectDestination = searchParams.get('redirect') || '/';
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('US');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setCountryCode(code);
    if (code === '+1') setRegion('US');
    else if (code === '+91') setRegion('IN');
    else if (code === '+44') setRegion('GB');
    else if (['+33', '+49', '+34', '+39'].includes(code)) setRegion('EU');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone: countryCode + phone, region }),
      });

      if (!response.ok) {
        throw new Error('Failed to register');
      }

      const data = await response.json();
      
      const loggedUser = {
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        region: data.region,
      };

      login(data.token, loggedUser);
      router.push(redirectDestination);
    } catch (err) {
      setError('Failed to create account. Email might already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center text-foreground">
      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-white/20 dark:border-white/5 shadow-2xl space-y-6 relative overflow-hidden">
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl -z-10" />
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
            <FiUser className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Create Account</h2>
          <p className="text-sm text-slate-400 font-semibold">Join NextCart today</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 text-rose-500 p-3.5 rounded-xl border border-rose-500/20 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
              />
              <FiUser className="absolute left-3.5 top-3.5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
              />
              <FiMail className="absolute left-3.5 top-3.5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
              />
              <FiLock className="absolute left-3.5 top-3.5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Phone Number</label>
            <div className="flex gap-2 relative">
              <select
                value={countryCode}
                onChange={handleCountryCodeChange}
                className="w-24 pl-2 pr-1 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
              >
                <option value="+1">+1 (US)</option>
                <option value="+91">+91 (IN)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+33">+33 (FR)</option>
                <option value="+49">+49 (DE)</option>
              </select>
              <div className="relative flex-1">
                <input
                  type="tel"
                  placeholder="1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
                />
                <FiPhone className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Region</label>
            <div className="relative">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition appearance-none"
              >
                {Object.values(REGIONS).map((r) => (
                  <option key={r.code} value={r.code}>{r.name} ({r.code})</option>
                ))}
              </select>
              <FiGlobe className="absolute left-3.5 top-3.5 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-600/20 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
            {!loading && <FiArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-sm font-semibold text-slate-400 mt-4 text-center">
          Already have an account? <a href="/login" className="text-cyan-600 hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-transparent text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-600 border-t-transparent animate-spin" />
          <p className="text-lg font-medium text-slate-500">Loading...</p>
        </div>
      </div>
    }>
      <SignupFormContent />
    </Suspense>
  );
}
