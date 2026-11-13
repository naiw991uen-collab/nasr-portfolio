import { ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, afterNextRender, computed, effect, inject } from '@angular/core';
import { gsap } from 'gsap';
import { AnimationService } from '../../core/animation.service';
import { FitTextDirective } from '../../core/fit-text.directive';
import { I18nService } from '../../core/i18n.service';
import { ThemeService } from '../../core/theme.service';
import { AuroraCanvas } from './aurora-canvas';
import { LINKS } from '../../data/projects';
import { Badge } from '../../shared/badge/badge';
import { Button } from '../../shared/button/button';

@Component({
  selector: 'app-hero',
  imports: [FitTextDirective, Badge, Button],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero implements OnDestroy {
  protected readonly anim = inject(AnimationService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private ctx?: gsap.Context;
  private readonly zone = inject(NgZone);
  private readonly theme = inject(ThemeService);
  private aurora?: AuroraCanvas;
  private typeTimer?: ReturnType<typeof setTimeout>;
  private onPointer?: (e: PointerEvent) => void;

  protected readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.t;
  protected readonly links = LINKS;
  // Split so each piece can rise on its own: letters, or whole words in Arabic.
  protected readonly first = computed(() => this.i18n.split(this.t().hero.first));
  protected readonly last = computed(() => this.i18n.split(this.t().hero.last));

  /** Pointer tilt lives in its own context: its targets (.name, .hero-me) never change. */
  private pointerCtx?: gsap.Context;

  constructor() {
    // Palette switch → canvas re-reads the accent colours.
    effect(() => {
      this.theme.palette();
      this.aurora?.readColors();
    });

    afterNextRender(() => {
      const motion = this.anim.enabled;
      this.zone.runOutsideAngular(() => {
        // Canvas always draws; with reduced motion it is a single static frame.
        this.aurora = new AuroraCanvas(this.host.querySelector<HTMLCanvasElement>('.aurora')!, motion);
        this.aurora.start();
        if (motion) this.typewriter();
      });
      if (!motion) return;
      this.ctx = gsap.context(() => this.animate(), this.host);
      if (this.anim.finePointer) this.pointerCtx = gsap.context(() => this.pointerEffects(), this.host);
    });

    // New language: the name pieces were re-created, so rebuild their tweens; restart the typewriter.
    this.i18n.afterLangChange(() => {
      if (!this.anim.enabled) return;
      clearTimeout(this.typeTimer);
      this.zone.runOutsideAngular(() => this.typewriter());
      this.ctx?.revert();
      this.ctx = gsap.context(() => this.animate(), this.host);
    });
  }

  /** "Right now that means …" deletes and types four phrases in a loop (timings from the reference). */
  private typewriter(): void {
    const el = this.host.querySelector<HTMLElement>('.type')!;
    const words = this.t().hero.phrases;
    el.textContent = words[0];
    let wi = 0;
    let ci = words[0].length;
    let deleting = true;
    const step = () => {
      const w = words[wi];
      if (deleting) {
        ci--;
        el.textContent = w.slice(0, ci);
        if (ci === 0) {
          deleting = false;
          wi = (wi + 1) % words.length;
        }
        this.typeTimer = setTimeout(step, ci === 0 ? 300 : 35);
      } else {
        const n = words[wi];
        ci++;
        el.textContent = n.slice(0, ci);
        if (ci === n.length) {
          deleting = true;
          this.typeTimer = setTimeout(step, 2200);
        } else this.typeTimer = setTimeout(step, 70);
      }
    };
    this.typeTimer = setTimeout(step, 2200); // hold the first phrase before deleting it
  }

  /** Mouse only: the name tilts in 3D toward the pointer and the portrait drifts the other way. */
  private pointerEffects(): void {
    const name = this.host.querySelector('.name')!;
    const me = this.host.querySelector('.hero-me')!;
    // quickTo needs GSAP's canonical names (rotationY/X); the rotateY/X aliases can't be "reset".
    const tiltY = gsap.quickTo(name, 'rotationY', { duration: 1, ease: 'power3' });
    const tiltX = gsap.quickTo(name, 'rotationX', { duration: 1, ease: 'power3' });
    const meX = gsap.quickTo(me, 'x', { duration: 1.2, ease: 'power3' });
    this.onPointer = (e) => {
      const nx = e.clientX / innerWidth - 0.5;
      const ny = e.clientY / innerHeight - 0.5;
      tiltY(nx * 8);
      tiltX(-ny * 6);
      meX(nx * -24);
    };
    this.zone.runOutsideAngular(() => addEventListener('pointermove', this.onPointer!));
  }

  private animate(): void {
    const q = <T extends Element = HTMLElement>(s: string) => Array.from(this.host.querySelectorAll<T>(s));
    const hero = q('.hero')[0];
    const chars = q('.name .ch');
    const me = q('.hero-me')[0];

    // Letters wait below their row until the loader leaves (skipped when rebuilt after the intro).
    if (!this.anim.introBuilt) {
      gsap.set(chars, { yPercent: 110, rotate: 8 });
    }

    // Intro, timed exactly like the reference (positions relative to the previous tween).
    // Registering again (new language before the intro) replaces the earlier part.
    this.anim.registerIntro(0, (tl) => {
      tl.to(chars, { yPercent: 0, rotate: 0, duration: 1.2, ease: 'expo.out', stagger: 0.035 }, 0)
        .addLabel('heroText', '-=.9')
        .from(q('.hero-top, .hero-bottom > *, .hero-strip > *'), { y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.1 }, 'heroText')
        .from(q('.me-cut'), { yPercent: 40, opacity: 0, duration: 1.4, ease: 'expo.out' }, '-=1.3')
        .from(q('.hero-me .disc, .hero-me .ring'), { scale: 0.3, opacity: 0, duration: 1.4, ease: 'expo.out', stagger: 0.1 }, '<')
        .from(q('.hero-me .badge'), { scale: 0, rotate: -180, duration: 1, ease: 'back.out(1.6)' }, '-=.8');
    });

    const scrollOut = { trigger: hero, start: 'top top', end: 'bottom top' };

    // Content drifts down and fades as the hero scrolls away.
    gsap.to(q('.hero > .wrap'), { yPercent: 18, opacity: 0.35, ease: 'none', scrollTrigger: { ...scrollOut, scrub: true } });

    // Portrait sinks and shrinks slightly.
    gsap.to(me, { yPercent: 12, scale: 0.94, ease: 'none', scrollTrigger: { ...scrollOut, scrub: true } });

    // Letters fly apart from the middle. Right-to-left, the first piece is on the right: mirror.
    // Arabic pieces are whole words, so they travel further.
    const mid = (chars.length - 1) / 2;
    const side = this.i18n.rtl() ? -1 : 1;
    const step = this.i18n.lang() === 'ar' ? 56 : 28;
    gsap.to(chars, {
      x: (i: number) => (i - mid) * step * side,
      y: (i: number) => Math.abs(i - mid) * -10,
      skewY: (i: number) => (i - mid) * 2 * side,
      immediateRender: false,
      ease: 'none',
      scrollTrigger: { ...scrollOut, scrub: 0.6 },
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.typeTimer);
    if (this.onPointer) removeEventListener('pointermove', this.onPointer);
    this.aurora?.destroy();
    this.ctx?.revert();
    this.pointerCtx?.revert();
  }
}
