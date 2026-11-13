import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, afterNextRender, inject } from '@angular/core';
import { gsap } from 'gsap';
import { AnimationService } from '../../core/animation.service';
import { I18nService } from '../../core/i18n.service';
import { TiltDirective } from '../../core/tilt.directive';

@Component({
  selector: 'app-stack',
  imports: [TiltDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="sec stack-sec" id="stack">
      <div class="wrap">
        <div class="head"><h2 class="h2 reveal-title"><span class="line"><span>{{ t().stack.title }}</span></span></h2></div>
        <div class="stack">
          @for (tile of tiles; track $index) {
            <div class="tile" appTilt>
              <span class="mono">{{ t().stack.labels[$index] }}</span>
              <ul>
                @for (i of tile.items; track i) {
                  <li dir="ltr">{{ i }}</li>
                }
              </ul>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .stack-sec { padding-top: 0; }
    .stack { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 270px), 1fr)); gap: 16px; }
    .tile { border: 1px solid var(--line); border-radius: 22px; padding: 28px; background: var(--surface); transform-style: preserve-3d; transition: border-color .3s; min-height: 260px; display: flex; flex-direction: column; justify-content: space-between; }
    .tile:hover { border-color: var(--accent); }
    .tile ul { list-style: none; margin: 0; padding: 0; font-size: 19px; line-height: 1.8; }
    .tile .mono { color: var(--muted); }
  `,
})
export class Stack implements OnDestroy {
  private readonly anim = inject(AnimationService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private ctx?: gsap.Context;

  constructor() {
    afterNextRender(() => {
      if (!this.anim.enabled) return;
      this.ctx = gsap.context(() => {
        this.anim.revealTitles(this.host);
        gsap.from('.tile', { y: 70, rotate: 2, duration: 1.1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.stack', start: 'top 85%' } });
      }, this.host);
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }

  protected readonly t = inject(I18nService).t;
  // Labels come from the translations (same index); technology names stay as they are.
  protected readonly tiles = [
    { items: ['Angular', 'TypeScript', 'RxJS', 'Bootstrap 5'] },
    { items: ['C#', 'ASP.NET Core MVC', 'AutoMapper', 'FluentValidation'] },
    { items: ['EF Core', 'SQLite', 'Repositories', 'Serilog'] },
    { items: ['Git & GitHub', 'GitHub Pages', 'MonsterASP.NET', 'VS Code'] },
  ];
}
