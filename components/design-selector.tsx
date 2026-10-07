'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

const designs = [
  { value: 'swiss-lido', label: 'Swiss Lido' },
  { value: 'first-try', label: 'First Try' },
  { value: 'second-try', label: 'Second Try' },
  { value: 'amiga', label: 'Amiga Chiptune' },
  { value: 'macos', label: 'Modern macOS' },
  { value: 'sixties', label: 'Vintage 60s' },
  { value: 'ms-dos', label: 'MS-DOS' },
  { value: 'goth', label: 'Goth' },
] as const;

type DesignValue = (typeof designs)[number]['value'];
const designStorageKey = 'wiewarm-design';
const selectorStorageKey = 'wiewarm-design-selector';
const subscribe = () => () => {};

function isDesignValue(value: string | null): value is DesignValue {
  return designs.some((design) => design.value === value);
}

function applyDesign(design: DesignValue) {
  document.documentElement.dataset.design = design;
}

function selectorMode() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('designselect');
  if (mode === 'true') return true;
  if (mode === 'false') return false;
  return params.get('fontselect') === 'true' || sessionStorage.getItem(selectorStorageKey) === 'true';
}

export function DesignSelector() {
  const enabled = useSyncExternalStore(subscribe, selectorMode, () => false);
  const [design, setDesign] = useState<DesignValue>(() => {
    if (typeof window === 'undefined') return 'swiss-lido';
    const storedDesign = localStorage.getItem(designStorageKey);
    return isDesignValue(storedDesign) ? storedDesign : 'swiss-lido';
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('designselect');
    if (mode === 'true' || params.get('fontselect') === 'true') sessionStorage.setItem(selectorStorageKey, 'true');
    if (mode === 'false') sessionStorage.removeItem(selectorStorageKey);
    applyDesign(design);
  }, [design]);

  if (!enabled) return null;

  return <label className="design-selector" htmlFor="design-selector">
    <span>Design</span>
    <select id="design-selector" value={design} onChange={(event) => {
      const nextDesign = event.target.value as DesignValue;
      setDesign(nextDesign);
      localStorage.setItem(designStorageKey, nextDesign);
      applyDesign(nextDesign);
    }}>
      {designs.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </label>;
}
