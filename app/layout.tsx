import type { Metadata } from 'next';
import { Geist, Manrope } from 'next/font/google';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import './globals.css';

const bodyFont = Geist({ variable: '--font-body', subsets: ['latin'] });
const headingFont = Manrope({ variable: '--font-heading-face', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://wiewarm.ch'),
  title: { default: 'wiewarm.ch – Schweizer Wassertemperaturen', template: '%s | wiewarm.ch' },
  description: 'Aktuelle Wassertemperaturen von Schweizer Badis, Seen und Flüssen.',
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de-CH"><body className={`${bodyFont.variable} ${headingFont.variable}`}>
    <div className="page-frame"><SiteHeader />{children}<SiteFooter /></div>
  </body></html>;
}
