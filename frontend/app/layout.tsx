import './globals.css';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Providers } from '@/context/Providers';

export const metadata = {
  title: 'NextCart - Premium E-Commerce',
  description: 'Shop premium gadgets, fashion, fitness accessories, and books.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.documentElement.classList.remove('dark');
                document.addEventListener('DOMContentLoaded', () => {
                  document.documentElement.classList.remove('dark');
                  document.body.classList.remove('dark');
                });
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="bg-background dark:bg-backgroundDark text-foreground min-h-screen flex flex-col pt-16">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
