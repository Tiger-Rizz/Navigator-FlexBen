import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Sidebar } from '@/components/shell/Sidebar';
import { StoreHydrator } from '@/components/shell/StoreHydrator';
import { AskPanel } from '@/components/ai/AskPanel';
import { TourProvider } from '@/components/tour/TourProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'Meridian Benefits',
  description: 'Navigator Flex: an AI-native flexible benefits prototype for UK private medical insurance.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={inter.variable}>
      <body>
        <StoreHydrator />
        <div className="flex min-h-screen flex-col min-[900px]:flex-row">
          <Sidebar />
          <main id="main" className="min-w-0 flex-1">
            {children}
          </main>
        </div>
        <AskPanel />
        <TourProvider />
      </body>
    </html>
  );
}
