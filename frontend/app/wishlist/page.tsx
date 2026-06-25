"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowLeft } from 'react-icons/fi';

export default function WishlistPage() {
  const { wishlistItems, removeItem } = useWishlist();
  const { addItem: addToCart } = useCart();
  const { formatPrice } = useAuth();

  const handleMoveToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
    });
    removeItem(item.id);
  };

  return (
    <div className="min-h-screen bg-transparent py-24 px-4 sm:px-6 lg:px-8 text-foreground">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-2">
          <FiHeart className="text-cyan-600 dark:text-cyan-400 fill-cyan-600/10" />
          <span>My Wishlist</span>
        </h1>

        {wishlistItems.length === 0 ? (
          <div className="glass-panel text-center py-20 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl space-y-6">
            <p className="text-slate-400 text-lg font-medium">Your wishlist is empty.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition shadow-lg shadow-cyan-600/20"
            >
              <FiArrowLeft /> Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="glass-panel p-4 rounded-2xl border border-white/20 dark:border-white/5 flex gap-4 items-center"
              >
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900/50 shrink-0 border border-white/10">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate text-base">{item.name}</h3>
                    <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 mt-1">{formatPrice(item.price)}</p>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition shadow-sm"
                    >
                      <FiShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 transition rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-rose-500/10"
                      aria-label="Remove item"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
