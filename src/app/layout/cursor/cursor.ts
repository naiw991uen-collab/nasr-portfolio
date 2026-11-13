import { ChangeDetectionStrategy, Component, DOCUMENT, ElementRef, NgZone, OnDestroy, afterNextRender, inject, viewChild } from '@angular/core';
import { gsap } from 'gsap';
import { AnimationService } from '../../core/animation.service';
import { I18nService } from '../../core/i18n.service';

const VIEW_TARGET = '[data-cursor="view"] .panel-view';

/**
 * Custom cursor: a dot that follows the pointer tightly and a ring that trails it.
 * Over a project screenshot the ring grows into an accent disc that says "VIEW".
 * Fine pointers + motion allowed only; otherwise nothing is shown and the system cursor stays.
 */
@Component({
  selector: 'app-cursor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cursor" #dot aria-hidden="true"></div>
    <div class="cursor-ring" #ring aria-hidden="true"><span>{{ t().cursor.view }}</span></div>
  `,
  styles: `
    :host { display: contents; }
    .cursor, .cursor-ring {
      position: fixed; left: 0; top: 0; z-index: 90; pointer-events: none; border-radius: 50%;
      transform: translate(-50%, -50%);
      display: none; opacity: 0; transition: opacity .3s;
    }
    :host(.on) .cursor, :host(.on) .cursor-ring { display: flex; }
    :host(.on.moved) .cursor, :host(.on.moved) .cursor-ring { opacity: 1; }
    .cursor { width: 8px; height: 8px; background: var(--fg); }
    .cursor-ring {
      width: 40px; height: 40px; border: 1px solid var(--fg);
      align-items: center; justify-content: center;
      font-family: var(--mono); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--on-accent);
      transition: width .4s var(--ease), height .4s var(--ease), background .3s, border-color .3s, opacity .3s;
    }
    .cursor-ring.view { width: 96px; height: 96px; background: var(--accent); border-color: var(--accent); }
    .cursor-ring span { opacity: 0; transition: opacity .2s; }
    .cursor-ring.view span { opacity: 1; }
  `,
})
export class Cursor implements OnDestroy {
  private readonly anim = inject(AnimationService);
  protected readonly t = inject(I18nService).t;
  private readonly doc = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly dot = viewChild.required<ElementRef<HTMLElement>>('dot');
  private readonly ring = viewChild.required<ElementRef<HTMLElement>>('ring');
  private move?: (e: PointerEvent) => void;
  private over?: (e: PointerEvent) => void;

  constructor() {
    afterNextRender(() => {
      if (!this.anim.enabled || !this.anim.finePointer) return;
      const dot = this.dot().nativeElement;
      const ring = this.ring().nativeElement;
      this.host.classList.add('on');
      this.doc.body.classList.add('has-cursor'); // hides the system cursor (see _base.scss)

      const dx = gsap.quickTo(dot, 'x', { duration: 0.12 });
      const dy = gsap.quickTo(dot, 'y', { duration: 0.12 });
      const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
      const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });

      this.move = (e) => {
        dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
        this.host.classList.add('moved'); // stay hidden until the first move (no dot stuck at 0,0)
      };
      // One delegated listener: "VIEW" state whenever the pointer is over a project screenshot.
      this.over = (e) => ring.classList.toggle('view', !!(e.target as Element | null)?.closest?.(VIEW_TARGET));

      this.zone.runOutsideAngular(() => {
        addEventListener('pointermove', this.move!);
        this.doc.addEventListener('pointerover', this.over!);
      });
    });
  }

  ngOnDestroy(): void {
    if (this.move) removeEventListener('pointermove', this.move);
    if (this.over) this.doc.removeEventListener('pointerover', this.over);
    this.doc.body?.classList.remove('has-cursor');
  }
}
