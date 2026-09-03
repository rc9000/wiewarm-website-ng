import Link from 'next/link';
import { Sun, Waves } from 'lucide-react';
import { FontSelector } from '@/components/font-selector';

export function SiteHeader() {
  return <header className="site-header"><div className="site-shell header-inner">
    <Link className="brand" href="/" aria-label="wiewarm.ch Startseite">
      <span className="brand-mark"><Sun aria-hidden="true" /><Waves aria-hidden="true" /></span>
      <span>wiewarm<span>.ch</span></span>
    </Link>
    <FontSelector />
  </div></header>;
}
