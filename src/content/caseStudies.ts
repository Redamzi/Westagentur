import type { Lang } from '../seo/site';

export interface CaseStudy {
  slug: string;
  path: string;
  client: string;
  title: string;
  /** H1 of the case study page. */
  headline: string;
  description: string;
  teaser: string;
  tags: string[];
  situation: string[];
  solution: { title: string; text: string }[];
  /** Optional list, e.g. the automations of a platform. */
  features?: { title: string; items: string[] };
  result: string[];
  highlights: { value: string; label: string }[];
  /** Matching service page for the second button. */
  service: { path: string; label: string };
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
    headline: 'Aus einem Arbeitstag Disposition werden wenige Minuten Kontrolle',
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
    service: { path: '/ki-automatisierung', label: 'KI-Automatisierung' },
  },
  {
    slug: 'direktverteilung',
    path: '/referenzen/direktverteilung',
    client: 'Direktverteilung.com',
    title: 'Fallstudie: Direktverteilung – Plattform für Flyerverteilung | Westagentur',
    headline: 'Werbeverteilung, die einfach, planbar und nachweisbar ist',
    description:
      'Wie eine Online-Plattform Auftraggeber und geprüfte Verteilagenturen zusammenbringt: Gebietsplanung per Karte, Angebote auf Knopfdruck, GPS-Live-Nachweis und sichere Abwicklung.',
    teaser:
      'Eine Plattform, die Auftraggeber mit geprüften Verteilagenturen in ihrer Region zusammenbringt – von der Gebietsplanung über Angebote und Live-Nachweis bis zur Abrechnung, alles an einem Ort.',
    tags: ['Plattform', 'Webentwicklung', 'Automatisierung'],
    situation: [
      'Wer Flyer, Prospekte oder Werbesendungen an Haushalte verteilen lassen möchte, steht vor denselben Fragen: Welche Gebiete erreichen meine Zielgruppe? Wie hoch muss die Auflage sein? Und vor allem: Welcher Verteiler ist seriös – und kommt die Werbung wirklich an?',
      'Die Suche nach passenden Agenturen, das Einholen von Angeboten und der fehlende Nachweis machten Haushaltswerbung bisher aufwendig und schwer planbar. Direktverteilung nimmt Auftraggebern genau diese Arbeit ab.',
    ],
    solution: [
      {
        title: '1. Gebiet planen',
        text: 'Mit einem intelligenten Werbeplaner wählt der Kunde seine Zielgebiete per Postleitzahl auf einer Karte aus. Eine automatische Zonen- und Haushaltsanalyse zeigt Reichweite und empfohlene Auflage.',
      },
      {
        title: '2. Angebote erhalten',
        text: 'Passende Agenturen in der Region werden automatisch benachrichtigt und geben ihr Angebot ab. Der Kunde vergleicht und bucht online.',
      },
      {
        title: '3. Live-Nachweis',
        text: 'Während der Verteilung sieht der Kunde den Fortschritt in Echtzeit über GPS-Tracking sowie eine Foto-Dokumentation – der transparente Nachweis, dass die Werbung ankommt.',
      },
      {
        title: '4. Sichere Abwicklung',
        text: 'Zahlung und Kommunikation laufen geschützt über die Plattform. Die Auszahlung an die Agentur erfolgt nach Abschluss – mit einem fairen Reklamations- und Ausgleichsverfahren, falls einmal etwas nicht passt.',
      },
    ],
    features: {
      title: 'Automatisierung & Komfort',
      items: [
        'Automatische Gebiets- und Reichweitenanalyse auf Knopfdruck',
        'Automatischer Angebots- und Benachrichtigungsprozess zwischen Kunde und Agentur',
        'Live-Tracking und Foto-Nachweis der laufenden Verteilung',
        'Automatisierte, sichere Zahlungs- und Auszahlungsabwicklung',
        'Integriertes Nachrichtensystem für die direkte Abstimmung – ohne dass Kontaktdaten offengelegt werden',
      ],
    },
    result: [
      'Werbeverteilung wird einfach, planbar und nachweisbar. Auftraggeber müssen nicht mehr selbst nach seriösen Verteilern suchen – passende Agenturen melden sich mit ihrem Angebot.',
      'Live-Nachweise per GPS und Foto schaffen Vertrauen, und die gesamte Zusammenarbeit wird fair und transparent über eine einzige Plattform abgewickelt.',
    ],
    highlights: [
      { value: '4 Schritte', label: 'von der Gebietsplanung bis zum Nachweis' },
      { value: 'Live', label: 'GPS-Tracking und Foto-Dokumentation' },
      { value: '1 Plattform', label: 'für Planung, Angebote, Zahlung und Kommunikation' },
    ],
    service: { path: '/webdesign', label: 'Webdesign & Plattformen' },
  },
];

export const findCaseStudy = (slug: string) => CASE_STUDIES.find((c) => c.slug === slug);
