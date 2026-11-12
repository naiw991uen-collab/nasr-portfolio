import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, afterNextRender, inject } from '@angular/core';
import { gsap } from 'gsap';
import { AnimationService } from '../../core/animation.service';
import { Badge } from '../../shared/badge/badge';

const SEGMENTS: readonly { text: string; em: boolean }[] = [
  { text: 'I like the moment when messy business rules turn into', em: false },
  { text: 'clean, layered code', em: true },
  { text: 'that a cashier or a hungry visitor can use without thinking about it.', em: false },
];

@Component({
  selector: 'app-about',
  imports: [Badge],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About implements OnDestroy {
  private readonly anim = inject(AnimationService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private ctx?: gsap.Context;

  constructor() {
    afterNextRender(() => {
      if (!this.anim.enabled) return;
      this.ctx = gsap.context(() => {
        const text = this.host.querySelector('.about-text')!;
        const portrait = this.host.querySelector('.portrait')!;

        // Statement words light up one by one while scrolling through.
        gsap.fromTo(text.querySelectorAll('.w'), { opacity: 0.18 }, {
          opacity: 1, stagger: 0.05, ease: 'none',
          scrollTrigger: { trigger: text, start: 'top 80%', end: 'bottom 45%', scrub: true },
        });
        gsap.from('.fact', { y: 24, duration: 0.9, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.facts', start: 'top 88%' } });

        // Portrait: frame wipes up, photo zooms out while scrolling.
        gsap.fromTo('.portrait .frame', { clipPath: 'inset(100% 0 0 0 round 28px)' }, {
          clipPath: 'inset(0% 0 0 0 round 28px)', duration: 1.5, ease: 'expo.inOut',
          scrollTrigger: { trigger: portrait, start: 'top 80%' },
        });
        gsap.fromTo('.portrait img', { scale: 1.35 }, {
          scale: 1, ease: 'none',
          scrollTrigger: { trigger: portrait, start: 'top bottom', end: 'bottom 40%', scrub: true },
        });
      }, this.host);
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }

  // Words are split up front so phase 4 can light them up one by one.
  protected readonly segments = SEGMENTS.map((s) => ({ em: s.em, words: s.text.split(/\s+/) }));
  protected readonly facts = [
    ['Front end', 'Angular 20 · Signals · RxJS'],
    ['Back end', 'ASP.NET Core 9 · Identity'],
    ['Architecture', '3 layers · Unit of Work'],
    ['Data', 'EF Core · SQLite'],
  ] as const;
}
