"use client";

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { FiHeart, FiShoppingCart, FiArrowLeft, FiStar, FiCheckCircle } from 'react-icons/fi';
import ProductCard from '@/components/ProductCard';
import ReviewSection from '@/components/ReviewSection';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  description: string;
}


export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = parseInt(unwrappedParams.id);
  const router = useRouter();
  const { addItem: addToCart } = useCart();
  const { wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlist();
  const { formatPrice } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8080/api/products')
      .then((res) => res.json())
      .then((data: Product[]) => {
        setAllProducts(data);
        const found = data.find((p) => p.id === id);
        setProduct(found || null);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Backend API not responding, falling back to local JSON data', err);
        fetch('/data/products.json')
          .then((res) => res.json())
          .then((localData: Product[]) => {
            setAllProducts(localData);
            const found = localData.find((p) => p.id === id);
            setProduct(found || null);
            setLoading(false);
          })
          .catch((localErr) => {
            console.error('Failed to load products from local JSON', localErr);
            setLoading(false);
          });
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-600 border-t-transparent animate-spin" />
          <p className="text-lg font-medium text-slate-500">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-transparent py-24 text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Product Not Found</h2>
        <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition">
          <FiArrowLeft /> Back to Shop
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlistItems.some((item) => item.id === product.id);

  const toggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      });
    }
  };

  const handleAddToCart = () => {
    // Add multiple quantities if user requested
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };


  // Related products (same category, excluding current product)
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-transparent py-24 px-4 sm:px-6 lg:px-8 text-foreground">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link href="/products" className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 font-semibold mb-8 transition-colors">
          <FiArrowLeft className="w-5 h-5" />
          <span>Back to Products</span>
        </Link>

        {/* Product Details Section */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/20 dark:border-white/5 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-16">
          
          {/* Left Column: Image wrapper */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100/50 dark:bg-slate-900/50 border border-white/10">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
              unoptimized
            />
          </div>

          {/* Right Column: Content */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                {product.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
                {product.name}
              </h1>
            </div>

            {/* Ratings Summary (Placeholder until backend aggregation is added) */}
            <div className="flex items-center gap-4">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className={`w-5 h-5 ${i < 4 ? 'fill-amber-500' : ''}`} />
                ))}
                <span className="ml-2 font-bold text-slate-800 dark:text-slate-200">4.0</span>
              </div>
            </div>

            {/* Price & Stock */}
            <div className="flex items-center justify-between">
              <div className="text-4xl font-extrabold text-cyan-600 dark:text-cyan-400">
                {formatPrice(product.price)}
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                <FiCheckCircle className="w-5 h-5" />
                <span>In Stock & Ready to Ship</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Description</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {product.description || "No description provided for this product. Rest assured that all NextCart products are verified for high quality, performance, and outstanding style."}
              </p>
            </div>

            <hr className="border-slate-100 dark:border-slate-800/80" />

            {/* Actions: Quantity + Add buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Quantity selector */}
              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50 p-1 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:text-cyan-600 dark:hover:text-cyan-400 text-slate-500 font-bold transition"
                >
                  -
                </button>
                <span className="px-4 text-center font-bold text-slate-800 dark:text-slate-200 min-w-8">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:text-cyan-600 dark:hover:text-cyan-400 text-slate-500 font-bold transition"
                >
                  +
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                className={`flex-1 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-md ${
                  added 
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20' 
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <FiShoppingCart className="w-5 h-5" />
                <span>{added ? 'Added!' : 'Add to Cart'}</span>
              </button>

              {/* Buy Now button */}
              <button
                onClick={() => {
                  for (let i = 0; i < quantity; i++) {
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      imageUrl: product.imageUrl,
                    });
                  }
                  router.push('/checkout');
                }}
                className="flex-1 w-full flex items-center justify-center py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-600/20"
              >
                <span>Buy Now</span>
              </button>

              {/* Wishlist Button */}
              <button
                onClick={toggleWishlist}
                className={`p-3.5 rounded-xl border transition-all hover:scale-105 active:scale-95 ${
                  isWishlisted
                    ? 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-500/10 dark:border-rose-500/20'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 dark:text-slate-400'
                }`}
                aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <FiHeart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/20 dark:border-white/5 shadow-xl mb-16">
          <ReviewSection productId={product.id} />
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-cyan-500 rounded-full" />
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
