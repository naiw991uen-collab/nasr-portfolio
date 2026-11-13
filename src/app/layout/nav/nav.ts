import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';
import { AnimationService } from '../../core/animation.service';
import { I18nService, LANGS, Lang } from '../../core/i18n.service';
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
  host: { '(document:click)': 'onDocClick($event)' },
})
export class Nav implements OnDestroy {
  protected readonly theme = inject(ThemeService);
  protected readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.t;
  private readonly anim = inject(AnimationService);
  private readonly injector = inject(Injector);
  private readonly bar = viewChild.required<ElementRef<HTMLElement>>('bar');
  private readonly header = viewChild.required<ElementRef<HTMLElement>>('header');
  private readonly langBox = viewChild.required<ElementRef<HTMLElement>>('langBox');
  private readonly langBtn = viewChild.required<ElementRef<HTMLButtonElement>>('langBtn');
  private ctx?: gsap.Context;

  protected readonly palettes = PALETTES;
  protected readonly langs = LANGS;
  protected readonly cv = LINKS.cv;
  protected readonly links = computed(() => {
    const n = this.t().nav;
    return [
      { href: '#work', label: n.work },
      { href: '#about', label: n.about },
      { href: '#process', label: n.process },
      { href: '#stack', label: n.stack },
      { href: '#contact', label: n.contact },
    ];
  });

  /** Language menu open. */
  protected readonly open = signal(false);

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

  protected toggle(): void {
    this.open.update((o) => !o);
    // Keyboard users land on the current language.
    if (this.open()) {
      afterNextRender(() => this.items().find((b) => b.getAttribute('aria-checked') === 'true')?.focus({ preventScroll: true }), {
        injector: this.injector,
      });
    }
  }

  protected choose(lang: Lang): void {
    this.i18n.set(lang);
    this.close(true);
  }

  private close(focusButton = false): void {
    if (!this.open()) return;
    this.open.set(false);
    if (focusButton) this.langBtn().nativeElement.focus({ preventScroll: true });
  }

  /** Any click outside the language box closes the menu. */
  protected onDocClick(e: MouseEvent): void {
    if (this.open() && !this.langBox().nativeElement.contains(e.target as Node)) this.close();
  }

  /** Tabbing out of the box closes it too. */
  protected onFocusOut(e: FocusEvent): void {
    const next = e.relatedTarget as Node | null;
    if (next && !this.langBox().nativeElement.contains(next)) this.close();
  }

  /** Escape closes; arrow keys move between the three languages. */
  protected onMenuKey(e: KeyboardEvent): void {
    if (!this.open()) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close(true);
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const items = this.items();
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items[next]?.focus({ preventScroll: true });
  }

  private items(): HTMLButtonElement[] {
    return Array.from(this.langBox().nativeElement.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'));
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
