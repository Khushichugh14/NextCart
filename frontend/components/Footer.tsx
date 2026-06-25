import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white/30 dark:bg-black/30 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-foreground">
        {/* Brand & description */}
        <div className="flex flex-col items-start">
          <Image src="/logo.png" alt="NextCart" width={48} height={48} className="object-contain mb-2" />
          <p className="text-sm max-w-xs">
            Premium e‑commerce store delivering quality products across categories with a seamless shopping experience.
          </p>
        </div>
        {/* Quick links */}
        <div>
          <h3 className="font-semibold mb-3 text-primary">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li><Link href="/products" className="hover:underline">Products</Link></li>
            <li><Link href="/cart" className="hover:underline">Cart</Link></li>
            <li><Link href="/wishlist" className="hover:underline">Wishlist</Link></li>
            <li><Link href="/orders" className="hover:underline">Orders</Link></li>
            <li><Link href="/admin" className="hover:underline">Admin</Link></li>
          </ul>
        </div>
        {/* Social */}
        <div>
          <h3 className="font-semibold mb-3 text-primary">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" aria-label="Twitter" className="text-foreground hover:text-primary transition">
              {/* Simple SVG icons */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.27 4.27 0 0 0 1.88-2.36 8.5 8.5 0 0 1-2.71 1.04 4.25 4.25 0 0 0-7.24 3.87A12.05 12.05 0 0 1 3.15 4.9a4.25 4.25 0 0 0 1.32 5.68 4.22 4.22 0 0 1-1.92-.53v.05a4.25 4.25 0 0 0 3.4 4.16c-.42.12-.86.18-1.31.18-.32 0-.63-.03-.93-.09a4.26 4.26 0 0 0 3.97 2.96A8.52 8.52 0 0 1 2 19.54a12.04 12.04 0 0 0 6.5 1.9c7.82 0 12.1-6.48 12.1-12.1 0-.18-.01-.35-.02-.53A8.66 8.66 0 0 0 24 5.56a8.4 8.4 0 0 1-2.54.7z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram" className="text-foreground hover:text-primary transition">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                <path d="M12 2.2c3.2 0 3.6.01 4.9.07 1.2.06 1.9.25 2.4.42a4.8 4.8 0 0 1 1.7 1.1 4.8 4.8 0 0 1 1.1 1.7c.17.5.36 1.2.42 2.4.06 1.3.07 1.7.07 4.9s-.01 3.6-.07 4.9c-.06 1.2-.25 1.9-.42 2.4a4.8 4.8 0 0 1-1.1 1.7 4.8 4.8 0 0 1-1.7 1.1c-.5.17-1.2.36-2.4.42-1.3.06-1.7.07-4.9.07s-3.6-.01-4.9-.07c-1.2-.06-1.9-.25-2.4-.42a4.8 4.8 0 0 1-1.7-1.1 4.8 4.8 0 0 1-1.1-1.7c-.17-.5-.36-1.2-.42-2.4C2.21 15.6 2.2 15.2 2.2 12s.01-3.6.07-4.9c.06-1.2.25-1.9.42-2.4a4.8 4.8 0 0 1 1.1-1.7 4.8 4.8 0 0 1 1.7-1.1c.5-.17 1.2-.36 2.4-.42C8.4 2.21 8.8 2.2 12 2.2zm0-2.2C8.7 0 8.3.01 7 .07 5.6.13 4.6.33 3.8.68a6.9 6.9 0 0 0-2.5 1.6A6.9 6.9 0 0 0 .68 4.8c-.35.8-.55 1.8-.61 3.2C.01 8.3 0 8.7 0 12c0 3.3.01 3.7.07 5 .06 1.4.26 2.4.61 3.2.4.8 1 1.5 1.6 2.1.6.6 1.3 1.2 2.1 1.6.8.35 1.8.55 3.2.61 1.3.06 1.7.07 5 .07s3.7-.01 5-.07c1.4-.06 2.4-.26 3.2-.61.8-.4 1.5-1 2.1-1.6.6-.6 1.2-1.3 1.6-2.1.35-.8.55-1.8.61-3.2.06-1.3.07-1.7.07-5s-.01-3.7-.07-5c-.06-1.4-.26-2.4-.61-3.2a6.9 6.9 0 0 0-1.6-2.5 6.9 6.9 0 0 0-2.5-1.6c-.8-.35-1.8-.55-3.2-.61C15.7.01 15.3 0 12 0z" />
                <path d="M12 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zM18.4 4.6a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-sm text-foreground/60">
        © {new Date().getFullYear()} NextCart. All rights reserved.
      </div>
    </footer>
  );
}
