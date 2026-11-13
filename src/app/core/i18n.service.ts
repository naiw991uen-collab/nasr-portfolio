import { DOCUMENT, Injectable, Injector, PLATFORM_ID, afterNextRender, computed, effect, inject, signal, untracked } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { AnimationService } from './animation.service';
import { ar } from '../i18n/ar';
import { de } from '../i18n/de';
import { Dict, en } from '../i18n/en';

export type Lang = 'en' | 'ar' | 'de';

export const LANGS: readonly { id: Lang; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'ar', label: 'العربية' },
  { id: 'de', label: 'Deutsch' },
];

const DICTS: Record<Lang, Dict> = { en, ar, de };
const STORAGE_KEY = 'lang';

function isLang(v: unknown): v is Lang {
  return v === 'en' || v === 'ar' || v === 'de';
}

/**
 * Runtime translations (all three dictionaries are bundled, so switching is instant).
 *
 * - The prerendered page is English; a saved choice is applied right after the app
 *   hydrates (`restore()`), so hydration always sees the same DOM the server sent.
 * - Switching sets lang/dir on <html>, the document title and meta description,
 *   and is saved in localStorage.
 * - Components whose animated DOM depends on the text rebuild their tweens with
 *   `afterLangChange()`.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly anim = inject(AnimationService);
  private readonly injector = inject(Injector);

  private readonly _lang = signal<Lang>('en');
  readonly lang = this._lang.asReadonly();
  readonly t = computed(() => DICTS[this._lang()]);
  readonly rtl = computed(() => this._lang() === 'ar');

  /** Applies the language saved on a previous visit (call once, after hydration). */
  restore(): void {
    if (!this.isBrowser) return;
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* storage blocked */
    }
    if (isLang(saved) && saved !== 'en') this.apply(saved);
  }

  set(lang: Lang): void {
    if (lang === this._lang()) return;
    // Remember what is in the middle of the screen, so the switch doesn't move the page.
    const anchor = this.viewAnchor();
    this.apply(lang);
    if (anchor) afterNextRender(() => this.anim.holdInView(anchor.el, anchor.top), { injector: this.injector });
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage blocked: the language still applies for this visit */
    }
  }

  private apply(lang: Lang): void {
    this._lang.set(lang);
    const root = this.doc.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    const t = DICTS[lang];
    this.title.setTitle(t.meta.title);
    this.meta.updateTag({ name: 'description', content: t.meta.description });
    // Text lengths and direction changed: scroll positions (pins, reveals) are measured again.
    afterNextRender(() => this.anim.refresh(), { injector: this.injector });
  }

  /** A block element (kept across languages) at the middle of the viewport, and its top. */
  private viewAnchor(): { el: Element; top: number } | null {
    if (!this.isBrowser || scrollY < 10) return null;
    const hit = this.doc.elementFromPoint(innerWidth / 2, innerHeight / 2);
    const el = hit?.closest('h2, h3, p, .panel, .scard, .tile, .fact, .num, .mail, .portrait, section, footer');
    return el ? { el, top: el.getBoundingClientRect().top } : null;
  }

  /** Fills {name} placeholders: fmt('Project {n} of {total}', { n: 1, total: 4 }). */
  fmt(text: string, values: Record<string, string | number>): string {
    return text.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ''));
  }

  /**
   * Pieces for letter animations: letters in Latin scripts, whole words in Arabic
   * (splitting Arabic into letters would break their joined forms).
   */
  split(text: string): string[] {
    return this._lang() === 'ar' ? text.split(/\s+/).filter(Boolean) : [...text];
  }

  /**
   * Runs `fn` after the page has re-rendered in a new language (not for the first one).
   * Call from a constructor. Used to rebuild tweens whose target elements were replaced.
   */
  afterLangChange(fn: () => void): void {
    const injector = inject(Injector);
    let last = untracked(this._lang);
    effect(
      () => {
        const lang = this._lang();
        if (lang === last) return;
        last = lang;
        afterNextRender(fn, { injector });
      },
      { injector },
    );
  }
}
