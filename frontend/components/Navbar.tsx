"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import CartIcon from "@/components/CartIcon";
import WishlistIcon from "@/components/WishlistIcon";
import { useAuth, REGIONS } from "@/context/AuthContext";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Orders", href: "/orders" },
    { name: "Profile", href: "/profile" },
    ...(user?.role === 'ROLE_ADMIN' ? [{ name: "Admin", href: "/admin" }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-slate-900 border-b border-slate-800 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center space-x-2 select-none">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-cyan-500 flex items-center justify-center shadow-sm">
            <Image src="/logo.png" alt="NextCart Logo" fill className="object-contain p-1" unoptimized />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">NextCart</span>
        </Link>

        {/* Desktop menu */}
        <div 
          className="hidden md:flex space-x-2 items-center"
          onMouseLeave={() => setHoveredLink(null)}
        >
          {navLinks.map((link) => {
            const isHighlighted = hoveredLink 
              ? hoveredLink === link.href 
              : (mounted && pathname === link.href);
            return (
              <Link 
                key={link.name} 
                href={link.href} 
                onMouseEnter={() => setHoveredLink(link.href)}
                className={`px-3 py-1.5 rounded-xl font-semibold tracking-wide transition text-sm cursor-pointer ${
                  isHighlighted 
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/25 font-bold scale-102' 
                    : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/40'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="h-4 w-[1px] bg-slate-800 mx-2" />
          <CartIcon />
          <WishlistIcon />
          <div className="h-4 w-[1px] bg-slate-800 mx-2" />
          {mounted && (user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-300">
                Hi, {user.name} ({REGIONS[user.region as keyof typeof REGIONS]?.symbol || '$'})
              </span>
              <button 
                onClick={logout}
                className="px-3 py-1.5 rounded-xl font-bold tracking-wide transition text-xs cursor-pointer border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-850"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              href="/login"
              className="px-4 py-1.5 rounded-xl font-bold tracking-wide transition text-xs cursor-pointer bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-600/25"
            >
              Login
            </Link>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition focus:outline-none"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="px-2 pt-2 pb-4 space-y-1.5">
            {navLinks.map((link) => {
              const isActive = mounted && pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`block px-3 py-2 rounded-xl text-base font-semibold transition ${
                    isActive 
                      ? 'bg-cyan-600 text-white font-bold' 
                      : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="flex flex-col gap-3 px-3 py-3 border-t border-slate-800 mt-3">
              <div className="flex space-x-4">
                <CartIcon />
                <WishlistIcon />
              </div>
              {mounted && (user ? (
                <div className="flex flex-col gap-2 pt-2">
                  <span className="text-sm font-bold text-slate-300">
                    Logged in as {user.name} ({REGIONS[user.region as keyof typeof REGIONS]?.symbol || '$'})
                  </span>
                  <button 
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl font-bold tracking-wide transition text-sm text-center cursor-pointer border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login"
                  className="w-full py-2.5 rounded-xl font-bold tracking-wide transition text-sm text-center cursor-pointer bg-cyan-600 hover:bg-cyan-700 text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
