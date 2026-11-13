// English (default). The other languages must have the same shape (see Dict).
// Technology names, links and the email stay the same in every language.

export const en = {
  meta: {
    title: 'Nasr Mohamed — Full-stack Developer',
    description:
      'Nasr Mohamed is a full-stack developer building Angular 20 front ends and ASP.NET Core (.NET 9) back ends. Live projects: LevelUp, Meals, Power Fitness and Categories.',
  },
  common: {
    newTab: '(opens in a new tab)',
    skip: 'Skip to content',
    cvAria: 'Download CV (PDF)',
  },
  loader: { aria: 'Loading portfolio' },
  cursor: { view: 'View' },
  nav: {
    logoAria: 'Nasr Mohamed, back to top',
    sectionsAria: 'Sections',
    work: 'Work',
    about: 'About',
    process: 'Process',
    stack: 'Stack',
    contact: 'Contact',
    themeAria: 'Color theme',
    themes: { aurora: 'Aurora theme', ember: 'Ember theme', paper: 'Paper theme' },
    langAria: 'Language',
  },
  hero: {
    role: '( Full-stack developer )',
    status: 'Open to work',
    nameAria: 'Nasr Mohamed',
    first: 'Nasr',
    last: 'Mohamed',
    lede1: 'I build web apps end to end.',
    lede2: 'Right now that means',
    phrases: ['Angular front ends', '.NET 9 back ends', 'real business rules', 'apps people actually use'],
    srPhrases: 'Angular front ends, .NET 9 back ends, real business rules and apps people actually use.',
    seeWork: 'See my work',
    strip1: 'Building with',
    projects: 'projects',
    demos: 'live demos',
    scroll: 'Scroll to explore',
  },
  work: {
    title1: 'Selected',
    title2: 'work',
    intro:
      'Four projects. Each one started from a real problem, from billing a PlayStation lounge by the minute to browsing recipes behind a login.',
    projectOf: 'Project {n} of {total}',
    liveDemo: 'Live demo',
    code: 'Code',
    codeAria: 'Code on GitHub',
    demoLogin: 'Demo login',
    demoLoginAria: 'Demo login for {title}',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    copyField: 'Copy {field}',
    fieldCopied: '{field} copied',
    levelupAria: 'LevelUp devices screen with three running sessions',
    projects: {
      levelup: {
        status: 'Live',
        description:
          'A cashier system for PlayStation lounges: per-minute billing for Single and Multi play, drinks, itemized bills and daily dashboards. Runs online, or offline from a USB stick.',
        tags: ['.NET 9', 'ASP.NET Core MVC', 'EF Core', 'SQLite', 'Arabic RTL'],
        alt: '',
      },
      meals: {
        status: 'Live',
        description:
          'A recipe explorer behind a login. Pick a meal, browse every recipe, preview one in a modal, then open the full page with ingredients and steps.',
        tags: ['Angular 20', 'Signals', 'Route guards', 'RxJS'],
        alt: 'Meals home page with Breakfast, Lunch and Dinner cards',
      },
      'power-fitness': {
        status: 'Live',
        description:
          'A gym management system. Staff manage members, trainers, plans and memberships, schedule sessions, and see live counts of members and sessions on the home page.',
        tags: ['ASP.NET Core MVC', 'EF Core', 'Members', 'Scheduling'],
        alt: 'Power Fitness home page with member and session counts',
      },
      categories: {
        status: 'Shop catalog',
        description:
          'A shop catalog that loads product categories from a REST API, shows each one as an image card, and opens every product inside it.',
        tags: ['REST API', 'DummyJSON', 'Responsive grid'],
        alt: 'Category grid with beauty, fragrances, furniture, groceries and more',
      },
    },
  },
  about: {
    portraitAlt: 'Portrait of Nasr Mohamed',
    name: 'Nasr Mohamed',
    role: 'Full-stack developer',
    kicker: '( About )',
    // The middle part is highlighted.
    text: [
      'I like the moment when messy business rules turn into',
      'clean, layered code',
      'that a cashier or a hungry visitor can use without thinking about it.',
    ],
    facts: [
      ['Front end', 'Angular 20 · Signals · RxJS'],
      ['Back end', 'ASP.NET Core 9 · Identity'],
      ['Architecture', '3 layers · Unit of Work'],
      ['Data', 'EF Core · SQLite'],
    ],
  },
  numbers: ['projects on GitHub', 'live demos you can open now', "layers in LevelUp's architecture"],
  process: {
    title1: 'How I',
    title2: 'build',
    intro: 'Three habits you can see in the code of every project above.',
    cards: [
      {
        title: 'Rules live in code, not in heads.',
        body: "LevelUp bills every started minute, keeps each segment's rate and skips paused time. All of it is one tested calculator.",
      },
      {
        title: 'Thin controllers, clear layers.',
        body: 'Presentation, business logic and data each depend only on the layer below. Services return a Result instead of throwing.',
      },
      {
        title: "If it's not live, it's not done.",
        body: 'Meals and Categories run on GitHub Pages, LevelUp and Power Fitness run on real servers. A link you can click beats a screenshot.',
      },
    ],
  },
  stack: {
    title: 'Toolbox',
    labels: ['Front end', 'Back end', 'Data', 'Ship'],
  },
  contact: {
    kicker: '( Contact )',
    bigAria: "Let's build something.",
    line1: "Let's build",
    line2: 'something',
    emailMe: 'Email me',
    copy: 'Copy email',
    copied: 'Copied',
    selected: 'Selected, press Ctrl+C',
    cv: 'Download CV',
  },
  footer: {
    copy: '© 2026 Nasr Mohamed',
    elsewhere: 'Elsewhere',
    top: 'Back to top ↑',
    giant: 'Nasr Mohamed',
  },
};

export type Dict = typeof en;
