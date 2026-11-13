import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, afterNextRender, inject } from '@angular/core';
import { gsap } from 'gsap';
import { AnimationService } from '../../core/animation.service';
import { I18nService } from '../../core/i18n.service';
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

  protected readonly t = inject(I18nService).t;
  // Title and text come from the translations (same index); the code line stays as it is.
  protected readonly cards = [
    { k: '01', code: 'round(ceil(sec / 60) × rate / 60)' },
    { k: '02', code: 'PL → BLL → DAL' },
    { k: '03', code: 'git push → deploy' },
  ];
}
