import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';
import { AnimationService } from '../../core/animation.service';

const LOGS = ['compiling angular components', 'starting .NET 9 services', 'seeding 4 projects', 'warming up animations', 'ready'];
const SAFETY_TIMEOUT_MS = 6000;

@Component({
  selector: 'app-loader',
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loader implements OnDestroy {
  private readonly anim = inject(AnimationService);
  /** Rendered in the prerendered HTML so it covers the page before JS boots. */
  protected readonly visible = signal(true);

  private readonly root = viewChild<ElementRef<HTMLElement>>('root');
  private readonly logEl = viewChild<ElementRef<HTMLElement>>('log');
  private readonly countEl = viewChild<ElementRef<HTMLElement>>('count');
  private ctx?: gsap.Context;
  private logIndex = -1;

  constructor() {
    afterNextRender(() => {
      if (!this.anim.enabled) {
        this.visible.set(false);
        return;
      }
      this.anim.stopScroll();
      this.ctx = gsap.context(() => this.play(), this.root()!.nativeElement);
    });
  }

  private play(): void {
    const root = this.root()!.nativeElement;
    const marks = Array.from(root.querySelectorAll<SVGPathElement>('.ld-mark path'));
    marks.forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = String(len);
      p.style.strokeDashoffset = String(len);
    });
    gsap.set('.ld-mark .dotm', { scale: 0, transformOrigin: 'center' });

    const counter = { v: 0 };
    const setCount = () => {
      this.countEl()!.nativeElement.textContent = String(Math.round(counter.v)).padStart(2, '0');
      gsap.set('.ld-line i', { scaleX: counter.v / 100 });
    };

    // Phase 1: draw the mark, type the log, count to 88 %.
    const load = gsap.timeline();
    load
      .to(marks, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: 0.25 })
      .to('.ld-mark .dotm', { scale: 1, duration: 0.6, ease: 'back.out(3)' }, '-=.3')
      .to(counter, { v: 88, duration: 2, ease: 'power1.inOut', onUpdate: setCount }, 0);
    [0.3, 0.8, 1.3, 1.8].forEach((t) => load.call(() => this.nextLog(), undefined, t));

    // Hold at 88 % until fonts and above-the-fold images are really loaded (6 s cap).
    // Lazy images are skipped: they would never load behind the loader.
    const eagerImgs = Array.from(document.querySelectorAll<HTMLImageElement>('img:not([loading="lazy"])'));
    const assets = Promise.all([
      document.fonts?.ready,
      ...eagerImgs.map((im) => (im.complete ? 0 : new Promise((r) => (im.onload = im.onerror = r)))),
    ]);
    const timeout = new Promise((r) => setTimeout(r, SAFETY_TIMEOUT_MS));

    load
      .then(() => Promise.race([assets, timeout]))
      .then(() => {
        // Phase 2: 100 %, then five columns lift from the centre out, accent layer follows, hero intro plays.
        gsap.context(() => {
          gsap
            .timeline()
            .call(() => this.nextLog())
            .to(counter, { v: 100, duration: 0.5, ease: 'power2.out', onUpdate: setCount })
            .call(() => root.classList.add('done'), undefined, '<')
            .to('.ld-ui', { yPercent: -12, opacity: 0, duration: 0.6, ease: 'expo.in' }, '+=.25')
            .to('.ld-cols.front i', { yPercent: -100, duration: 0.9, ease: 'expo.inOut', stagger: { each: 0.07, from: 'center' } }, '-=.15')
            .to('.ld-cols.back i', { yPercent: -100, duration: 0.9, ease: 'expo.inOut', stagger: { each: 0.07, from: 'center' } }, '-=.75')
            .add(this.anim.buildIntro(), '-=.5')
            // Page is visible from here: let it scroll and take clicks while the intro finishes.
            .call(() => {
              root.style.pointerEvents = 'none';
              this.anim.startScroll();
            }, undefined, '<')
            .call(() => this.finish());
        }, root);
      });
  }

  /** Scrolls the terminal log up one line and types the next step. */
  private nextLog(): void {
    this.logIndex++;
    if (this.logIndex >= LOGS.length) return;
    const log = this.logEl()!.nativeElement;
    const isLast = this.logIndex === LOGS.length - 1;

    const line = document.createElement('span');
    line.append('> ');
    const text = isLast ? document.createElement('b') : document.createTextNode('');
    text.textContent = LOGS[this.logIndex];
    line.append(text);
    const caret = document.createElement('i');
    caret.className = 'caret';
    line.append(caret);

    log.querySelectorAll('.caret').forEach((c) => c.remove());
    log.append(line);
    const old = log.children[0];
    gsap.to(log.children, {
      yPercent: -100,
      duration: 0.45,
      ease: 'expo.inOut',
      onComplete: () => {
        old.remove();
        gsap.set(log.children, { yPercent: 0 });
      },
    });
  }

  private finish(): void {
    this.anim.introDone.set(true);
    this.anim.scrollToHash();
    this.ctx?.revert();
    this.visible.set(false);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
