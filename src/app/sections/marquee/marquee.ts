import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, afterNextRender, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimationService } from '../../core/animation.service';

@Component({
  selector: 'app-marquee',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Decorative: the same technologies are listed in the Stack section. -->
    <div class="marquee" aria-hidden="true" dir="ltr">
      <div class="marquee-track">
        <!-- Two copies so the loop in phase 4 is seamless. -->
        @for (copy of [0, 1]; track copy) {
          @for (t of items; track $index) {
            <span [class.ghost]="t.ghost" [attr.aria-hidden]="copy === 1 ? 'true' : null">{{ t.name }}</span
            ><span aria-hidden="true">✦</span>
          }
        }
      </div>
    </div>
  `,
  styles: `
    .marquee { border-block: 1px solid var(--line); padding-block: 22px; overflow: hidden; white-space: nowrap; }
    .marquee-track { display: inline-flex; gap: 48px; font-family: var(--display); font-weight: 700; font-size: clamp(28px, 4vw, 56px); letter-spacing: -.03em; will-change: transform; }
    .marquee-track span:nth-child(even) { color: var(--accent); font-size: .6em; align-self: center; }
    .marquee-track .ghost { color: transparent; -webkit-text-stroke: 1px var(--muted); }
  `,
})
export class Marquee implements OnDestroy {
  private readonly anim = inject(AnimationService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private tick?: () => void;
  private velocity?: ScrollTrigger;
  private onRefresh?: () => void;

  constructor() {
    afterNextRender(() => {
      if (!this.anim.enabled) return;
      const track = this.host.querySelector<HTMLElement>('.marquee-track')!;
      let half = track.scrollWidth / 2; // two copies: wrap after one
      let x = 0;
      let dir = 1;
      let boost = 0;

      // Constant drift; scrolling adds speed and skew, and scrolling up reverses it.
      this.tick = () => {
        x -= (1.2 + boost) * dir;
        if (x <= -half) x += half;
        if (x > 0) x -= half;
        gsap.set(track, { x, skewX: -boost * 0.6 });
        boost *= 0.92;
      };
      gsap.ticker.add(this.tick);

      this.velocity = ScrollTrigger.create({
        onUpdate: (s) => {
          dir = s.direction;
          boost = Math.min(Math.abs(s.getVelocity()) / 180, 12);
        },
      });
      // Re-measure only on layout changes (not every frame).
      this.onRefresh = () => (half = track.scrollWidth / 2);
      ScrollTrigger.addEventListener('refresh', this.onRefresh);
    });
  }

  ngOnDestroy(): void {
    if (this.tick) gsap.ticker.remove(this.tick);
    if (this.onRefresh) ScrollTrigger.removeEventListener('refresh', this.onRefresh);
    this.velocity?.kill();
  }

  protected readonly items = [
    { name: 'Angular', ghost: false },
    { name: 'TypeScript', ghost: true },
    { name: 'C# / .NET 9', ghost: false },
    { name: 'RxJS', ghost: true },
    { name: 'EF Core', ghost: false },
    { name: 'ASP.NET Core', ghost: true },
    { name: 'SQLite', ghost: false },
  ];
}
