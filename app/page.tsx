import Link from 'next/link';
import { ArrowDown, ArrowUp, Search, ThermometerSun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatTemperature } from '@/lib/format-temperature';
import { getCurrentTemperatures } from '@/lib/wiewarm-api';
import { filterAndSortTemperatures, parseTemperatureQuery, toQueryString, type SortColumn, type TemperatureQuery } from '@/lib/temperature-query';

type Params = Record<string, string | string[] | undefined>;
const columnLabels: Record<SortColumn, string> = { ort: 'Ort', bad: 'Bad', becken: 'Becken', temp: 'Wert', date: 'Datum', plz: 'PLZ', kanton: 'Kanton' };

function SortLink({ column, query }: { column: SortColumn; query: TemperatureQuery }) {
  const active = query.sort === column;
  const nextDirection = active && query.direction === 'asc' ? 'desc' : 'asc';
  return <Link className="sort-link" href={`/?${toQueryString(query, { sort: column, direction: nextDirection, page: 1 })}`} aria-label={`${columnLabels[column]} sortieren`}>
    {columnLabels[column]}{active ? (query.direction === 'asc' ? <ArrowUp aria-hidden="true" /> : <ArrowDown aria-hidden="true" />) : null}
  </Link>;
}

export default async function Home({ searchParams }: { searchParams?: Promise<Params> }) {
  const query = parseTemperatureQuery((await searchParams) ?? {});
  let rows;
  try {
    rows = await getCurrentTemperatures();
  } catch (error) {
    console.error('Could not load current temperatures', error);
    return <TemperatureError />;
  }

  const filtered = filterAndSortTemperatures(rows, query);
  const pageSize = query.pageSize === 'all' ? Math.max(filtered.length, 1) : query.pageSize;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(query.page, pageCount);
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return <main className="site-shell page-main home-main">
    <section className="finder-card" aria-label={`Temperatursuche mit ${rows.length} Messwerten`}>
      <form className="filter-bar" action="/" method="get">
        <label className="search-field" htmlFor="global-search"><span className="sr-only">Alle Felder durchsuchen</span><Search aria-hidden="true" />
          <Input id="global-search" name="q" type="search" defaultValue={query.q} placeholder="Alle Felder durchsuchen …" /></label>
        <input type="hidden" name="sort" value={query.sort} /><input type="hidden" name="direction" value={query.direction} />
      </form>

      <div className="result-bar"><p><strong>{filtered.length}</strong> Treffer</p>
        <form action="/" method="get" className="page-size-form">
          {(['q', 'ort', 'bad', 'becken', 'plz', 'kanton', 'sort', 'direction'] as const).map((key) => query[key] ? <input key={key} type="hidden" name={key} value={String(query[key])} /> : null)}
          <label htmlFor="page-size">Pro Seite</label>
          <Select name="pageSize" defaultValue={String(query.pageSize)}><SelectTrigger id="page-size"><SelectValue /></SelectTrigger><SelectContent>
            {[10, 25, 50].map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}<SelectItem value="all">Alle</SelectItem>
          </SelectContent></Select><Button type="submit" variant="outline">Übernehmen</Button>
        </form>
      </div>

      {visible.length ? <Table className="temperature-table"><TableHeader><TableRow>
        {(['ort', 'bad', 'becken', 'temp', 'date', 'plz', 'kanton'] as SortColumn[]).map((column) => <TableHead key={column}><SortLink column={column} query={query} /></TableHead>)}
      </TableRow></TableHeader><TableBody>{visible.map((row) => <TableRow key={row.beckenid}>
        <TableCell className="location-cell">{row.ort}</TableCell>
        <TableCell><Link className="pool-link" href={`/bad/${encodeURIComponent(row.badidText)}`}>{row.bad}</Link></TableCell>
        <TableCell>{row.becken}</TableCell><TableCell><span className="temperature-value">{formatTemperature(row.temp)}</span></TableCell>
        <TableCell><time dateTime={row.date}>{row.datePretty}</time></TableCell><TableCell>{row.plz || '–'}</TableCell>
        <TableCell><span className="canton-pill">{row.kanton || '–'}</span></TableCell>
      </TableRow>)}</TableBody></Table> : <div className="empty-state"><Search aria-hidden="true" /><h2>Keine Treffer</h2><p>Versuche einen anderen Suchbegriff oder lösche die Filter.</p></div>}

      {query.pageSize !== 'all' && pageCount > 1 ? <Pagination className="table-pagination"><PaginationContent>
        <PaginationItem><PaginationPrevious text="Zurück" href={page > 1 ? `/?${toQueryString(query, { page: page - 1 })}` : undefined} aria-disabled={page <= 1} /></PaginationItem>
        <PaginationItem><span className="page-indicator">Seite {page} von {pageCount}</span></PaginationItem>
        <PaginationItem><PaginationNext text="Weiter" href={page < pageCount ? `/?${toQueryString(query, { page: page + 1 })}` : undefined} aria-disabled={page >= pageCount} /></PaginationItem>
      </PaginationContent></Pagination> : null}
    </section>
  </main>;
}

function TemperatureError() {
  return <main className="site-shell page-main"><section className="error-card"><ThermometerSun aria-hidden="true" />
    <p className="eyebrow">Kurze Abkühlung</p><h1>Temperaturen gerade nicht erreichbar</h1>
    <p>Die aktuellen Messwerte konnten nicht geladen werden. Bitte versuche es in einem Moment erneut.</p>
    <Link className="button-link" href="/">Erneut versuchen</Link>
  </section></main>;
}
