import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, afterNextRender, inject } from '@angular/core';
import { gsap } from 'gsap';
import { AnimationService } from '../../core/animation.service';
import { ScrambleDirective } from '../../core/scramble.directive';

@Component({
  selector: 'app-process',
  imports: [ScrambleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './process.html',
  styleUrl: './process.scss',
})
export class Process implements OnDestroy {
  private readonly anim = inject(AnimationService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private ctx?: gsap.Context;

  constructor() {
    afterNextRender(() => {
      if (!this.anim.enabled) return;
      this.ctx = gsap.context(() => {
        this.anim.revealTitles(this.host);
        const cards = Array.from(this.host.querySelectorAll<HTMLElement>('.scard'));
        cards.forEach((c, i) => {
          // While the next card slides over it, this one shrinks a little and darkens.
          if (i < cards.length - 1) {
            gsap.to(c, {
              scale: 0.9 - (cards.length - 2 - i) * 0.03,
              filter: 'brightness(.6)',
              ease: 'none',
              scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: `top ${96 + 40}px`, scrub: true },
            });
          }
          gsap.from(c.querySelectorAll('h3, p, code'), {
            y: 50, opacity: 0.2, duration: 1, ease: 'expo.out', stagger: 0.08,
            scrollTrigger: { trigger: c, start: 'top 75%' },
          });
        });
      }, this.host);
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }

  protected readonly cards = [
    {
      k: '01',
      title: 'Rules live in code, not in heads.',
      body: "LevelUp bills every started minute, keeps each segment's rate and skips paused time. All of it is one tested calculator.",
      code: 'round(ceil(sec / 60) × rate / 60)',
    },
    {
      k: '02',
      title: 'Thin controllers, clear layers.',
      body: 'Presentation, business logic and data each depend only on the layer below. Services return a Result instead of throwing.',
      code: 'PL → BLL → DAL',
    },
    {
      k: '03',
      title: "If it's not live, it's not done.",
      body: 'Meals and Categories run on GitHub Pages, LevelUp and Power Fitness run on real servers. A link you can click beats a screenshot.',
      code: 'git push → deploy',
    },
  ];
}
