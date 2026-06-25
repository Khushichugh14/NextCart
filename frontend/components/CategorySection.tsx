"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FiCpu, FiWatch, FiActivity, FiBookOpen, FiHome } from 'react-icons/fi';

const categories = [
  { name: 'Electronics', icon: FiCpu },
  { name: 'Fashion', icon: FiWatch },
  { name: 'Fitness', icon: FiActivity },
  { name: 'Books', icon: FiBookOpen },
  { name: 'Home & Kitchen', icon: FiHome },
];

interface CategorySectionProps {
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export default function CategorySection({ activeCategory, onSelectCategory }: CategorySectionProps) {
  const searchParams = useSearchParams();
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const currentCategory = activeCategory || searchParams.get('category') || 'All';

  const handleClick = (e: React.MouseEvent, cat: string) => {
    if (onSelectCategory) {
      e.preventDefault();
      onSelectCategory(cat);
    }
  };

  return (
    <section className="py-8 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="flex flex-wrap items-center justify-center gap-3"
          onMouseLeave={() => setHoveredCat(null)}
        >
          <Link
            href="/products"
            onMouseEnter={() => setHoveredCat('All')}
            onClick={(e) => handleClick(e, 'All')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer ${
              (hoveredCat ? hoveredCat === 'All' : currentCategory === 'All')
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                : 'glass-panel text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Products
          </Link>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = hoveredCat ? hoveredCat === cat.name : currentCategory === cat.name;
            return (
              <Link
                key={cat.name}
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                onMouseEnter={() => setHoveredCat(cat.name)}
                onClick={(e) => handleClick(e, cat.name)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                    : 'glass-panel text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
