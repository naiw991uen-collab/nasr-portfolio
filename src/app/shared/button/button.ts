import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewEncapsulation,
  afterNextRender,
  inject,
  input,
} from '@angular/core';
import { MagneticDirective } from '../../core/magnetic.directive';
import { BtnIcon } from '../../data/projects';

/**
 * Pill button with a round icon. Use on a real <a> or <button>:
 *   <a appBtn variant="solid" icon="arrow" href="...">Live demo</a>
 * Every button is magnetic (fine pointers), and its hover fill grows from where the pointer entered.
 */
@Component({
  selector: 'a[appBtn], button[appBtn]',
  templateUrl: './button.html',
  styleUrl: './button.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [MagneticDirective],
  host: {
    class: 'btn',
    '[class.solid]': "variant() === 'solid'",
    '[class.wa]': "variant() === 'wa'",
    '[class.small]': "size() === 'small'",
  },
})
export class Button implements OnDestroy {
  readonly variant = input<'solid' | 'outline' | 'wa'>('outline');
  readonly size = input<'md' | 'small'>('md');
  readonly icon = input<BtnIcon>('arrow');

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  constructor() {
    const zone = inject(NgZone);
    afterNextRender(() => zone.runOutsideAngular(() => this.el.addEventListener('pointerenter', this.setOrigin)));
  }

  /** The ::before fill circle starts at the pointer's entry point (--rx / --ry). */
  private readonly setOrigin = (e: PointerEvent) => {
    const r = this.el.getBoundingClientRect();
    this.el.style.setProperty('--rx', `${e.clientX - r.left}px`);
    this.el.style.setProperty('--ry', `${e.clientY - r.top}px`);
  };

  ngOnDestroy(): void {
    this.el.removeEventListener('pointerenter', this.setOrigin);
  }
}
