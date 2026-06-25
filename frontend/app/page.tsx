"use client";

import { useState } from 'react';
import HeroBanner from '@/components/HeroBanner';
import CategorySection from '@/components/CategorySection';
import TrendingProducts from '@/components/TrendingProducts';
import FeaturedProducts from '@/components/FeaturedProducts';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  return (
    <>
      <HeroBanner />
      <CategorySection activeCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
      <TrendingProducts category={selectedCategory} />
      <FeaturedProducts category={selectedCategory} />
    </>
  );
}
