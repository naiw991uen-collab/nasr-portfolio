import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Spinning circular badge "FULL-STACK DEVELOPER • ANGULAR • .NET •". Position it from the parent. */
@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 200 200" aria-hidden="true">
      <defs><path [attr.id]="pathId()" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
      <text>
        <textPath [attr.href]="'#' + pathId()" textLength="486" lengthAdjust="spacing">FULL-STACK DEVELOPER • ANGULAR • .NET • </textPath>
      </text>
      <circle cx="100" cy="100" r="34" />
      <path class="arr" d="M88 112 112 88M94 88h18v18" />
    </svg>
  `,
  styles: `
    /* Spin lives on the svg, so GSAP can still scale/rotate the host in the hero intro. */
    :host { display: block; }
    svg { display: block; width: 100%; height: auto; overflow: visible; animation: spin 14s linear infinite; }
    text { font-family: var(--mono); font-size: 13.5px; letter-spacing: 2.6px; fill: var(--fg); }
    circle { fill: var(--btn); }
    .arr { fill: none; stroke: var(--btn-ink); stroke-width: 3; stroke-linecap: round; }
    circle, .arr { transform-origin: 100px 100px; animation: spin 14s linear infinite reverse; }
  `,
})
export class Badge {
  readonly pathId = input.required<string>();
}
