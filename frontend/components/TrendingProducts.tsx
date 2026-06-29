"use client";

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  description?: string;
}

export default function TrendingProducts({ category }: { category?: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/products`)
      .then((res) => res.json())
      .then((data: Product[]) => {
        const filtered = category && category !== 'All' 
          ? data.filter(p => p.category === category)
          : data;
        setProducts(filtered.slice(0, 4));
      })
      .catch((err) => {
        console.warn('Backend API not responding, checking local storage...', err);
        let localProducts: Product[] = [];
        if (typeof window !== 'undefined') {
          const stored = window.localStorage.getItem('nc_products');
          if (stored) {
            localProducts = JSON.parse(stored);
          }
        }
        
        if (localProducts.length > 0) {
          const filtered = category && category !== 'All' 
            ? localProducts.filter(p => p.category === category)
            : localProducts;
          setProducts(filtered.slice(0, 4));
          return;
        }

        fetch('/data/products.json')
          .then((res) => res.json())
          .then((localData: Product[]) => {
            const filtered = category && category !== 'All' 
              ? localData.filter(p => p.category === category)
              : localData;
            setProducts(filtered.slice(0, 4));
          })
          .catch((localErr) => {
            console.error('Failed to load products from local JSON', localErr);
          });
      });
  }, [category]);

  return (
    <section className="py-12 bg-transparent animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-2">
          <span className="w-1.5 h-8 bg-cyan-600 rounded-full" />
          Trending Products
        </h2>
        {products.length === 0 ? (
          <p className="text-slate-400 font-medium text-center py-6">No trending products in this category.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
