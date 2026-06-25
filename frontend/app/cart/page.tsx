"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { FiTrash2, FiShoppingBag, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

export default function CartPage() {
  const { cartItems, updateQuantity, removeItem, clearCart } = useCart();
  const { formatPrice } = useAuth();
  const [coupon, setCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = subtotal * appliedDiscount;
  const total = subtotal - discountAmount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (coupon.toLowerCase() === 'save20') {
      setAppliedDiscount(0.2);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try "SAVE20"');
    }
  };

  const handleCheckout = () => {
    setCheckoutSuccess(true);
    clearCart();
  };

  if (checkoutSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent py-24 px-4 text-center text-foreground">
        <div className="glass-panel max-w-md w-full p-8 sm:p-12 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <FiCheckCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Order Confirmed!</h2>
            <p className="text-slate-500 dark:text-slate-400">
              Thank you for your purchase. Your order has been received and is being processed.
            </p>
          </div>
          <Link
            href="/products"
            className="block w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition shadow-lg shadow-cyan-600/20"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-24 px-4 sm:px-6 lg:px-8 text-foreground">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-2">
          <FiShoppingBag className="text-cyan-600 dark:text-cyan-400" />
          <span>Shopping Cart</span>
        </h1>

        {cartItems.length === 0 ? (
          <div className="glass-panel text-center py-20 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl space-y-6">
            <p className="text-slate-400 text-lg font-medium">Your cart is empty.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition shadow-lg shadow-cyan-600/20"
            >
              <FiArrowLeft /> Fill It with Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="glass-panel p-4 rounded-2xl border border-white/20 dark:border-white/5 flex gap-4 items-center"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900/50 shrink-0 border border-white/10">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate text-base">{item.name}</h3>
                    <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 mt-1">{formatPrice(item.price)}</p>
                  </div>
                  
                  {/* Quantity manager */}
                  <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/30 p-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 hover:text-cyan-600 dark:hover:text-cyan-400 text-slate-500 font-bold transition text-sm"
                    >
                      -
                    </button>
                    <span className="px-2 text-center font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 hover:text-cyan-600 dark:hover:text-cyan-400 text-slate-500 font-bold transition text-sm"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2.5 text-slate-400 hover:text-rose-500 transition rounded-full hover:bg-rose-500/10"
                    aria-label="Remove item"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              
              <button
                onClick={clearCart}
                className="text-sm text-slate-500 hover:text-rose-500 font-semibold transition"
              >
                Clear All Items
              </button>
            </div>

            {/* Order Summary Card */}
            <div className="glass-panel p-6 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl space-y-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                Order Summary
              </h2>
              
              {/* Promo Code Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Have a Coupon?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. SAVE20"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:hover:bg-slate-100 dark:text-slate-900 rounded-xl transition"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-xs font-semibold text-rose-500">{couponError}</p>}
                {appliedDiscount > 0 && <p className="text-xs font-semibold text-emerald-500">20% Discount Applied!</p>}
              </form>

              <div className="space-y-3 text-sm font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-4">
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
                <div className="flex justify-between text-lg font-bold text-slate-800 dark:text-slate-100 border-t border-dashed border-slate-200 dark:border-slate-800 pt-3">
                  <span>Total</span>
                  <span className="text-cyan-600 dark:text-cyan-400">{formatPrice(total)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white rounded-2xl font-bold shadow-lg shadow-cyan-600/20 transition active:scale-95 text-center block"
              >
                Proceed to Checkout
              </Link>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
