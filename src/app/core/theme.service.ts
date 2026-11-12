import { DOCUMENT, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Palette = 'aurora' | 'ember' | 'paper';

export const PALETTES: readonly { id: Palette; label: string; swatch: string }[] = [
  { id: 'aurora', label: 'Aurora theme', swatch: 'linear-gradient(135deg,#7B61FF 50%,#2EE6C5 50%)' },
  { id: 'ember', label: 'Ember theme', swatch: 'linear-gradient(135deg,#FF6A2B 50%,#FFC24B 50%)' },
  { id: 'paper', label: 'Paper theme', swatch: 'linear-gradient(135deg,#EEEAE2 50%,#2B3BFF 50%)' },
];

const STORAGE_KEY = 'palette';

function isPalette(v: unknown): v is Palette {
  return v === 'aurora' || v === 'ember' || v === 'paper';
}

/**
 * Palette switch (aurora | ember | paper). Writes data-palette on <html>
 * and persists the choice in localStorage. An inline script in index.html
 * applies the stored value before first paint so there is no flash.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _palette = signal<Palette>(this.readStored());
  readonly palette = this._palette.asReadonly();

  set(p: Palette): void {
    this._palette.set(p);
    const root = this.doc.documentElement;
    if (p === 'aurora') root.removeAttribute('data-palette');
    else root.setAttribute('data-palette', p);
    if (this.isBrowser) {
      try {
        localStorage.setItem(STORAGE_KEY, p);
      } catch {
        /* storage blocked: palette still applies for this visit */
      }
    }
  }

  private readStored(): Palette {
    if (!this.isBrowser) return 'aurora';
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return isPalette(v) ? v : 'aurora';
    } catch {
      return 'aurora';
    }
  }
}
