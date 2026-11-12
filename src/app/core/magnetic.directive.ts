import { Directive, ElementRef, NgZone, OnDestroy, afterNextRender, inject } from '@angular/core';
import { gsap } from 'gsap';
import { AnimationService } from './animation.service';

/**
 * Magnetic hover: the element leans toward the pointer and springs back on leave.
 * Fine pointers (mouse/trackpad) only, and only when motion is allowed.
 */
@Directive({ selector: '[appMagnetic]' })
export class MagneticDirective implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly anim = inject(AnimationService);
  private readonly zone = inject(NgZone);
  private active = false;

  constructor() {
    afterNextRender(() => {
      if (!this.anim.enabled || !this.anim.finePointer) return;
      this.active = true;
      this.zone.runOutsideAngular(() => {
        this.el.addEventListener('pointermove', this.move);
        this.el.addEventListener('pointerleave', this.leave);
      });
    });
  }

  private readonly move = (e: PointerEvent) => {
    const r = this.el.getBoundingClientRect();
    gsap.to(this.el, {
      x: (e.clientX - r.left - r.width / 2) * 0.3,
      y: (e.clientY - r.top - r.height / 2) * 0.4,
      duration: 0.4,
      ease: 'power3',
    });
  };

  private readonly leave = () => {
    gsap.to(this.el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1,.35)' });
  };

  ngOnDestroy(): void {
    if (!this.active) return;
    this.el.removeEventListener('pointermove', this.move);
    this.el.removeEventListener('pointerleave', this.leave);
    gsap.killTweensOf(this.el);
  }
}
