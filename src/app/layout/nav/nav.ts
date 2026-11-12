import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, afterNextRender, inject, viewChild } from '@angular/core';
import { gsap } from 'gsap';
import { AnimationService } from '../../core/animation.service';
import { MagneticDirective } from '../../core/magnetic.directive';
import { ScrambleDirective } from '../../core/scramble.directive';
import { LINKS } from '../../data/projects';
import { PALETTES, ThemeService } from '../../core/theme.service';

@Component({
  selector: 'app-nav',
  imports: [ScrambleDirective, MagneticDirective],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Nav implements OnDestroy {
  protected readonly theme = inject(ThemeService);
  private readonly anim = inject(AnimationService);
  private readonly bar = viewChild.required<ElementRef<HTMLElement>>('bar');
  private readonly header = viewChild.required<ElementRef<HTMLElement>>('header');
  private ctx?: gsap.Context;

  protected readonly palettes = PALETTES;
  protected readonly cv = LINKS.cv;
  protected readonly links = [
    { href: '#work', label: 'Work' },
    { href: '#about', label: 'About' },
    { href: '#process', label: 'Process' },
    { href: '#stack', label: 'Stack' },
    { href: '#contact', label: 'Contact' },
  ];

  constructor() {
    afterNextRender(() => {
      if (!this.anim.enabled) return;
      this.ctx = gsap.context(() => {
        // Nav drops in together with the hero text (label set by the hero's intro part).
        this.anim.registerIntro(1, (tl) =>
          tl.from(this.header().nativeElement, { yPercent: -100, duration: 1, ease: 'expo.out' }, 'heroText'),
        );
        // Page progress bar.
        gsap.to(this.bar().nativeElement, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
      });
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
