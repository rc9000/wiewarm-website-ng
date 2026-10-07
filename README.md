# wiewarm.ch

A modern, server-rendered Next.js and React implementation of
[wiewarm.ch](https://www.wiewarm.ch/). It presents current water temperatures
and swimming-location details using only the documented wiewarm REST API.

## Local development

Requirements:

- Node.js 22.13 or newer
- npm

Install dependencies and start the development server:

```bash
npm install
npm run dev -- --port 3001
```

Open [http://localhost:3001/](http://localhost:3001/) in a browser.

Available checks:

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

## Font selection mode

The local font comparison tool is available at
[http://localhost:3001/?fontselect=true](http://localhost:3001/?fontselect=true).
It exists for evaluating alternatives and is not part of the normal interface.

## Typography decision

At its meeting of **07.10.2026**, the local Font Selection Committee selected
**Geist** as the official font for wiewarm.ch.

This decision may only be changed by a majority vote of the full council.

## Design selection mode

The local design lab is available at
[http://localhost:3001/?designselect=true](http://localhost:3001/?designselect=true).
It currently includes **Swiss Lido**, the restored **First Try**, and an
**Amiga Chiptune** experiment. The selected design persists while browsing.

Use `?fontselect=true&designselect=true` to show both design and font controls.

## Data source

Application data is fetched exclusively from the documented
[wiewarm REST API](https://www.wiewarm.ch/api/doc/index.html).

The legacy implementation is available in the
[wiewarm-website repository](https://github.com/wiewarm/wiewarm-website).
