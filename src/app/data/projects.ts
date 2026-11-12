// Project content. Copy is taken word for word from reference/index.html.
// A null link renders as "#work" (same as the reference) until the real URL exists.

export type BtnIcon = 'down' | 'arrow' | 'code' | 'play' | 'copy' | 'wa' | 'linkedin';

export interface ProjectImage {
  src: string;
  /** Smaller variant(s) for responsive loading, e.g. "assets/img/x-700.webp 700w". The full `src` is added as the largest candidate. */
  small: string;
  width: number;
  height: number;
  alt: string;
}

export interface DemoLogin {
  idLabel: 'Username' | 'Email';
  id: string;
  password: string;
}

export interface Project {
  slug: string;
  title: string;
  status: string;
  description: string;
  tags: readonly string[];
  primary: { label: string; href: string | null; icon: BtnIcon };
  code: string | null;
  /** Demo account shown on the card so visitors can sign in to the live demo. */
  login: DemoLogin;
  screen: {
    label: string;
    glow: 'accent' | 'accent2';
    /** Either a screenshot or the live LevelUp mock. */
    image?: ProjectImage;
    mock?: 'levelup';
  };
}

export const LINKS = {
  github: 'https://github.com/naiw991uen-collab',
  whatsapp: 'https://wa.me/201008113554',
  linkedin: 'https://www.linkedin.com/in/nasr-mohamed-dev',
  cv: 'assets/cv/Nasr-Mohamed-CV.pdf',
  email: 'naiw991uen@gmail.com',
} as const;

export const PROJECTS: readonly Project[] = [
  {
    slug: 'levelup',
    title: 'LevelUp',
    status: 'Live',
    description:
      'A cashier system for PlayStation lounges: per-minute billing for Single and Multi play, drinks, itemized bills and daily dashboards. Runs online, or offline from a USB stick.',
    tags: ['.NET 9', 'ASP.NET Core MVC', 'EF Core', 'SQLite', 'Arabic RTL'],
    primary: { label: 'Live demo', href: 'http://levelup-ps.runasp.net', icon: 'arrow' },
    code: 'https://github.com/naiw991uen-collab/levelup',
    login: { idLabel: 'Username', id: 'admin', password: 'LevelUp@2003' },
    screen: { label: 'levelup / devices', glow: 'accent', mock: 'levelup' },
  },
  {
    slug: 'meals',
    title: 'Meals',
    status: 'Live',
    description:
      'A recipe explorer behind a login. Pick a meal, browse every recipe, preview one in a modal, then open the full page with ingredients and steps.',
    tags: ['Angular 20', 'Signals', 'Route guards', 'RxJS'],
    primary: { label: 'Live demo', href: 'https://naiw991uen-collab.github.io/meals/', icon: 'arrow' },
    code: 'https://github.com/naiw991uen-collab/meals',
    login: { idLabel: 'Username', id: 'emilys', password: 'emilyspass' },
    screen: {
      label: 'meals / home',
      glow: 'accent2',
      image: {
        src: 'assets/img/meals.webp',
        small: 'assets/img/meals-700.webp 700w',
        width: 1400,
        height: 514,
        alt: 'Meals home page with Breakfast, Lunch and Dinner cards',
      },
    },
  },
  {
    slug: 'power-fitness',
    title: 'Power Fitness',
    status: 'Live',
    description:
      'A gym management system. Staff manage members, trainers, plans and memberships, schedule sessions, and see live counts of members and sessions on the home page.',
    tags: ['ASP.NET Core MVC', 'EF Core', 'Members', 'Scheduling'],
    primary: { label: 'Live demo', href: 'https://gym-nasr.runasp.net', icon: 'arrow' },
    code: 'https://github.com/naiw991uen-collab/GymManagmentSystem',
    login: { idLabel: 'Email', id: 'NasrMohamed@gmail.com', password: 'P@ssw0rd' },
    screen: {
      label: 'power-fitness / home',
      glow: 'accent',
      image: {
        src: 'assets/img/gym.webp',
        small: 'assets/img/gym-800.webp 800w',
        width: 1600,
        height: 850,
        alt: 'Power Fitness home page with member and session counts',
      },
    },
  },
  {
    slug: 'categories',
    title: 'Categories',
    status: 'Shop catalog',
    description:
      'A shop catalog that loads product categories from a REST API, shows each one as an image card, and opens every product inside it.',
    tags: ['REST API', 'DummyJSON', 'Responsive grid'],
    primary: { label: 'Live demo', href: 'https://naiw991uen-collab.github.io/catigories/', icon: 'arrow' },
    code: 'https://github.com/naiw991uen-collab/catigories',
    login: { idLabel: 'Username', id: 'emilys', password: 'emilyspass' },
    screen: {
      label: 'shop / categories',
      glow: 'accent2',
      image: {
        src: 'assets/img/categories.webp',
        small: 'assets/img/categories-700.webp 700w',
        width: 1400,
        height: 1040,
        alt: 'Category grid with beauty, fragrances, furniture, groceries and more',
      },
    },
  },
];

/** Rooms in the LevelUp mock. `start` = seconds already elapsed, `rate` = EGP per hour. */
export interface Room {
  name: string;
  mode?: 'Multi' | 'Single';
  start?: number;
  rate?: number;
}

export const LEVELUP_ROOMS: readonly Room[] = [
  { name: 'غرفة ١', mode: 'Multi', start: 5047, rate: 80 },
  { name: 'غرفة ٢', mode: 'Single', start: 2272, rate: 60 },
  { name: 'غرفة ٣' },
  { name: 'غرفة ٤', mode: 'Multi', start: 7511, rate: 80 },
];
