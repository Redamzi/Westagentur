import type { Lang } from '../seo/site';

export type ServiceKey = 'webdesign' | 'automation' | 'telephony';

export interface ServiceContent {
  path: string;
  navLabel: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  benefits: { title: string; desc: string }[];
  packages?: { name: string; price: string; minPrice: number; desc: string }[];
  priceNote: string;
  steps: { title: string; desc: string }[];
  faq: { q: string; a: string }[];
  demo?: boolean;
}

export const SERVICE_KEYS: ServiceKey[] = ['webdesign', 'automation', 'telephony'];

export const SERVICE_UI: Record<Lang, {
  home: string;
  benefits: string;
  packages: string;
  pricingIndividual: string;
  process: string;
  faq: string;
  cta: string;
  demo: string;
  more: string;
}> = {
  de: {
    home: 'Start',
    benefits: 'Ihre Vorteile',
    packages: 'Pakete & Preise',
    pricingIndividual: 'Individuell nach kostenlosem Check',
    process: 'So läuft es ab',
    faq: 'Häufige Fragen',
    cta: 'Kostenloses Erstgespräch',
    demo: 'Jetzt live testen',
    more: 'Mehr erfahren',
  },
  en: {
    home: 'Home',
    benefits: 'Your benefits',
    packages: 'Packages & pricing',
    pricingIndividual: 'Individual quote after a free check',
    process: 'How it works',
    faq: 'Frequently asked questions',
    cta: 'Free consultation',
    demo: 'Try it live',
    more: 'Learn more',
  },
};

export const SERVICES: Record<Lang, Record<ServiceKey, ServiceContent>> = {
  de: {
    webdesign: {
      path: '/webdesign',
      navLabel: 'Webdesign',
      title: 'Webdesign für den Mittelstand | Westagentur Hamm',
      description:
        'Schnelle, conversion-starke Websites für KMU – individuell entwickelt, SEO-optimiert und DSGVO-konform. Starter ab 1.500 €, Pro ab 3.200 €.',
      h1: 'Webdesign für den Mittelstand',
      intro:
        'Wir entwickeln Websites, die nicht nur gut aussehen, sondern Anfragen bringen: schnell geladen, klar strukturiert, auf jedem Gerät stark und von Anfang an für Google optimiert.',
      benefits: [
        { title: 'Individuelles Design', desc: 'Keine Baukasten-Vorlage – Ihr Auftritt wird auf Marke, Zielgruppe und Angebot zugeschnitten.' },
        { title: 'Performance', desc: 'Schlanker Code und optimierte Bilder für kurze Ladezeiten und gute Core Web Vitals.' },
        { title: 'SEO von Anfang an', desc: 'Saubere Struktur, Meta-Daten, strukturierte Daten und Sitemap – technisch bereit für Google.' },
        { title: 'Conversion-Fokus', desc: 'Klare Handlungsaufforderungen, Kontaktformular und Terminbuchung, damit aus Besuchern Anfragen werden.' },
        { title: 'DSGVO & Barrierefreiheit', desc: 'Rechtssichere Umsetzung, selbst gehostete Schriften und Bedienbarkeit nach WCAG.' },
        { title: 'Hosting & Wartung', desc: 'Auf Wunsch übernehmen wir Hosting, Updates, Backups und Weiterentwicklung.' },
      ],
      packages: [
        { name: 'Starter', price: 'ab 1.500 €', minPrice: 1500, desc: 'Professioneller Onepager oder kompakte Website für einen schnellen, sauberen Auftritt.' },
        { name: 'Pro', price: 'ab 3.200 €', minPrice: 3200, desc: 'Mehrseitige Website mit individuellem Design, SEO-Struktur und Anbindung von Formularen oder Automatisierungen.' },
      ],
      priceNote: 'Den genauen Umfang und Preis klären wir im kostenlosen Erstgespräch.',
      steps: [
        { title: 'Erstgespräch & Analyse', desc: 'Wir klären Ziele, Zielgruppe und Umfang.' },
        { title: 'Konzept & Design', desc: 'Struktur, Inhalte und Design werden mit Ihnen abgestimmt.' },
        { title: 'Entwicklung', desc: 'Umsetzung mit Fokus auf Performance, SEO und Datenschutz.' },
        { title: 'Launch & Betreuung', desc: 'Go-live, Einrichtung bei Google und auf Wunsch laufende Betreuung.' },
      ],
      faq: [
        { q: 'Wie lange dauert ein Webdesign-Projekt?', a: 'In der Regel 4–8 Wochen, abhängig vom Umfang und davon, wie schnell Inhalte vorliegen.' },
        { q: 'Was kostet eine Website?', a: 'Das Starter-Paket beginnt bei 1.500 €, das Pro-Paket bei 3.200 €. Nach dem Erstgespräch erhalten Sie ein konkretes Angebot.' },
        { q: 'Übernehmen Sie auch bestehende Websites?', a: 'Ja. Wir analysieren Ihre aktuelle Seite und modernisieren sie oder bauen sie gezielt neu auf.' },
      ],
    },
    automation: {
      path: '/ki-automatisierung',
      navLabel: 'KI-Automatisierung',
      title: 'KI-Automatisierung für KMU | Prozesse automatisieren',
      description:
        'Weniger Handarbeit, schnellere Abläufe: Wir automatisieren Anfragen, Angebote, Follow-ups und CRM-Prozesse mit KI – individuell für den Mittelstand.',
      h1: 'KI-Automatisierung für den Mittelstand',
      intro:
        'Wiederkehrende Aufgaben kosten Zeit. Wir automatisieren Ihre Abläufe – von der ersten Anfrage über Angebot und Termin bis zum Follow-up – und verbinden sie mit Ihren bestehenden Systemen.',
      benefits: [
        { title: 'Lead-Erfassung', desc: 'Anfragen aus Website, Telefon und E-Mail landen automatisch und vollständig an einem Ort.' },
        { title: 'Automatische Angebote', desc: 'Aus wenigen Angaben entsteht ein fertiges Angebot – ohne Copy & Paste.' },
        { title: 'Follow-ups & Erinnerungen', desc: 'Kein Interessent geht verloren: Nachfassen und Terminerinnerungen laufen von selbst.' },
        { title: 'Tool-Anbindung', desc: 'Wir verbinden CRM, Kalender, E-Mail und Ihre Fachsoftware zu einem durchgängigen Prozess.' },
        { title: 'Auswertungen', desc: 'Klare Zahlen zu Anfragen, Abschlussquote und Bearbeitungszeit.' },
        { title: 'Eigene Entwicklung', desc: 'Individuell programmiert statt Abo-Baukasten – Sie behalten die Kontrolle über Ihre Daten.' },
      ],
      priceNote: 'Im kostenlosen Automatisierungs-Check analysieren wir Ihre Abläufe und zeigen, was sich lohnt – mit konkretem Angebot.',
      steps: [
        { title: 'Automatisierungs-Check', desc: 'Wir analysieren Ihre Abläufe und finden die größten Zeitfresser.' },
        { title: 'Konzept', desc: 'Sie erhalten einen klaren Plan mit Aufwand und Nutzen.' },
        { title: 'Umsetzung', desc: 'Wir entwickeln und testen die Automatisierung in Ihrer Umgebung.' },
        { title: 'Optimierung', desc: 'Wir messen die Ergebnisse und verbessern laufend.' },
      ],
      faq: [
        { q: 'Welche Prozesse lassen sich automatisieren?', a: 'Typisch sind Anfragen, Terminvereinbarungen, Angebotserstellung, Erinnerungen, Datenübertragung zwischen Tools und Reporting.' },
        { q: 'Brauche ich dafür neue Software?', a: 'Meist nicht. Wir bauen auf Ihren vorhandenen Systemen auf und ergänzen nur, was fehlt.' },
        { q: 'Was kostet KI-Automatisierung?', a: 'Das hängt vom Prozess ab. Nach dem kostenlosen Check erhalten Sie ein individuelles Angebot.' },
      ],
    },
    telephony: {
      path: '/ki-telefonie',
      navLabel: 'KI-Telefonie',
      title: 'KI-Telefonie für Unternehmen | 24/7 erreichbar',
      description:
        'Ihr KI-Telefonassistent nimmt Anrufe an, beantwortet Fragen, qualifiziert Interessenten und vereinbart Termine – rund um die Uhr. Jetzt live testen.',
      h1: 'KI-Telefonie für Unternehmen',
      intro:
        'Verpasste Anrufe sind verlorene Aufträge. Unser KI-Telefonassistent nimmt Anrufe an, beantwortet häufige Fragen, qualifiziert Interessenten und vereinbart Termine – in natürlicher Sprache und rund um die Uhr.',
      benefits: [
        { title: '24/7 erreichbar', desc: 'Auch abends, am Wochenende und an Feiertagen geht kein Anruf verloren.' },
        { title: 'Natürliche Gespräche', desc: 'Der Assistent versteht Anliegen und antwortet flüssig auf Deutsch.' },
        { title: 'Terminvereinbarung', desc: 'Termine werden direkt im Gespräch vereinbart und bestätigt.' },
        { title: 'Lead-Qualifizierung', desc: 'Die wichtigsten Fragen werden gestellt, bevor Sie zurückrufen.' },
        { title: 'Zusammenfassung', desc: 'Jedes Gespräch landet als kurze Zusammenfassung bei Ihnen.' },
        { title: 'Entlastung', desc: 'Ihr Team konzentriert sich auf Kunden statt auf Routine-Anrufe.' },
      ],
      priceNote: 'Der Preis hängt von Gesprächsvolumen und Anbindungen ab. Nach dem kostenlosen Check erhalten Sie ein konkretes Angebot.',
      steps: [
        { title: 'Check', desc: 'Wir klären typische Anrufe, Fragen und Ziele.' },
        { title: 'Einrichtung', desc: 'Stimme, Wissen und Gesprächsablauf werden auf Ihr Unternehmen abgestimmt.' },
        { title: 'Anbindung', desc: 'Kalender, E-Mail und CRM werden verbunden.' },
        { title: 'Live & Optimierung', desc: 'Wir werten Gespräche aus und verbessern den Assistenten laufend.' },
      ],
      faq: [
        { q: 'Wissen Anrufer, dass sie mit einer KI sprechen?', a: 'Ja. Der Assistent stellt sich transparent als KI-Assistent vor.' },
        { q: 'Was passiert bei komplexen Anliegen?', a: 'Der Assistent nimmt einen Rückrufwunsch auf oder leitet an Sie bzw. Ihr Team weiter.' },
        { q: 'Kann ich das vorher testen?', a: 'Ja – direkt auf dieser Seite im Browser oder in einem kostenlosen Erstgespräch.' },
      ],
      demo: true,
    },
  },
  en: {
    webdesign: {
      path: '/en/web-design',
      navLabel: 'Web design',
      title: 'Web Design for SMEs | Westagentur',
      description:
        'Fast, conversion-focused websites for small and medium-sized businesses – custom built, SEO-optimised and GDPR-compliant. Starter from €1,500, Pro from €3,200.',
      h1: 'Web design for SMEs',
      intro:
        'We build websites that do more than look good – they generate enquiries: fast, clearly structured, strong on every device and optimised for Google from day one.',
      benefits: [
        { title: 'Custom design', desc: 'No template – your website is tailored to your brand, audience and offer.' },
        { title: 'Performance', desc: 'Lean code and optimised images for fast loading and good Core Web Vitals.' },
        { title: 'SEO from the start', desc: 'Clean structure, meta data, structured data and sitemap – technically ready for Google.' },
        { title: 'Conversion focus', desc: 'Clear calls to action, contact form and booking so visitors become enquiries.' },
        { title: 'GDPR & accessibility', desc: 'Compliant implementation, self-hosted fonts and WCAG-friendly usability.' },
        { title: 'Hosting & maintenance', desc: 'On request we take care of hosting, updates, backups and further development.' },
      ],
      packages: [
        { name: 'Starter', price: 'from €1,500', minPrice: 1500, desc: 'Professional one-pager or compact website for a fast, clean presence.' },
        { name: 'Pro', price: 'from €3,200', minPrice: 3200, desc: 'Multi-page website with custom design, SEO structure and integrated forms or automations.' },
      ],
      priceNote: 'We clarify the exact scope and price in a free initial consultation.',
      steps: [
        { title: 'Consultation & analysis', desc: 'We clarify goals, audience and scope.' },
        { title: 'Concept & design', desc: 'Structure, content and design are agreed with you.' },
        { title: 'Development', desc: 'Built with a focus on performance, SEO and privacy.' },
        { title: 'Launch & support', desc: 'Go-live, Google setup and ongoing support on request.' },
      ],
      faq: [
        { q: 'How long does a web design project take?', a: 'Usually 4–8 weeks, depending on scope and how quickly content is available.' },
        { q: 'How much does a website cost?', a: 'The Starter package starts at €1,500, the Pro package at €3,200. After the consultation you receive a concrete quote.' },
        { q: 'Do you take over existing websites?', a: 'Yes. We analyse your current site and modernise or rebuild it.' },
      ],
    },
    automation: {
      path: '/en/ai-automation',
      navLabel: 'AI automation',
      title: 'AI Automation for SMEs | Automate Your Processes',
      description:
        'Less manual work, faster processes: we automate enquiries, quotes, follow-ups and CRM workflows with AI – tailored to small and medium-sized businesses.',
      h1: 'AI automation for SMEs',
      intro:
        'Repetitive tasks cost time. We automate your workflows – from the first enquiry to quote, appointment and follow-up – and connect them with your existing systems.',
      benefits: [
        { title: 'Lead capture', desc: 'Enquiries from website, phone and email land automatically and completely in one place.' },
        { title: 'Automatic quotes', desc: 'A few details turn into a finished quote – no copy and paste.' },
        { title: 'Follow-ups & reminders', desc: 'No lead gets lost: follow-ups and appointment reminders run on their own.' },
        { title: 'Tool integration', desc: 'We connect CRM, calendar, email and your business software into one process.' },
        { title: 'Reporting', desc: 'Clear numbers on enquiries, conversion rate and processing time.' },
        { title: 'Custom development', desc: 'Individually built instead of subscription tools – you stay in control of your data.' },
      ],
      priceNote: 'In a free automation check we analyse your workflows and show what pays off – with a concrete quote.',
      steps: [
        { title: 'Automation check', desc: 'We analyse your workflows and find the biggest time sinks.' },
        { title: 'Concept', desc: 'You get a clear plan with effort and benefit.' },
        { title: 'Implementation', desc: 'We build and test the automation in your environment.' },
        { title: 'Optimisation', desc: 'We measure results and keep improving.' },
      ],
      faq: [
        { q: 'Which processes can be automated?', a: 'Typically enquiries, appointment booking, quotes, reminders, data transfer between tools and reporting.' },
        { q: 'Do I need new software?', a: 'Usually not. We build on your existing systems and only add what is missing.' },
        { q: 'How much does AI automation cost?', a: 'It depends on the process. After the free check you receive an individual quote.' },
      ],
    },
    telephony: {
      path: '/en/ai-telephony',
      navLabel: 'AI telephony',
      title: 'AI Telephony for Businesses | Available 24/7',
      description:
        'Your AI phone assistant answers calls, responds to questions, qualifies leads and books appointments – around the clock. Try it live now.',
      h1: 'AI telephony for businesses',
      intro:
        'Missed calls are lost orders. Our AI phone assistant answers calls, responds to common questions, qualifies prospects and books appointments – in natural language, around the clock.',
      benefits: [
        { title: 'Available 24/7', desc: 'No call is lost – evenings, weekends and holidays included.' },
        { title: 'Natural conversations', desc: 'The assistant understands requests and answers fluently.' },
        { title: 'Appointment booking', desc: 'Appointments are booked and confirmed during the call.' },
        { title: 'Lead qualification', desc: 'Key questions are asked before you call back.' },
        { title: 'Call summary', desc: 'Every call reaches you as a short summary.' },
        { title: 'Relief for your team', desc: 'Your team focuses on customers instead of routine calls.' },
      ],
      priceNote: 'Pricing depends on call volume and integrations. After the free check you receive a concrete quote.',
      steps: [
        { title: 'Check', desc: 'We clarify typical calls, questions and goals.' },
        { title: 'Setup', desc: 'Voice, knowledge and call flow are tailored to your business.' },
        { title: 'Integration', desc: 'Calendar, email and CRM are connected.' },
        { title: 'Live & optimisation', desc: 'We review calls and keep improving the assistant.' },
      ],
      faq: [
        { q: 'Do callers know they are talking to an AI?', a: 'Yes. The assistant transparently introduces itself as an AI assistant.' },
        { q: 'What happens with complex requests?', a: 'The assistant records a callback request or forwards the call to you or your team.' },
        { q: 'Can I test it first?', a: 'Yes – right here in your browser or in a free consultation.' },
      ],
      demo: true,
    },
  },
};
