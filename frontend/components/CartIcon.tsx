"use client";

import React, { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';

export default function CartIcon() {
  const { cartItems } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="p-2 rounded-full hover:bg-slate-800 transition relative"
        onClick={() => setOpen(true)}
        aria-label="Open cart"
      >
        <FaShoppingCart className="text-slate-300 hover:text-white w-5 h-5" />
        {cartItems.length > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-cyan-500 rounded-full shadow-md shadow-cyan-500/30">
            {cartItems.length}
          </span>
        )}
      </button>
      {open && <CartDrawer onClose={() => setOpen(false)} />}
    </div>
  );
}
