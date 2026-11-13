import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, afterNextRender, computed, inject, signal } from '@angular/core';
import { gsap } from 'gsap';
import { AnimationService } from '../../core/animation.service';
import { I18nService } from '../../core/i18n.service';
import { Dict } from '../../i18n/en';
import { LEVELUP_ROOMS, PROJECTS, Project, Room } from '../../data/projects';
import { ScrambleDirective } from '../../core/scramble.directive';
import { Button } from '../../shared/button/button';

interface RoomView {
  name: string;
  on: boolean;
  time: string;
  sub: string;
}

function fmt(s: number): string {
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const x = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${x}`;
}

/** Same rule LevelUp uses: every started minute is billed. */
function cost(s: number, rate: number): string {
  return Math.round((Math.ceil(s / 60) * rate) / 60) + ' ج.م';
}

@Component({
  selector: 'app-work',
  imports: [Button, ScrambleDirective],
  templateUrl: './work.html',
  styleUrl: './work.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Work implements OnDestroy {
  protected readonly projects = PROJECTS;
  protected readonly total = String(PROJECTS.length).padStart(2, '0');

  /** Seconds since the page opened; drives the LevelUp mock timers. */
  private readonly elapsed = signal(0);
  private timer?: ReturnType<typeof setInterval>;

  protected readonly rooms = computed<RoomView[]>(() =>
    LEVELUP_ROOMS.map((r: Room) => {
      if (r.start === undefined || r.rate === undefined) {
        return { name: r.name, on: false, time: 'متاحة', sub: 'ابدأ جلسة' };
      }
      const s = r.start + this.elapsed();
      return { name: `${r.name} · ${r.mode}`, on: true, time: fmt(s), sub: cost(s, r.rate) };
    }),
  );

  /** Key of the demo-login value just copied (shows ✓ for a second). */
  protected readonly copied = signal<string | null>(null);
  private copiedTimer?: ReturnType<typeof setTimeout>;

  protected readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.t;

  /** Translated texts of one project card. */
  protected text(p: Project): Dict['work']['projects']['levelup'] {
    return (this.t().work.projects as Record<string, Dict['work']['projects']['levelup']>)[p.slug];
  }

  protected projectOf(i: number): string {
    return this.i18n.fmt(this.t().work.projectOf, { n: i + 1, total: this.projects.length });
  }

  protected loginFields(p: Project) {
    const w = this.t().work;
    return [
      { key: `${p.slug}-id`, label: p.login.idLabel === 'Email' ? w.email : w.username, value: p.login.id },
      { key: `${p.slug}-pw`, label: w.password, value: p.login.password },
    ];
  }

  /** "Copy username" / "Username copied" (English lower-cases the field; German nouns keep their capital). */
  protected copyAria(key: string, label: string): string {
    const w = this.t().work;
    if (this.copied() === key) return this.i18n.fmt(w.fieldCopied, { field: label });
    return this.i18n.fmt(w.copyField, { field: this.i18n.lang() === 'en' ? label.toLowerCase() : label });
  }

  protected async copy(key: string, value: string, el: HTMLElement): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard blocked: select the value so it can be copied by hand.
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    this.copied.set(key);
    clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(() => this.copied.set(null), 1000);
  }

  private readonly anim = inject(AnimationService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private ctx?: gsap.Context;
  private mm?: gsap.MatchMedia;

  constructor() {
    afterNextRender(() => {
      const t0 = Date.now();
      this.timer = setInterval(() => this.elapsed.set(Math.floor((Date.now() - t0) / 1000)), 1000);

      if (!this.anim.enabled) return;
      this.ctx = gsap.context(() => this.anim.revealTitles(this.host), this.host);
      this.animateCards();
    });

    // Only the reading direction changes the animations (the slide goes the other way);
    // English <-> German only swaps text, so ScrollTrigger just re-measures.
    this.i18n.afterLangChange(() => {
      if (!this.anim.enabled || this.builtRtl === this.i18n.rtl()) return;
      this.mm?.revert();
      this.animateCards();
    });
  }

  private builtRtl = false;

  private animateCards(): void {
    const q = <T extends Element = HTMLElement>(s: string) => Array.from(this.host.querySelectorAll<T>(s));
    const pin = q('.work-pin')[0];
    const track = q('.work-track')[0];
    const bar = q('.work-progress i')[0];
    const panels = q('.panel');
    // Right-to-left: the first card is on the right and the row slides right to reveal the rest.
    const rtl = (this.builtRtl = this.i18n.rtl());
    const wipe = (screen: Element, trigger: Element, start: string) =>
      gsap.fromTo(
        screen,
        { clipPath: 'inset(0 0 100% 0 round 18px)' },
        { clipPath: 'inset(0 0 0% 0 round 18px)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger, start } },
      );

    this.mm = gsap.matchMedia(this.host);

    // Desktop: pin the section and slide the cards sideways while scrolling down.
    this.mm.add('(min-width: 900px)', () => {
      pin.classList.add('is-pinned'); // hides the no-JS horizontal scrollbar
      const dist = () => track.scrollWidth - innerWidth;
      // Reference pins at "top 8%"; never let the cards slide under the fixed header.
      const top = () => Math.max(innerHeight * 0.08, this.anim.navHeight());

      const slide = gsap.to(track, {
        x: () => (rtl ? dist() : -dist()),
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          start: () => `top ${top()}px`,
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (s) => gsap.set(bar, { scaleX: s.progress }),
        },
      });

      // Each screenshot straightens and grows as its card slides in.
      panels.forEach((p) =>
        gsap.from(p.querySelector('.screen'), {
          scale: 0.85,
          rotate: rtl ? 3 : -3,
          ease: 'none',
          scrollTrigger: { trigger: p, containerAnimation: slide, start: rtl ? 'right left' : 'left right', end: 'center center', scrub: true },
        }),
      );
      // Screens wipe open when the row arrives.
      panels.forEach((p) => wipe(p.querySelector('.screen')!, pin, 'top 70%'));

      return () => {
        pin.classList.remove('is-pinned');
        gsap.set(bar, { scaleX: 0 });
      };
    });

    // Phones/tablets: cards stay stacked; each one rises in and its screen wipes open.
    this.mm.add('(max-width: 899px)', () => {
      panels.forEach((p) => {
        gsap.from(p, { y: 60, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 90%' } });
        const screen = p.querySelector('.screen')!;
        wipe(screen, screen, 'top 85%');
      });
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
    clearTimeout(this.copiedTimer);
    this.mm?.revert();
    this.ctx?.revert();
  }
}
