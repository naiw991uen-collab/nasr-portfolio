import { DOCUMENT, Injectable, NgZone, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

/** Adds tweens to the shared hero-intro timeline that plays when the loader leaves. */
export type IntroPart = (tl: gsap.core.Timeline) => void;

/**
 * One place for GSAP + ScrollTrigger + Lenis.
 *
 * - Browser only: on the server (prerender) `enabled` is false and nothing runs.
 * - prefers-reduced-motion: `enabled` is false, so no loader, GSAP or Lenis;
 *   the page stays static and fully visible.
 * - Components build their tweens inside `gsap.context()` in afterNextRender
 *   and call `ctx.revert()` in ngOnDestroy.
 */
@Injectable({ providedIn: 'root' })
export class AnimationService {
  private readonly doc = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** True once the loader has handed over to the page (immediately when motion is off). */
  readonly introDone = signal(false);

  private _enabled: boolean | null = null;
  private lenis: Lenis | null = null;
  /** Intro parts by order; registering the same order again replaces the part. */
  private readonly introParts = new Map<number, IntroPart>();
  private _introBuilt = false;

  /** True once the loader has built the intro timeline (later registrations are ignored). */
  get introBuilt(): boolean {
    return this._introBuilt;
  }
  private refreshTimer?: ReturnType<typeof setTimeout>;

  /** Motion allowed (browser + no reduced-motion preference). Lazily sets everything up. */
  get enabled(): boolean {
    if (this._enabled === null) this._enabled = this.setup();
    return this._enabled;
  }

  /** Fine pointer (mouse/trackpad): cursor, magnetic and tilt effects only apply here. */
  get finePointer(): boolean {
    return this.isBrowser && matchMedia('(pointer: fine)').matches;
  }

  private setup(): boolean {
    if (!this.isBrowser) return false;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // No loader here: start at the top, or go straight to the #hash section
      // (with manual restoration Chrome doesn't jump to the hash on reload by itself).
      if (location.hash) requestAnimationFrame(() => this.scrollToHash());
      else scrollTo(0, 0);
      this.introDone.set(true);
      return false;
    }
    // Start at the top before the loader, even with a #hash (that section is visited after the loader).
    scrollTo(0, 0);

    gsap.registerPlugin(ScrollTrigger);
    // Ticker, wheel and scroll listeners live outside Angular's zone: 60 fps callbacks
    // must not trigger change detection, and zone-patched wheel listeners lose passive:false.
    this.zone.runOutsideAngular(() => this.startEngines());
    return true;
  }

  private startEngines(): void {
    // Smooth scroll driven by GSAP's ticker so ScrollTrigger stays in sync.
    this.lenis = new Lenis({ lerp: 0.1 });
    this.lenis.scrollTo(0, { immediate: true, force: true });
    this.lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => this.lenis?.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

    // In-page links (#work, #top ...) glide with Lenis instead of jumping.
    this.doc.addEventListener('click', (e) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]');
      const id = a?.getAttribute('href');
      if (!a || !id || id === '#') return;
      const target = id === '#top' ? 0 : this.doc.querySelector<HTMLElement>(id);
      if (target === null) return;
      e.preventDefault();
      const offset = id === '#top' ? 0 : -20;
      // Header links jump (fade out → instant scroll → fade in) instead of gliding through the
      // pinned Work section. Other in-page links keep the smooth glide.
      if (a.closest('.nav')) this.fadeJump(target, offset);
      else this.lenis?.scrollTo(target, { offset, duration: 1.4, onComplete: () => this.focusTarget(target) });
    });

    addEventListener('load', () => {
      // The browser may still jump to a #hash while loading: keep the top until the loader is done.
      if (!this.introDone()) {
        scrollTo(0, 0);
        this.lenis?.scrollTo(0, { immediate: true, force: true });
      }
      ScrollTrigger.refresh();
    });
  }

  /** After the loader: if the URL has a #hash (e.g. #contact), glide to that section. */
  scrollToHash(): void {
    const id = location.hash;
    if (!id || id === '#' || id === '#top') return;
    let target: HTMLElement | null = null;
    try {
      target = this.doc.querySelector<HTMLElement>(id);
    } catch {
      return; // not a valid selector
    }
    if (!target) return;
    if (this.lenis) this.lenis.scrollTo(target, { offset: -20, duration: 1.4 });
    else scrollTo(0, target.getBoundingClientRect().top + scrollY - 20); // reduced motion: instant jump
  }

  /**
   * After an in-page jump, move keyboard focus to the destination so the next Tab continues
   * from there (screen readers also announce it). #top focuses <main>.
   */
  private focusTarget(target: HTMLElement | number): void {
    const el = typeof target === 'number' ? this.doc.getElementById('main') : target;
    if (!el) return;
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }

  private veil?: HTMLElement;
  private jumping = false;

  /** Fade the page to its background colour, jump instantly to `target`, update ScrollTrigger, fade back. */
  private fadeJump(target: HTMLElement | number, offset: number): void {
    if (this.jumping || !this.lenis) return;
    this.jumping = true;
    if (!this.veil) {
      this.veil = this.doc.createElement('div');
      this.veil.setAttribute('aria-hidden', 'true');
      // Above header/progress bar (50/70), below the custom cursor layer (90).
      Object.assign(this.veil.style, { position: 'fixed', inset: '0', zIndex: '80', background: 'var(--bg)', pointerEvents: 'none', opacity: '0', visibility: 'hidden' });
      this.doc.body.append(this.veil);
    }
    gsap
      .timeline({
        onComplete: () => {
          this.jumping = false;
        },
      })
      .to(this.veil, { autoAlpha: 1, duration: 0.2, ease: 'power2.in' })
      .call(() => {
        this.lenis?.scrollTo(target, { offset, immediate: true, force: true });
        // Sync triggers at the new position: passed reveals play, scrubbed tweens and the pin snap into place.
        ScrollTrigger.update();
        this.focusTarget(target);
      })
      .to(this.veil, { autoAlpha: 0, duration: 0.3, ease: 'power2.out' }, '+=.05');
  }

  stopScroll(): void {
    this.lenis?.stop();
  }

  startScroll(): void {
    this.lenis?.start();
  }

  /** Debounced ScrollTrigger.refresh(), e.g. after fit-text changes a heading's size. */
  refresh(): void {
    if (!this._enabled) return;
    clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
      // Layout settled: put the held element back where the visitor saw it.
      if (this.applyAnchor()) ScrollTrigger.update();
    }, 120);
  }

  private anchor?: { el: Element; top: number; until: number };

  /**
   * Keeps `el` at `top` px from the viewport top through the layout changes of the next
   * ~1.5 s (language switch: other text heights, and the Work pin rebuilt for the other
   * direction, which briefly removes its scroll distance from the page).
   */
  holdInView(el: Element, top: number): void {
    this.anchor = { el, top, until: performance.now() + 1500 };
    this.applyAnchor();
    this.refresh();
  }

  /** Scrolls so the held element is back in place. Returns true when it scrolled. */
  private applyAnchor(): boolean {
    const a = this.anchor;
    if (!a) return false;
    if (performance.now() > a.until || !a.el.isConnected) {
      this.anchor = undefined;
      return false;
    }
    const d = a.el.getBoundingClientRect().top - a.top;
    if (Math.abs(d) < 1) return false;
    const y = scrollY + d;
    if (this.lenis) this.lenis.scrollTo(y, { immediate: true, force: true });
    else scrollTo(0, y);
    return true;
  }

  /**
   * Section titles: each `.reveal-title .line > span` rises out of its clipped line when the
   * title enters. Call inside the component's gsap.context so ctx.revert() cleans it up.
   */
  revealTitles(scope: HTMLElement): void {
    scope.querySelectorAll<HTMLElement>('.reveal-title').forEach((h) =>
      gsap.from(h.querySelectorAll('.line > span'), {
        yPercent: 105,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.1,
        scrollTrigger: { trigger: h, start: 'top 85%' },
      }),
    );
  }

  /** Height of the fixed header, so pinned/anchored content can sit just below it. */
  navHeight(): number {
    return this.doc.querySelector<HTMLElement>('.nav')?.offsetHeight ?? 0;
  }

  /** Register a piece of the hero intro. Lower `order` is added first (it may define labels later parts use). */
  registerIntro(order: number, part: IntroPart): void {
    if (!this._introBuilt) this.introParts.set(order, part);
  }

  /** Called by the loader: builds the intro from every registered part. */
  buildIntro(): gsap.core.Timeline {
    this._introBuilt = true;
    const tl = gsap.timeline();
    [...this.introParts].sort((a, b) => a[0] - b[0]).forEach(([, part]) => part(tl));
    return tl;
  }
}
