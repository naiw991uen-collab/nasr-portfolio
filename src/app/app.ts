import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Cursor } from './layout/cursor/cursor';
import { Footer } from './layout/footer/footer';
import { Loader } from './layout/loader/loader';
import { Nav } from './layout/nav/nav';
import { About } from './sections/about/about';
import { Contact } from './sections/contact/contact';
import { Hero } from './sections/hero/hero';
import { Marquee } from './sections/marquee/marquee';
import { Numbers } from './sections/numbers/numbers';
import { Process } from './sections/process/process';
import { Stack } from './sections/stack/stack';
import { Work } from './sections/work/work';

@Component({
  selector: 'app-root',
  imports: [Loader, Cursor, Nav, Hero, Marquee, Work, About, Numbers, Process, Stack, Contact, Footer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grain" aria-hidden="true"></div>
    <a class="skip-link" href="#main">Skip to content</a>
    <app-loader />
    <app-cursor />
    <app-nav />
    <main id="main" tabindex="-1">
      <app-hero />
      <app-marquee />
      <app-work />
      <app-about />
      <app-numbers />
      <app-process />
      <app-stack />
      <app-contact />
    </main>
    <app-footer />
  `,
})
export class App {}
