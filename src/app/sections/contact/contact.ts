import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { gsap } from 'gsap';
import { AnimationService } from '../../core/animation.service';
import { FitTextDirective } from '../../core/fit-text.directive';
import { I18nService } from '../../core/i18n.service';
import { LINKS } from '../../data/projects';
import { Button } from '../../shared/button/button';

@Component({
  selector: 'app-contact',
  imports: [FitTextDirective, Button],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact implements OnDestroy {
  protected readonly anim = inject(AnimationService);
  protected readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.t;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private ctx?: gsap.Context;

  constructor() {
    afterNextRender(() => this.animate());
    // New language: the letters were re-created, so the wave is rebuilt.
    this.i18n.afterLangChange(() => {
      this.ctx?.revert();
      this.animate();
    });
  }

  /** "LET'S BUILD SOMETHING." letters (Arabic: words) wave up into place. */
  private animate(): void {
    const big = this.host.querySelector<HTMLElement>('.big')!;
    // .ready turns on the hover lift's transform transition (see contact.scss).
    if (!this.anim.enabled) {
      big.classList.add('ready');
      return;
    }
    big.classList.remove('ready');
    this.ctx = gsap.context(() => {
      gsap.from('.big .ch', {
        yPercent: 100, opacity: 0.2, duration: 1, ease: 'expo.out', stagger: 0.025,
        scrollTrigger: { trigger: '.big', start: 'top 85%' },
        // Drop the inline transform GSAP leaves behind, or it overrides the CSS :hover lift.
        onComplete: () => {
          gsap.set('.big .ch', { clearProps: 'transform' });
          big.classList.add('ready');
        },
      });
    }, this.host);
  }

  protected readonly email = LINKS.email;
  protected readonly cv = LINKS.cv;
  protected readonly linkedin = LINKS.linkedin;
  // Two lines → words → pieces, so each letter can lift on hover and wave in
  // (Arabic pieces are whole words: their letters stay joined).
  protected readonly lines = computed(() =>
    [this.t().contact.line1, this.t().contact.line2].map((line) => line.split(' ').map((w) => this.i18n.split(w))),
  );

  private readonly copyState = signal<'idle' | 'copied' | 'selected'>('idle');
  protected readonly copyLabel = computed(() => {
    const c = this.t().contact;
    return { idle: c.copy, copied: c.copied, selected: c.selected }[this.copyState()];
  });
  private readonly mail = viewChild.required<ElementRef<HTMLElement>>('mail');
  private resetTimer?: ReturnType<typeof setTimeout>;

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.email);
      this.copyState.set('copied');
    } catch {
      // Clipboard blocked: select the address so the user can copy it by hand.
      const range = document.createRange();
      range.selectNodeContents(this.mail().nativeElement);
      const sel = getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      this.copyState.set('selected');
    }
    clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(() => this.copyState.set('idle'), 2200);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
    clearTimeout(this.resetTimer);
  }
}
