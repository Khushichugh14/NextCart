"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  name: string;
  email: string;
  role: 'ROLE_ADMIN' | 'ROLE_USER';
  phone?: string;
  region?: string;
}

export const REGIONS = {
  US: { name: 'United States', code: 'US', currency: 'USD', symbol: '$', rate: 1.0 },
  IN: { name: 'India', code: 'IN', currency: 'INR', symbol: '₹', rate: 83.0 },
  EU: { name: 'Europe', code: 'EU', currency: 'EUR', symbol: '€', rate: 0.92 },
  GB: { name: 'United Kingdom', code: 'GB', currency: 'GBP', symbol: '£', rate: 0.79 },
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  formatPrice: (priceInUSD: number) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('nc_user');
    const savedToken = localStorage.getItem('nc_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        console.error("Failed to parse saved user", e);
        logout();
      }
    }
    setIsLoaded(true);
  }, []);

  const login = (newToken: string, loggedUser: User) => {
    setUser(loggedUser);
    setToken(newToken);
    localStorage.setItem('nc_user', JSON.stringify(loggedUser));
    localStorage.setItem('nc_token', newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nc_user');
    localStorage.removeItem('nc_token');
  };

  const formatPrice = (priceInUSD: number): string => {
    const regionKey = user?.region || 'US';
    const regionConfig = REGIONS[regionKey as keyof typeof REGIONS] || REGIONS.US;
    const converted = priceInUSD * regionConfig.rate;
    return `${regionConfig.symbol}${converted.toFixed(2)}`;
  };

  if (!isLoaded) return null; // Or a loader

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn: !!user, login, logout, formatPrice }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

