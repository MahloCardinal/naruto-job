import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: { default: 'NEXUS — Naruto Ninja Cards', template: '%s | NEXUS' },
  description: 'NEXUS: hub competitivo della community Naruto Ninja Cards. Database carte, mazzi, Tier List e aggiornamenti.',
  applicationName: 'NEXUS',
  openGraph: { title: 'NEXUS — Naruto Ninja Cards', description: 'Competitive hub for Naruto Ninja Cards.', type: 'website' },
};
export const viewport: Viewport = { themeColor: '#090b10', colorScheme: 'dark', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="it"><body><SiteHeader />{children}<footer className="footer">NEXUS · Naruto Ninja Cards · Community driven</footer></body></html>;
}
