"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  description?: string;
};

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem: addToCart } = useCart();
  const { wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlist();
  const { formatPrice } = useAuth();

  const isWishlisted = wishlistItems.some((item) => item.id === product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
    });
  };

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl glass-panel shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-white/20 dark:border-white/5">
        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md bg-white/70 dark:bg-black/50 border border-white/20 hover:scale-110 active:scale-95 transition-all"
          aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <FiHeart className={`w-4 h-4 transition ${isWishlisted ? 'fill-cyan-600 text-cyan-600 dark:fill-cyan-400 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-300'}`} />
        </button>

        {/* Product Image */}
        <div className="relative aspect-square w-full bg-slate-100/50 dark:bg-slate-900/50 overflow-hidden rounded-t-2xl">
          <div className="absolute inset-0">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
          </div>
          <div className="absolute top-3 left-3 rounded-full bg-cyan-600 dark:bg-cyan-500/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white shadow-sm z-10">
            {formatPrice(product.price)}
          </div>
        </div>

        {/* Content & Actions */}
        <div className="p-4 flex flex-col flex-1 justify-between gap-3">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{product.category}</span>
            <h3 className="mt-1 font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
              {product.name}
            </h3>
          </div>

          <div className="flex gap-2 w-full mt-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
            >
              <FiShoppingCart className="w-3.5 h-3.5" />
              <span>Cart</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  imageUrl: product.imageUrl,
                });
                router.push('/checkout');
              }}
              className="flex-1 flex items-center justify-center py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white text-xs font-bold transition shadow-sm"
            >
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
