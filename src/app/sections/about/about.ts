import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, afterNextRender, computed, inject } from '@angular/core';
import { gsap } from 'gsap';
import { AnimationService } from '../../core/animation.service';
import { I18nService } from '../../core/i18n.service';
import { Badge } from '../../shared/badge/badge';

@Component({
  selector: 'app-about',
  imports: [Badge],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About implements OnDestroy {
  private readonly anim = inject(AnimationService);
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.t;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private ctx?: gsap.Context;
  /** The statement words: re-created for every language, so their tween is rebuilt. */
  private wordsCtx?: gsap.Context;

  constructor() {
    afterNextRender(() => {
      if (!this.anim.enabled) return;
      this.animateWords();
      this.ctx = gsap.context(() => {
        const portrait = this.host.querySelector('.portrait')!;
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

    this.i18n.afterLangChange(() => {
      if (!this.anim.enabled) return;
      this.wordsCtx?.revert();
      this.animateWords();
    });
  }

  /** Statement words light up one by one while scrolling through. */
  private animateWords(): void {
    this.wordsCtx = gsap.context(() => {
      const text = this.host.querySelector('.about-text')!;
      gsap.fromTo(text.querySelectorAll('.w'), { opacity: 0.18 }, {
        opacity: 1, stagger: 0.05, ease: 'none',
        scrollTrigger: { trigger: text, start: 'top 80%', end: 'bottom 45%', scrub: true },
      });
    }, this.host);
  }

  ngOnDestroy(): void {
    this.wordsCtx?.revert();
    this.ctx?.revert();
  }

  // Words are split up front so they can light up one by one (whole words, so Arabic stays joined).
  // The middle part of the sentence is highlighted.
  protected readonly segments = computed(() =>
    this.t().about.text.map((text, i) => ({ em: i === 1, words: text.split(/\s+/) })),
  );
  protected readonly facts = computed(() => this.t().about.facts);
}
