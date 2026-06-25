"use client";

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';

interface CartDrawerProps {
  onClose: () => void;
}

export default function CartDrawer({ onClose }: CartDrawerProps) {
  const { cartItems, removeItem, updateQuantity, clearCart } = useCart();
  const { formatPrice } = useAuth();
  const [coupon, setCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = subtotal * appliedDiscount;
  const total = subtotal - discountAmount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (coupon.toLowerCase() === 'save20') {
      setAppliedDiscount(0.2);
    } else {
      alert('Invalid coupon code!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md h-full bg-white dark:bg-[#0c1220] p-6 overflow-y-auto shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div>
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FiShoppingBag className="text-cyan-600 dark:text-cyan-400" />
              <span>Your Cart ({cartItems.length})</span>
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-500">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          {cartItems.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-slate-400 font-medium">Your cart is empty.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[50vh] overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <li key={item.id} className="flex gap-4 py-4 items-center">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shrink-0">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{item.name}</p>
                    <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 bg-slate-50 dark:bg-slate-900">
                    <button
                      onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 hover:text-cyan-600 dark:hover:text-cyan-400 text-slate-500 transition"
                      aria-label="Decrease quantity"
                    >
                      <FiMinus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-slate-700 dark:text-slate-300">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:text-cyan-600 dark:hover:text-cyan-400 text-slate-500 transition"
                      aria-label="Increase quantity"
                    >
                      <FiPlus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition rounded-full hover:bg-rose-500/10"
                    aria-label="Remove item"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer Summary & Checkout Actions */}
        {cartItems.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0c1220] mt-auto">
            {/* Promo Code Form */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Promo code (e.g. SAVE20)"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400"
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:hover:bg-slate-100 dark:text-slate-900 rounded-xl transition"
              >
                Apply
              </button>
            </form>

            {/* Calculations */}
            <div className="space-y-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-800 dark:text-slate-100 font-semibold">{formatPrice(subtotal)}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-500 font-semibold">
                  <span>Discount (20%)</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-slate-800 dark:text-slate-100 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                <span>Total</span>
                <span className="text-cyan-600 dark:text-cyan-400">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-600/20 transition active:scale-95 text-center block"
              >
                Proceed to Checkout
              </Link>
              <button
                onClick={clearCart}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
