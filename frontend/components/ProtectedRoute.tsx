"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Wait until auth is loaded
    if (!isLoggedIn && !localStorage.getItem('nc_token')) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (requireAdmin && user?.role !== 'ROLE_ADMIN') {
      router.push('/');
      return;
    }

    setAuthorized(true);
  }, [user, isLoggedIn, router, pathname, requireAdmin]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
