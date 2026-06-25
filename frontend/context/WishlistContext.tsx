"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

interface WishlistContextProps {
  wishlistItems: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: number) => void;
}

const WishlistContext = createContext<WishlistContextProps | undefined>(undefined);

export const useWishlist = (): WishlistContextProps => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('wishlist');
    if (stored) setWishlistItems(JSON.parse(stored));
  }, []);

  // Persist changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addItem = (item: WishlistItem) => {
    setWishlistItems((prev) => {
      if (prev.find((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const removeItem = (id: number) => {
    setWishlistItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, addItem, removeItem }}>
      {children}
    </WishlistContext.Provider>
  );
};
