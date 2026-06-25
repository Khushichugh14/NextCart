"use client";

import Link from "next/link";
import { FiHeart } from "react-icons/fi";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistIcon() {
  const { wishlistItems } = useWishlist();

  return (
    <Link href="/wishlist" className="p-2 rounded-full hover:bg-slate-800 transition relative" aria-label="Wishlist">
      <FiHeart className="text-slate-300 hover:text-white w-5 h-5" />
      {wishlistItems.length > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-cyan-500 rounded-full shadow-md shadow-cyan-500/30">
          {wishlistItems.length}
        </span>
      )}
    </Link>
  );
}
