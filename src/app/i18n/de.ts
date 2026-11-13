import { Dict } from './en';

// Deutsch. Technologienamen bleiben unverändert.

export const de: Dict = {
  meta: {
    title: 'Nasr Mohamed — Full-Stack-Entwickler',
    description:
      'Nasr Mohamed ist Full-Stack-Entwickler und baut Frontends mit Angular 20 und Backends mit ASP.NET Core (.NET 9). Live-Projekte: LevelUp, Meals, Power Fitness und Categories.',
  },
  common: {
    newTab: '(öffnet in neuem Tab)',
    skip: 'Zum Inhalt springen',
    cvAria: 'Lebenslauf herunterladen (PDF)',
  },
  loader: { aria: 'Portfolio wird geladen' },
  cursor: { view: 'Ansehen' },
  nav: {
    logoAria: 'Nasr Mohamed, zurück nach oben',
    sectionsAria: 'Bereiche',
    work: 'Projekte',
    about: 'Über mich',
    process: 'Ablauf',
    stack: 'Stack',
    contact: 'Kontakt',
    themeAria: 'Farbschema',
    themes: { aurora: 'Farbschema Aurora', ember: 'Farbschema Ember', paper: 'Farbschema Paper' },
    langAria: 'Sprache',
  },
  hero: {
    role: '( Full-Stack-Entwickler )',
    status: 'Offen für neue Jobs',
    nameAria: 'Nasr Mohamed',
    first: 'Nasr',
    last: 'Mohamed',
    lede1: 'Ich baue Web-Apps von A bis Z.',
    lede2: 'Im Moment heißt das',
    phrases: ['Angular-Frontends', '.NET-9-Backends', 'echte Geschäftsregeln', 'Apps, die man wirklich nutzt'],
    srPhrases: 'Angular-Frontends, .NET-9-Backends, echte Geschäftsregeln und Apps, die man wirklich nutzt.',
    seeWork: 'Meine Projekte',
    strip1: 'Ich arbeite mit',
    projects: 'Projekte',
    demos: 'Live-Demos',
    scroll: 'Scrollen und entdecken',
  },
  work: {
    title1: 'Meine',
    title2: 'Arbeit',
    intro:
      'Vier Projekte. Jedes begann mit einem echten Problem: von der minutengenauen Abrechnung einer PlayStation-Lounge bis zum Stöbern in Rezepten hinter einem Login.',
    projectOf: 'Projekt {n} von {total}',
    liveDemo: 'Live-Demo',
    code: 'Code',
    codeAria: 'Code auf GitHub',
    demoLogin: 'Demo-Zugang',
    demoLoginAria: 'Demo-Zugang für {title}',
    username: 'Benutzername',
    email: 'E-Mail',
    password: 'Passwort',
    copyField: '{field} kopieren',
    fieldCopied: '{field} kopiert',
    levelupAria: 'LevelUp-Geräteansicht mit drei laufenden Sitzungen',
    projects: {
      levelup: {
        status: 'Live',
        description:
          'Ein Kassensystem für PlayStation-Lounges: minutengenaue Abrechnung für Single- und Multiplayer, Getränke, detaillierte Rechnungen und Tages-Dashboards. Läuft online oder offline vom USB-Stick.',
        tags: ['.NET 9', 'ASP.NET Core MVC', 'EF Core', 'SQLite', 'Arabisch RTL'],
        alt: '',
      },
      meals: {
        status: 'Live',
        description:
          'Ein Rezept-Explorer hinter einem Login. Mahlzeit wählen, alle Rezepte durchsehen, eines im Modal ansehen und dann die ganze Seite mit Zutaten und Schritten öffnen.',
        tags: ['Angular 20', 'Signals', 'Route guards', 'RxJS'],
        alt: 'Startseite von Meals mit Karten für Frühstück, Mittag- und Abendessen',
      },
      'power-fitness': {
        status: 'Live',
        description:
          'Ein Verwaltungssystem für Fitnessstudios. Mitarbeitende verwalten Mitglieder, Trainer, Tarife und Mitgliedschaften, planen Kurse und sehen auf der Startseite live, wie viele Mitglieder und Kurse es gibt.',
        tags: ['ASP.NET Core MVC', 'EF Core', 'Mitglieder', 'Terminplanung'],
        alt: 'Startseite von Power Fitness mit Zahlen zu Mitgliedern und Kursen',
      },
      categories: {
        status: 'Shop-Katalog',
        description:
          'Ein Shop-Katalog, der Produktkategorien aus einer REST API lädt, jede als Bildkarte zeigt und alle Produkte darin öffnet.',
        tags: ['REST API', 'DummyJSON', 'Responsives Grid'],
        alt: 'Kategorieraster mit Beauty, Düften, Möbeln, Lebensmitteln und mehr',
      },
    },
  },
  about: {
    portraitAlt: 'Porträt von Nasr Mohamed',
    name: 'Nasr Mohamed',
    role: 'Full-Stack-Entwickler',
    kicker: '( Über mich )',
    text: [
      'Ich mag den Moment, in dem chaotische Geschäftsregeln zu',
      'sauberem, geschichtetem Code',
      'werden, den ein Kassierer oder ein hungriger Besucher nutzt, ohne darüber nachzudenken.',
    ],
    facts: [
      ['Frontend', 'Angular 20 · Signals · RxJS'],
      ['Backend', 'ASP.NET Core 9 · Identity'],
      ['Architektur', '3 Schichten · Unit of Work'],
      ['Daten', 'EF Core · SQLite'],
    ],
  },
  numbers: ['Projekte auf GitHub', 'Live-Demos, die du jetzt öffnen kannst', 'Schichten in der Architektur von LevelUp'],
  process: {
    title1: 'Wie ich',
    title2: 'baue',
    intro: 'Drei Gewohnheiten, die man im Code jedes Projekts oben sieht.',
    cards: [
      {
        title: 'Regeln gehören in den Code, nicht in Köpfe.',
        body: 'LevelUp rechnet jede angefangene Minute ab, merkt sich den Tarif jedes Abschnitts und lässt Pausen weg. Alles in einem getesteten Rechner.',
      },
      {
        title: 'Schlanke Controller, klare Schichten.',
        body: 'Präsentation, Geschäftslogik und Daten hängen jeweils nur von der Schicht darunter ab. Services geben ein Result zurück, statt Exceptions zu werfen.',
      },
      {
        title: 'Was nicht live ist, ist nicht fertig.',
        body: 'Meals und Categories laufen auf GitHub Pages, LevelUp und Power Fitness auf echten Servern. Ein Link zum Anklicken schlägt jeden Screenshot.',
      },
    ],
  },
  stack: {
    title: 'Toolbox',
    labels: ['Frontend', 'Backend', 'Daten', 'Deployment'],
  },
  contact: {
    kicker: '( Kontakt )',
    bigAria: 'Lass uns etwas bauen.',
    line1: 'Lass uns',
    line2: 'etwas bauen',
    emailMe: 'Schreib mir',
    copy: 'E-Mail kopieren',
    copied: 'Kopiert',
    selected: 'Markiert, drücke Strg+C',
    cv: 'Lebenslauf',
  },
  footer: {
    copy: '© 2026 Nasr Mohamed',
    elsewhere: 'Woanders',
    top: 'Nach oben ↑',
    giant: 'Nasr Mohamed',
  },
};
