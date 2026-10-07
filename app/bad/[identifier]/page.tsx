import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock3, ExternalLink, Images, Info, Mail, MapPin, Phone, Sun, Ticket, Waves } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatTemperature } from '@/lib/format-temperature';
import { getSwimmingLocation, swimmingLocationExists, WiewarmApiError, type Basin } from '@/lib/wiewarm-api';

type RouteParams = { identifier: string };

function isRecent(date: string, days: number): boolean {
  const timestamp = Date.parse(date);
  return Number.isFinite(timestamp) && Date.now() - timestamp < days * 86_400_000 && Date.now() >= timestamp - 86_400_000;
}

function directionsUrl(location: Awaited<ReturnType<typeof getSwimmingLocation>>): string {
  const address = [location.address1, location.address2, location.postalCode, location.city].filter(Boolean).join(' ');
  const query = address || (location.latitude !== null && location.longitude !== null ? `${location.latitude},${location.longitude}` : location.city);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function isStale(basin: Basin): boolean {
  return basin.date ? !isRecent(basin.date, 7) : true;
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { identifier } = await params;
  try {
    const location = await getSwimmingLocation(identifier);
    const title = `${location.name}, ${location.city}`;
    const description = `Wassertemperaturen, Öffnungszeiten und Informationen für ${location.name} in ${location.city}.`;
    const image = location.images[0]?.original;
    return {
      title, description, alternates: { canonical: `/bad/${encodeURIComponent(identifier)}` },
      openGraph: { title, description, images: image ? [{ url: image }] : [] },
      twitter: { card: image ? 'summary_large_image' : 'summary', title, description, images: image ? [image] : [] },
    };
  } catch {
    return { title: 'Bad nicht gefunden' };
  }
}

export default async function SwimmingLocationPage({ params }: { params: Promise<RouteParams> }) {
  const { identifier } = await params;
  let location;
  try {
    location = await getSwimmingLocation(identifier);
  } catch (error) {
    if (error instanceof WiewarmApiError && error.status === 404) notFound();
    if (error instanceof WiewarmApiError && error.status === 500 && !(await swimmingLocationExists(identifier))) notFound();
    throw error;
  }

  const addressLines = [location.address1, location.address2, [location.postalCode, location.city].filter(Boolean).join(' ')].filter(Boolean);
  const recentWeather = location.weather.filter((entry) => isRecent(entry.date, 3));
  const uvIsRecent = location.uvDate && isRecent(location.uvDate, 7);

  return <main className="site-shell detail-main">
    <Button variant="ghost" nativeButton={false} render={<Link href="/" />} className="back-link"><ArrowLeft aria-hidden="true" /> Alle Temperaturen</Button>

    <header className="detail-hero">
      <div><p className="eyebrow"><Waves aria-hidden="true" /> {location.canton || 'Schweiz'}</p>
        <h1>{location.name}</h1><p>{location.postalCode} {location.city}</p></div>
      {location.basins[0]?.temp !== null && location.basins[0]?.temp !== undefined ? <div className="hero-temperature">
        <span>{formatTemperature(location.basins[0].temp)}</span><small>{location.basins[0].name}</small>
      </div> : null}
    </header>

    <div className="detail-layout">
      <div className="detail-primary">
        <section className="detail-card" aria-labelledby="basins-heading">
          <div className="section-heading"><div className="section-icon"><Waves aria-hidden="true" /></div><div><p>Aktuell</p><h2 id="basins-heading">Becken & Temperaturen</h2></div></div>
          {location.basins.length ? <Table className="basin-table"><TableHeader><TableRow><TableHead>Becken</TableHead><TableHead>Temperatur</TableHead><TableHead>Status</TableHead><TableHead>Aktualisiert</TableHead></TableRow></TableHeader>
            <TableBody>{location.basins.map((basin) => <TableRow key={basin.beckenid}><TableCell><strong>{basin.name}</strong><small>{basin.type}</small></TableCell>
              <TableCell><span className="detail-temp">{formatTemperature(basin.temp)}</span></TableCell>
              <TableCell><Badge variant={basin.status.toLocaleLowerCase('de-CH').includes('geöffnet') ? 'default' : 'secondary'}>{basin.status || 'Unbekannt'}</Badge></TableCell>
              <TableCell><time dateTime={basin.date}>{basin.datePretty || '–'}</time>{isStale(basin) ? <small className="stale-label">Älterer Messwert</small> : null}</TableCell>
            </TableRow>)}</TableBody></Table> : <p className="muted-copy">Keine Beckenangaben verfügbar.</p>}
        </section>

        {location.notices.length ? <section className="detail-card" aria-labelledby="notices-heading"><div className="section-heading"><div className="section-icon sunny"><Info aria-hidden="true" /></div><div><p>Gut zu wissen</p><h2 id="notices-heading">Aktuelle Mitteilungen</h2></div></div>
          <div className="notice-list">{location.notices.map((notice, index) => <article key={`${notice.date}-${index}`}><time dateTime={notice.date}>{notice.datePretty}</time><p>{notice.info}</p></article>)}</div>
        </section> : null}

        {location.images.length ? <section className="detail-card" aria-labelledby="images-heading"><div className="section-heading"><div className="section-icon"><Images aria-hidden="true" /></div><div><p>Einblicke</p><h2 id="images-heading">Bilder</h2></div></div>
          <div className="image-gallery">{location.images.map((image, index) => <a key={image.image} href={image.original} target="_blank" rel="noreferrer" className={index === 0 ? 'gallery-featured' : undefined}>
            <Image src={image.image} alt={image.text || `${location.name} in ${location.city}, Bild ${index + 1}`} fill sizes={index === 0 ? '(max-width: 760px) 100vw, 50vw' : '(max-width: 760px) 50vw, 24vw'} priority={index === 0} />
            {image.text ? <span>{image.text}</span> : null}</a>)}</div>
        </section> : null}

        {(location.openingHours || location.prices || location.info) ? <section className="info-grid">
          {location.openingHours ? <InfoBlock icon={<Clock3 />} label="Besuch planen" title="Öffnungszeiten" text={location.openingHours} /> : null}
          {location.prices ? <InfoBlock icon={<Ticket />} label="Eintritt" title="Preise" text={location.prices} /> : null}
          {location.info ? <InfoBlock icon={<Info />} label="Mehr erfahren" title="Weitere Informationen" text={location.info} wide /> : null}
        </section> : null}
      </div>

      <aside className="detail-sidebar">
        {(addressLines.length || location.phone || location.email || location.website) ? <section className="contact-card"><p className="eyebrow"><MapPin aria-hidden="true" /> Vor Ort</p><h2>Adresse & Kontakt</h2>
          {addressLines.length ? <address>{addressLines.map((line) => <span key={line}>{line}</span>)}</address> : null}
          <div className="contact-links">{location.phone ? <a href={`tel:${location.phone.replace(/\s/g, '')}`}><Phone aria-hidden="true" /> {location.phone}</a> : null}
            {location.email ? <a href={`mailto:${location.email}`}><Mail aria-hidden="true" /> {location.email}</a> : null}
            {location.website ? <a href={location.website} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true" /> Website</a> : null}</div>
          <a className="button-link" href={directionsUrl(location)} target="_blank" rel="noreferrer"><MapPin aria-hidden="true" /> Route öffnen</a>
        </section> : null}
        {(uvIsRecent || recentWeather.length) ? <section className="weather-card"><p className="eyebrow"><Sun aria-hidden="true" /> Wetterdaten</p><h2>Sonne & Wasser</h2>
          {uvIsRecent && location.uvValue !== null ? <div className="uv-reading"><span>UV {location.uvValue}</span><small>{location.uvDatePretty}{location.uvStationName ? ` · ${location.uvStationName}` : ''}</small></div> : null}
          {recentWeather.map((entry) => <div className="weather-reading" key={entry.date}><span>{formatTemperature(entry.temperature)}</span><small>{entry.datePretty}</small></div>)}
        </section> : null}
      </aside>
    </div>
  </main>;
}

function InfoBlock({ icon, label, title, text, wide = false }: { icon: React.ReactNode; label: string; title: string; text: string; wide?: boolean }) {
  return <section className={`detail-card info-block${wide ? ' info-wide' : ''}`}><div className="section-heading"><div className="section-icon">{icon}</div><div><p>{label}</p><h2>{title}</h2></div></div><p className="preformatted">{text}</p></section>;
}
