import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, afterNextRender, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimationService } from '../../core/animation.service';

@Component({
  selector: 'app-numbers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="sec numbers">
      <div class="wrap nums">
        @for (n of nums; track n.label) {
          <!-- Final value is in the HTML (no JS / reduced motion); with motion it counts up from 00. -->
          <div class="num"><b [attr.data-to]="n.to">{{ pad(n.to) }}</b><span>{{ n.label }}</span></div>
        }
      </div>
    </section>
  `,
  styles: `
    .numbers { padding-top: 0; }
    .nums { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 24px; }
    .num { border-top: 1px solid var(--line); padding-top: 20px; }
    .num b { display: block; font-family: var(--display); font-weight: 800; font-size: clamp(72px, 9vw, 140px); line-height: .9; letter-spacing: -.05em; font-variant-numeric: tabular-nums; }
    .num span { color: var(--muted); }
  `,
})
export class Numbers implements OnDestroy {
  private readonly anim = inject(AnimationService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private ctx?: gsap.Context;

  protected readonly nums = [
    { to: 4, label: 'projects on GitHub' },
    { to: 4, label: 'live demos you can open now' },
    { to: 3, label: "layers in LevelUp's architecture" },
  ];
  protected pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  constructor() {
    afterNextRender(() => {
      if (!this.anim.enabled) return;
      this.ctx = gsap.context(() => {
        this.host.querySelectorAll<HTMLElement>('.num b').forEach((b) => {
          const to = Number(b.dataset['to']);
          const o = { v: 0 };
          b.textContent = '00';
          ScrollTrigger.create({
            trigger: b,
            start: 'top 88%',
            once: true,
            onEnter: () =>
              gsap.to(o, { v: to, duration: 1.6, ease: 'power3.out', onUpdate: () => {
                b.textContent = this.pad(Math.round(o.v));
              } }),
          });
        });
      }, this.host);
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
