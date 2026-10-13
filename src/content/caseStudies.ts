import type { Lang } from '../seo/site';

export interface CaseStudy {
  slug: string;
  path: string;
  client: string;
  title: string;
  description: string;
  teaser: string;
  tags: string[];
  situation: string[];
  solution: { title: string; text: string }[];
  result: string[];
  highlights: { value: string; label: string }[];
}

export const CASE_UI: Record<Lang, { label: string; situation: string; solution: string; result: string; cta: string; read: string; back: string }> = {
  de: {
    label: 'Fallstudie',
    situation: 'Ausgangslage',
    solution: 'Die Lösung',
    result: 'Das Ergebnis',
    cta: 'Ähnliches Projekt besprechen',
    read: 'Fallstudie lesen',
    back: 'Alle Referenzen',
  },
  en: {
    label: 'Case study',
    situation: 'The challenge',
    solution: 'The solution',
    result: 'The result',
    cta: 'Discuss a similar project',
    read: 'Read case study',
    back: 'All references',
  },
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'mani-werbedienste',
    path: '/referenzen/mani-werbedienste',
    client: 'Mani Werbedienste GmbH',
    title: 'Fallstudie: Automatisierte Tourenplanung für Mani Werbedienste | Westagentur',
    description:
      'Wie ein selbst entwickeltes Portal die Disposition für rund tausend Verteilbezirke automatisiert: aus einem Arbeitstag Planung werden wenige Minuten Kontrolle.',
    teaser:
      'Ein Portal, das Aufträge selbständig erkennt, Unterlagen prüft und Agenturen, Fahrern und Depots genau ihren Teil liefert. Aus einem Arbeitstag Disposition werden wenige Minuten Kontrolle.',
    tags: ['KI-Automatisierung', 'Prozessautomatisierung', 'Portal'],
    situation: [
      'Die Mani Werbedienste GmbH verteilt Prospekte und Zeitungen im Auftrag großer Werbekunden. Zu jedem Verteiltag trifft ein umfangreiches Auftragspaket ein – mit rund tausend einzelnen Verteilbezirken, verteilt auf dutzende Touren, dazu Straßenverzeichnisse und Kartenmaterial für jeden Bezirk.',
      'Die gesamte Planung entstand bisher in Handarbeit: Welcher Bezirk geht an welche Verteilagentur? Welcher Fahrer übernimmt welche Tour? Wer beliefert welches Depot? Bei jedem neuen Verteiltag begann diese Arbeit von vorn.',
    ],
    solution: [
      {
        title: 'Aufträge werden selbständig erkannt',
        text: 'Das System prüft den Posteingang regelmäßig und verarbeitet ausschließlich Sendungen freigegebener Auftraggeber – alles andere wird zur Prüfung vorgelegt statt blind ausgeführt.',
      },
      {
        title: 'Unterlagen werden automatisch ausgewertet',
        text: 'Mengen, Bezirke, Straßen und Hausnummern werden erfasst und gegen die Vorgaben des Auftraggebers geprüft. Stimmt eine Angabe nicht, meldet das System den Fehler, statt ihn weiterzureichen.',
      },
      {
        title: 'Die Zuordnung wird vorbereitet',
        text: 'Bezirke werden nach Orten gruppiert und der zuständigen Verteilagentur zugeschlagen. Wiederkehrende Aufträge greifen auf die gespeicherte Planung zurück – nur Abweichungen brauchen noch eine Entscheidung.',
      },
      {
        title: 'Jeder bekommt genau seinen Teil',
        text: 'Agenturen erhalten ihre Bezirke mit den passenden Straßenlisten und Kartenausschnitten, Fahrer ihre Tour mit Ladeliste und Anlieferstellen, Depots ihre Mengen und Zeitfenster.',
      },
      {
        title: 'Reklamationen sind in Sekunden geklärt',
        text: 'Eine Adresse genügt, um Bezirk, zuständige Agentur und Verteildatum zu bestimmen.',
      },
    ],
    result: [
      'Aus einem Arbeitstag Disposition werden wenige Minuten Kontrolle. Jede Zuteilung ist dokumentiert und belegbar.',
      'Und weil das System jede Sendung gegen die Vorgaben prüft, fallen Fehler auf, bevor sie beim Kunden ankommen – nicht erst durch eine Beschwerde.',
    ],
    highlights: [
      { value: '~1.000', label: 'Verteilbezirke je Verteiltag' },
      { value: 'Minuten', label: 'statt eines Arbeitstags Disposition' },
      { value: '100 %', label: 'der Zuteilungen dokumentiert' },
    ],
  },
];

export const findCaseStudy = (slug: string) => CASE_STUDIES.find((c) => c.slug === slug);
