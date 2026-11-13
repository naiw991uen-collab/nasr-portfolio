import { Directive, ElementRef, NgZone, OnDestroy, afterNextRender, inject } from '@angular/core';
import { AnimationService } from './animation.service';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=<>/';
const DURATION = 420;

/**
 * Text scramble on hover: letters resolve left to right in ~0.4 s.
 * Always restores the original text (on finish, on leave, and on destroy).
 * Writes to the existing text node when there is one, so Angular's binding stays intact.
 */
@Directive({ selector: '[appScramble]' })
export class ScrambleDirective implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly anim = inject(AnimationService);
  private readonly zone = inject(NgZone);
  private original = '';
  private raf = 0;
  private leaveTimer?: ReturnType<typeof setTimeout>;
  private active = false;
  /** A scramble is running (the text on screen is not the real text). */
  private running = false;

  constructor() {
    afterNextRender(() => {
      if (!this.anim.enabled) return;
      this.active = true;
      this.original = this.el.textContent ?? '';
      this.zone.runOutsideAngular(() => {
        this.el.addEventListener('pointerenter', this.enter);
        this.el.addEventListener('pointerleave', this.leave);
      });
    });
  }

  private write(text: string): void {
    const only = this.el.childNodes.length === 1 ? this.el.firstChild : null;
    if (only && only.nodeType === Node.TEXT_NODE) only.nodeValue = text;
    else this.el.textContent = text;
  }

  private readonly enter = () => {
    clearTimeout(this.leaveTimer);
    // Arabic letters join: random Latin glyphs in between would break the word apart.
    if (document.documentElement.lang === 'ar') return;
    // The text can change (language switch): read it again unless a scramble is on screen.
    if (!this.running) this.original = this.el.textContent ?? '';
    cancelAnimationFrame(this.raf);
    const fin = this.original;
    this.running = true;
    const t0 = performance.now();
    const frame = (now: number) => {
      const p = Math.min((now - t0) / DURATION, 1);
      const done = Math.floor(p * fin.length);
      this.write(
        [...fin].map((c, i) => (i < done || c === ' ' ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join(''),
      );
      if (p < 1) this.raf = requestAnimationFrame(frame);
      else {
        this.write(fin);
        this.running = false;
      }
    };
    this.raf = requestAnimationFrame(frame);
  };

  private readonly leave = () => {
    this.leaveTimer = setTimeout(() => {
      if (this.running) {
        cancelAnimationFrame(this.raf);
        this.write(this.original);
      }
      this.running = false;
    }, 450);
  };

  ngOnDestroy(): void {
    if (!this.active) return;
    cancelAnimationFrame(this.raf);
    clearTimeout(this.leaveTimer);
    this.el.removeEventListener('pointerenter', this.enter);
    this.el.removeEventListener('pointerleave', this.leave);
    if (this.running) this.write(this.original);
  }
}
