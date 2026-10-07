import Link from 'next/link';
import { Sun, Waves } from 'lucide-react';
import { DesignSelector } from '@/components/design-selector';
import { FontSelector } from '@/components/font-selector';

export function SiteHeader() {
  return <header className="site-header"><div className="site-shell header-inner">
    <Link className="brand" href="/" aria-label="wiewarm.ch Startseite">
      <span className="brand-mark">
        <Sun className="brand-sun" aria-hidden="true" />
        <Waves className="brand-waves" aria-hidden="true" />
      </span>
      <span>wiewarm<span>.ch</span></span>
    </Link>
    <div className="header-tools"><DesignSelector /><FontSelector /></div>
  </div></header>;
}
