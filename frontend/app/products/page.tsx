"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import Pagination from '@/components/Pagination';
import { FiSearch, FiSliders } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  description: string;
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // URL sync state
  const currentCategory = searchParams.get('category') || 'All';
  const [priceRange, setPriceRange] = useState<number>(1000);
  const [sortBy, setSortBy] = useState<string>('popular');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetch('http://localhost:8080/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Backend API not responding, checking local storage...', err);
        if (typeof window !== 'undefined') {
          const stored = window.localStorage.getItem('nc_products');
          if (stored) {
            setProducts(JSON.parse(stored));
            setLoading(false);
            return;
          }
        }
        fetch('/data/products.json')
          .then((res) => res.json())
          .then((localData) => {
            setProducts(localData);
            setLoading(false);
          })
          .catch((localErr) => {
            console.error('Failed to load products from local JSON or localStorage', localErr);
            setLoading(false);
          });
      });
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat = currentCategory === 'All' || p.category === currentCategory;
      const matchesPrice = p.price <= priceRange;
      return matchesSearch && matchesCat && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'low-to-high') return a.price - b.price;
      if (sortBy === 'high-to-low') return b.price - a.price;
      return a.id - b.id; // Default / popular sorting
    });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, currentCategory, priceRange, sortBy]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const selectCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    router.push(`/products?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
          <p className="text-lg font-medium text-slate-500">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-24 px-4 sm:px-6 lg:px-8 text-foreground">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Mobile Filter Toggle Button */}
          <div className="w-full lg:hidden mb-2">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl glass-panel border border-white/20 dark:border-white/5 font-bold text-slate-800 dark:text-slate-200 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-98"
            >
              <FiSliders className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>{showMobileFilters ? "Hide Filters" : "Show Filters & Sorting"}</span>
            </button>
          </div>

          {/* Side Filters Panel (collapsible on mobile, always visible on desktop) */}
          <aside className={`w-full lg:w-64 shrink-0 glass-panel p-6 rounded-2xl border border-white/20 dark:border-white/5 space-y-6 ${showMobileFilters ? 'block animate-fadeIn' : 'hidden lg:block'}`}>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <FiSliders className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Filters</span>
              </h2>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-slate-400 uppercase tracking-wider">Category</h3>
              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => selectCategory(cat)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
                      currentCategory === cat
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-sm text-slate-400 uppercase tracking-wider">Price Range</h3>
                <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{formatPrice(priceRange)}</span>
              </div>
              <input
                type="range"
                min={10}
                max={1000}
                step={10}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-cyan-600 dark:accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>{formatPrice(10)}</span>
                <span>{formatPrice(1000)}</span>
              </div>
            </div>

            {/* Sort Order */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-slate-400 uppercase tracking-wider">Sort By</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm border-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-amber-700 dark:focus:ring-amber-500 focus:outline-none"
              >
                <option value="popular">Popular</option>
                <option value="low-to-high">Price: Low to High</option>
                <option value="high-to-low">Price: High to Low</option>
              </select>
            </div>
          </aside>

          {/* Product Grid and Search */}
          <div className="flex-1 w-full space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:max-w-md">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-0 glass-panel bg-white/70 dark:bg-slate-900/40 text-sm focus:ring-2 focus:ring-amber-700 dark:focus:ring-amber-500 focus:outline-none placeholder-slate-400"
                />
                <FiSearch className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
              </div>
              <div className="text-sm text-slate-400 font-medium">
                Showing {filtered.length} products
              </div>
            </div>

            {/* Horizontal Category selector */}
            <div 
              className="flex flex-wrap gap-2.5 pb-2"
              onMouseLeave={() => setHoveredCat(null)}
            >
              {categories.map((cat) => {
                const isHighlighted = hoveredCat ? hoveredCat === cat : currentCategory === cat;
                return (
                  <button
                    key={cat}
                    onMouseEnter={() => setHoveredCat(cat)}
                    onClick={() => selectCategory(cat)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                      isHighlighted
                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20 font-bold scale-102'
                        : 'glass-panel text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>

            {filtered.length === 0 ? (
              <div className="glass-panel text-center py-16 rounded-2xl border border-white/20 dark:border-white/5">
                <p className="text-slate-400 font-medium text-lg">No products match your current filters.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {paginatedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-transparent text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
          <p className="text-lg font-medium text-slate-500">Loading shop content...</p>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
