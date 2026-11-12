import { Directive, ElementRef, OnDestroy, afterNextRender, inject, input, output } from '@angular/core';

/**
 * Sizes a heading so its widest line fits the parent's content box.
 * Lines are the host's `.fit-line` descendants (inline-block, nowrap);
 * if there are none, the host itself is measured.
 *
 * Same method as fitName/fitBig/fitGiant in the reference: set 100px,
 * measure, scale by (available / widest) * ratio, cap at `fitMax`.
 * Browser only; on the server the CSS clamp() size is used.
 */
@Directive({ selector: '[appFitText]' })
export class FitTextDirective implements OnDestroy {
  readonly fitMax = input<number>(Number.POSITIVE_INFINITY);
  readonly fitRatio = input<number>(0.97);
  /** Emits after every resize so scroll animations can refresh. */
  readonly fitted = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private ro?: ResizeObserver;
  private raf = 0;

  constructor() {
    afterNextRender(() => {
      const box = this.host.parentElement;
      if (!box) return;
      // Measure with the real web font only: fitting with the fallback font first and again when
      // Syne arrives resizes the heading twice (layout shift). Until then the CSS size applies.
      if (!document.fonts || document.fonts.status === 'loaded') this.fit();
      document.fonts?.ready.then(() => this.fit());
      let lastW = box.clientWidth;
      this.ro = new ResizeObserver(() => {
        if (box.clientWidth === lastW) return;
        lastW = box.clientWidth;
        // Resize on the next frame: changing the font size inside the callback resizes the
        // observed box in the same frame ("ResizeObserver loop completed with undelivered notifications").
        cancelAnimationFrame(this.raf);
        this.raf = requestAnimationFrame(() => this.fit());
      });
      this.ro.observe(box);
    });
  }

  fit(): void {
    const box = this.host.parentElement;
    if (!box) return;
    const cs = getComputedStyle(box);
    const avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);

    this.host.style.fontSize = '100px';
    const lines = Array.from(this.host.querySelectorAll<HTMLElement>('.fit-line'));
    const targets = lines.length ? lines : [this.host];
    // offsetWidth ignores transforms (tilt, scale), unlike getBoundingClientRect.
    const widest = Math.max(...targets.map((l) => l.offsetWidth));
    if (!widest || avail <= 0) return;

    this.host.style.fontSize = Math.min((avail / widest) * 100 * this.fitRatio(), this.fitMax()) + 'px';
    this.fitted.emit();
  }

  ngOnDestroy(): void {
    // Also runs on the server (no requestAnimationFrame there); raf is only set in the browser.
    if (this.raf) cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
  }
}
