import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { gsap } from 'gsap';
import { AnimationService } from '../../core/animation.service';
import { FitTextDirective } from '../../core/fit-text.directive';
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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private ctx?: gsap.Context;

  constructor() {
    afterNextRender(() => {
      if (!this.anim.enabled) return;
      // "LET'S BUILD SOMETHING." letters wave up into place.
      this.ctx = gsap.context(() => {
        gsap.from('.big .ch', { yPercent: 100, opacity: 0.2, duration: 1, ease: 'expo.out', stagger: 0.025, scrollTrigger: { trigger: '.big', start: 'top 85%' } });
      }, this.host);
    });
  }

  protected readonly email = LINKS.email;
  protected readonly cv = LINKS.cv;
  protected readonly linkedin = LINKS.linkedin;
  // Chars per word, so each letter can lift on hover and wave in (phase 4).
  protected readonly line1 = ["Let's", 'build'].map((w) => [...w]);
  protected readonly line2 = [...'something'];

  protected readonly copyLabel = signal('Copy email');
  private readonly mail = viewChild.required<ElementRef<HTMLElement>>('mail');
  private resetTimer?: ReturnType<typeof setTimeout>;

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.email);
      this.copyLabel.set('Copied');
    } catch {
      // Clipboard blocked: select the address so the user can copy it by hand.
      const range = document.createRange();
      range.selectNodeContents(this.mail().nativeElement);
      const sel = getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      this.copyLabel.set('Selected, press Ctrl+C');
    }
    clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(() => this.copyLabel.set('Copy email'), 2200);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
    clearTimeout(this.resetTimer);
  }
}
