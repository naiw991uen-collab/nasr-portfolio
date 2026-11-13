import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, afterNextRender, inject } from '@angular/core';
import { gsap } from 'gsap';
import { AnimationService } from '../../core/animation.service';
import { FitTextDirective } from '../../core/fit-text.directive';
import { I18nService } from '../../core/i18n.service';
import { LINKS } from '../../data/projects';

@Component({
  selector: 'app-footer',
  imports: [FitTextDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="site-foot">
      <div class="wrap">
        <div class="foot">
          <span>{{ t().footer.copy }}</span>
          <nav [attr.aria-label]="t().footer.elsewhere">
            <a [href]="links.github">GitHub</a>
            <a [href]="links.linkedin" target="_blank" rel="noopener noreferrer" [attr.aria-label]="'LinkedIn ' + t().common.newTab">LinkedIn</a>
            <a href="#top">{{ t().footer.top }}</a>
          </nav>
        </div>
      </div>
      <div class="giant" aria-hidden="true" appFitText [fitRatio]="0.94" [fitMax]="150" (fitted)="anim.refresh()">
        <span class="fit-line">{{ t().footer.giant }}</span>
      </div>
    </footer>
  `,
  styles: `
    .site-foot { position: relative; overflow: hidden; padding-bottom: 16px; }
    .foot { display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-top: 120px; padding-block: 28px; border-top: 1px solid var(--line); color: var(--muted); font-size: 15px; }
    .foot nav { display: flex; gap: 24px; flex-wrap: wrap; }
    .foot a { text-decoration: none; }
    .foot a:hover { color: var(--fg); }
    .giant { font-family: var(--display); font-weight: 800; font-size: clamp(34px, 7.6vw, 150px); line-height: .9; letter-spacing: -.07em; text-transform: uppercase; white-space: nowrap; color: transparent; -webkit-text-stroke: 1.5px var(--muted); opacity: .5; margin: 40px 0 24px; text-align: center; user-select: none; }
    /* Arabic: taller letters need more line height. */
    :host-context([lang="ar"]) .giant { line-height: 1.3; color: var(--muted); -webkit-text-stroke: 0; opacity: .22; }
  `,
})
export class Footer implements OnDestroy {
  protected readonly anim = inject(AnimationService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private ctx?: gsap.Context;
  protected readonly links = LINKS;
  protected readonly t = inject(I18nService).t;

  constructor() {
    afterNextRender(() => {
      if (!this.anim.enabled) return;
      // Giant outlined name slides up as the page ends.
      this.ctx = gsap.context(() => {
        gsap.from('.giant', { yPercent: 60, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.giant', start: 'top 95%' } });
      }, this.host);
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
