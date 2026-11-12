import { Directive, ElementRef, NgZone, OnDestroy, afterNextRender, inject } from '@angular/core';
import { gsap } from 'gsap';
import { AnimationService } from './animation.service';

/** 3D tilt toward the pointer, springing back on leave. Fine pointers only. */
@Directive({ selector: '[appTilt]' })
export class TiltDirective implements OnDestroy {
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
      rotateY: ((e.clientX - r.left) / r.width - 0.5) * 14,
      rotateX: -((e.clientY - r.top) / r.height - 0.5) * 14,
      transformPerspective: 800,
      duration: 0.5,
    });
  };

  private readonly leave = () => {
    gsap.to(this.el, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'elastic.out(1,.4)' });
  };

  ngOnDestroy(): void {
    if (!this.active) return;
    this.el.removeEventListener('pointermove', this.move);
    this.el.removeEventListener('pointerleave', this.leave);
    gsap.killTweensOf(this.el);
  }
}
