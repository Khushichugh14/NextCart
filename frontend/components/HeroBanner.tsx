"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function HeroBanner() {
  const [activeButton, setActiveButton] = useState<'shop' | 'explore'>('shop');
  const { formatPrice } = useAuth();

  return (
    <section className="relative w-full overflow-hidden py-16 md:py-24 bg-gradient-to-br from-cyan-500/5 via-slate-500/5 to-transparent border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex-1 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-sm font-semibold tracking-wide">
            ✨ Premium Collection Launch
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
            Elevate Your <br />
            <span className="text-emerald-600 dark:text-emerald-400">Living Space</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg">
            Experience the next level of interior design. Find the perfect minimalist furniture, modern decor, and premium seating tailored for your home.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/products"
              onMouseEnter={() => setActiveButton('shop')}
              className={`inline-flex items-center justify-center px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer ${
                activeButton === 'shop'
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-600/20'
                  : 'border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              Shop Now
            </Link>
            <Link
              href="/products?category=Furniture"
              onMouseEnter={() => setActiveButton('explore')}
              className={`inline-flex items-center justify-center px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer ${
                activeButton === 'explore'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'
                  : 'border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              Explore Furniture
            </Link>
          </div>
        </div>

        <div className="flex-1 w-full max-w-md relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-slate-500/20 rounded-3xl blur-2xl opacity-70 -z-10" />
          <div className="glass-panel rounded-3xl p-8 shadow-xl border border-white/20 dark:border-white/10 space-y-6 relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-56 h-56 opacity-60 pointer-events-none rounded-full overflow-hidden border-4 border-white/10">
              <img src="https://images.unsplash.com/photo-1701548171171-8eb12e84d438?q=80&w=600&auto=format&fit=crop" alt="Green Armchair" className="w-full h-full object-cover" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Featured Offer</span>
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Save 20%</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Emerald Lounge Chair</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[70%]">Premium velvet finish, ergonomic design, minimalist aesthetic.</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatPrice(199.99)}</span>
                <span className="text-sm text-slate-400 line-through">{formatPrice(299.99)}</span>
              </div>
              <Link 
                href="/products/7" 
                className="block w-full text-center py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold transition"
              >
                View Offer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
