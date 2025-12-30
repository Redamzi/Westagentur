
import React from 'react';

export interface PricingPackage {
    name: string;
    price: string;
    recommended?: boolean;
    features: string[];
}

export interface FAQItem {
    category: string;
    question: string;
    answer: string;
}

export interface ServiceData {
    title: string;
    subtitle: string;
    heroText: string;
    content: string;
    features: { title: string; desc: string }[];
}

export const FAQS: FAQItem[] = [
    {
        category: "Kosten",
        question: "Wie viel kostet eine professionelle Website für ein kleines Unternehmen?",
        answer: "Die Kosten für eine professionelle Website für kleine Unternehmen (KMU) liegen in der Regel zwischen 1.500 € und 5.000 € für ein suchmaschinenoptimiertes Basis-Paket. Der Preis hängt stark vom Funktionsumfang, der Anzahl der Unterseiten und der Notwendigkeit von individuellem Design oder Content-Erstellung ab. Viele Agenturen bieten Festpreise an, um Ihnen volle Kostentransparenz zu garantieren."
    },
    {
        category: "Prozess",
        question: "Wie lange dauert der Prozess von der Beauftragung bis zum Go-Live meiner neuen Website?",
        answer: "Der gesamte Prozess von der ersten Konzeption bis zum Go-Live einer professionellen KMU-Website dauert bei einer effizienten Agentur in der Regel 4 bis 6 Wochen. Dies beinhaltet die Strategiephase, das Design, die technische Umsetzung, die Content-Integration und die abschließende SEO-Optimierung. Die Dauer kann sich verlängern, wenn die Content-Lieferung durch den Kunden verzögert wird."
    },
    {
        category: "Technologie",
        question: "Welches CMS (WordPress, Joomla, Typo3) ist das beste für mein KMU?",
        answer: "Für die meisten kleinen und mittelständischen Unternehmen (KMU) ist WordPress das beste Content-Management-System (CMS). Es bietet die größte Flexibilität, eine intuitive Bedienung für die Selbstpflege der Inhalte und die beste Basis für Suchmaschinenoptimierung (SEO). Größere Unternehmen mit komplexen Datenstrukturen bevorzugen oft TYPO3."
    },
    {
        category: "Recht",
        question: "Ist das Webdesign DSGVO-konform und barrierefrei?",
        answer: "Ein professionelles Webdesign muss zwingend DSGVO-konform sein, was die korrekte Einbindung von Cookie-Bannern, Datenschutzerklärungen und die rechtskonforme Verarbeitung von Nutzerdaten einschließt. Barrierefreiheit (nach WCAG 2.1) ist für viele KMU zwar noch nicht gesetzlich vorgeschrieben, wird aber für ein hohes Maß an Nutzerfreundlichkeit und als wichtiges EEAT-Signal dringend empfohlen."
    },
    {
        category: "Information",
        "question": "Was ist Responsive Webdesign und warum ist es für KMU wichtig?",
        answer: "Responsive Webdesign ist eine Technik, die sicherstellt, dass sich das Layout Ihrer Website automatisch an die Bildschirmgröße des Endgeräts (Smartphone, Tablet, Desktop) anpasst. Dies ist für KMU essenziell, da über 60% des gesamten Webtraffics mobil erfolgt. Google bewertet die mobile Nutzerfreundlichkeit zudem als einen der wichtigsten Rankingfaktoren."
    },
    {
        category: "Entscheidung",
        question: "Webdesign Agentur oder Freelancer: Was ist die bessere Wahl für mein kleines Unternehmen?",
        answer: "Eine Webdesign Agentur ist für kleine Unternehmen (KMU) oft die bessere Wahl, da sie ein komplettes Team aus Designern, Entwicklern, SEO-Experten und Textern bietet. Dies gewährleistet eine höhere Qualität, eine schnellere Umsetzung und eine umfassende Abdeckung aller relevanten Bereiche (Technik, Design, SEO, Recht). Ein Freelancer ist meist günstiger, bietet aber selten die gleiche Bandbreite an Expertise."
    }
];

export const PRICING: PricingPackage[] = [
    {
        name: "Starter",
        price: "1.500€",
        features: [
            "Individuelles Design",
            "Responsive für Smartphone & Tablet",
            "Bis zu 5 Unterseiten",
            "Basis SEO-Optimierung",
            "DSGVO-konform",
            "4 Wochen Lieferzeit"
        ]
    },
    {
        name: "Professional",
        price: "3.200€",
        recommended: true,
        features: [
            "Premium Design & UX/UI",
            "Unbegrenzte Unterseiten",
            "Fortgeschrittene Onpage SEO",
            "Content-Erstellung (bis 10 Texte)",
            "Automatisierung (z.B. MailScout)",
            "Festpreis-Garantie"
        ]
    },
    {
        name: "Ultimate 3D",
        price: "5.000€+",
        features: [
            "Alles aus Professional",
            "3D Webdesign Effekte",
            "Three.js Integration",
            "Individuelle Prozess-Automatisierung",
            "Premium Support & Wartung",
            "E-Commerce Integration"
        ]
    }
];

export const SERVICE_DATA: Record<string, ServiceData> = {
    webdesign: {
        title: "Webdesign für KMU",
        subtitle: "Webdesign Plan",
        heroText: "Maßgeschneiderte digitale Identitäten für den deutschen Mittelstand.",
        content: "Professionelles Webdesign ist für KMU heute kein Luxus mehr, sondern die Basis für digitales Wachstum. Wir erstellen Websites, die nicht nur gut aussehen, sondern konvertieren. Durch modernste UX/UI-Prinzipien und eine klare Conversion-Rate-Optimierung (CRO) verwandeln wir Besucher in Kunden. Jedes Projekt wird individuell auf Ihre Branche und Zielgruppe zugeschnitten, inklusive voller Responsivität und DSGVO-Konformität.",
        features: [
            { title: "Conversion Fokus", desc: "Strategische Platzierung von CTAs für maximale Anfragen." },
            { title: "Responsive Design", desc: "Perfekte Darstellung auf allen Endgeräten." },
            { title: "Individuelles UI", desc: "Keine Vorlagen – wir bauen Ihre Marke von Grund auf neu." }
        ]
    },
    seo: {
        title: "SEO-Optimierung",
        subtitle: "SEO Reichweite",
        heroText: "Dominieren Sie die Suchergebnisse durch strategische Optimierung.",
        content: "Eine Website ohne Besucher ist wertlos. Unser SEO-Webdesign-Ansatz stellt sicher, dass Ihre Online-Präsenz von Anfang an technisch perfekt auf Google vorbereitet ist. Wir kombinieren technisches SEO (Ladezeiten, Struktur) mit einer tiefgehenden Keyword-Analyse und autoritativem Content-Marketing. So steigern wir nachhaltig Ihre organische Reichweite und sorgen für qualifizierte Leads.",
        features: [
            { title: "Keyword Strategie", desc: "Targeting von Keywords mit hoher Kaufabsicht." },
            { title: "Technisches SEO", desc: "Optimierung für Spitzen-Rankings." },
            { title: "Local SEO", desc: "Präsenz in Ihrer Region für gezielte Kundenansprache." }
        ]
    },
    '3d': {
        title: "3D Webdesign",
        subtitle: "3D Erlebnisse",
        heroText: "Interaktive Erlebnisse durch moderne WebGL Technologien.",
        content: "Heben Sie sich technologisch von der Masse ab. Mit 3D Webdesign ermöglichen wir es Nutzern, Produkte virtuell zu erleben, durch Räume zu navigieren und interaktive Effekte zu genießen. Wir nutzen Frameworks wie Three.js, um hochwertige dreidimensionale Welten direkt im Browser zu schaffen – ohne zusätzliche Plugins.",
        features: [
            { title: "Interaktive Produkte", desc: "Lassen Sie Kunden Ihre Produkte digital 'anfassen'." },
            { title: "WebGL Performance", desc: "High-End Grafik bei minimalen Ladezeiten." },
            { title: "Nutzererfahrung", desc: "Einzigartige Erlebnisse, die im Gedächtnis bleiben." }
        ]
    },
    automation: {
        title: "Automatisierung",
        subtitle: "Effizienz",
        heroText: "Mehr Zeit für Ihr Kerngeschäft durch intelligente Prozesse.",
        content: "Effizienz ist der Schlüssel zum Erfolg. Wir automatisieren Ihre Geschäftsprozesse – von der Lead-Generierung bis zum Onboarding. Unser Vorzeigeprojekt MailScout.app demonstriert, wie automatisierte Workflows hunderte Arbeitsstunden pro Monat einsparen können. Wir integrieren individuelle Lösungen direkt in Ihre digitale Infrastruktur.",
        features: [
            { title: "Prozess Optimierung", desc: "Eliminierung von manuellen Aufgaben." },
            { title: "Software Integration", desc: "Anbindung an Tools wie MailScout und CRM." },
            { title: "Kosten Senkung", desc: "Steigerung der Effizienz durch digitale Prozesse." }
        ]
    },
    ai: {
        title: "KI-Lösungen",
        subtitle: "Intelligenz",
        heroText: "Nutzen Sie die Kraft der künstlichen Intelligenz für Ihr Business.",
        content: "Künstliche Intelligenz verändert die Art, wie wir arbeiten. Wir helfen Ihnen dabei, KI-Lösungen nahtlos in Ihre Website und Arbeitsprozesse zu integrieren. Von intelligenten Chatbots bis hin zu personalisierten Nutzererfahrungen – wir machen KI für KMU greifbar und profitabel.",
        features: [
            { title: "KI Chatbots", desc: "24/7 Kundenberatung durch intelligente Assistenz." },
            { title: "Automatischer Content", desc: "Effiziente Texterstellung durch KI-Unterstützung." },
            { title: "Data Insights", desc: "Bessere Entscheidungen durch intelligente Datenanalyse." }
        ]
    },
    security: {
        title: "Cyber Security",
        subtitle: "Sicherheit",
        heroText: "Höchster Schutz für Ihre Daten und die Ihrer Kunden.",
        content: "Im digitalen Zeitalter ist Sicherheit kein optionales Feature, sondern eine Notwendigkeit. Wir schützen Ihre Web-Präsenz vor Angriffen, sichern Ihre Datenbanken und gewährleisten die Einhaltung höchster Sicherheitsstandards. Unsere Lösungen sind auf maximale Resilienz und Datenschutz ausgelegt.",
        features: [
            { title: "End-to-End Encryption", desc: "Sichere Datenübertragung auf höchstem Niveau." },
            { title: "WAF Integration", desc: "Schutz vor schädlichen Anfragen und Hackerangriffen." },
            { title: "Compliance Support", desc: "Einhaltung internationaler Sicherheitsstandards." }
        ]
    }
};

export const LEGAL_CONTENT = {
    imprint: {
        title: "Impressum",
        sections: [
            {
                heading: "Angaben gemäß § 5 TMG",
                body: "Westagentur Digital Solutions GmbH\nMusterstraße 123\n12345 Musterstadt"
            },
            {
                heading: "Vertreten durch",
                body: "Geschäftsführer: Max Mustermann"
            },
            {
                heading: "Kontakt",
                body: "Telefon: +49 (0) 123 456789\nE-Mail: mail@westagentur.de"
            },
            {
                heading: "Registereintrag",
                body: "Eintragung im Handelsregister.\nRegistergericht: Amtsgericht Musterstadt\nRegisternummer: HRB 12345"
            },
            {
                heading: "Umsatzsteuer-ID",
                body: "Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:\nDE 123 456 789"
            }
        ]
    },
    privacy: {
        title: "Datenschutz",
        sections: [
            {
                heading: "1. Datenschutz auf einen Blick",
                body: "Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können."
            },
            {
                heading: "2. Datenerfassung auf unserer Website",
                body: "Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen."
            },
            {
                heading: "3. Analyse-Tools und Tools von Drittanbietern",
                body: "Beim Besuch dieser Website kann Ihr Surf-Verhalten statistisch ausgewertet werden. Das geschieht vor allem mit Cookies und mit sogenannten Analyseprogrammen."
            },
            {
                heading: "4. SSL- bzw. TLS-Verschlüsselung",
                body: "Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, wie zum Beispiel Bestellungen oder Anfragen, die Sie an uns als Seitenbetreiber senden, eine SSL- bzw. TLS-Verschlüsselung."
            }
        ]
    },
    tos: {
        title: "AGB",
        sections: [
            {
                heading: "§ 1 Geltungsbereich",
                body: "Für die Geschäftsbeziehung zwischen der Westagentur und dem Kunden gelten ausschließlich die nachfolgenden Allgemeinen Geschäftsbedingungen in ihrer zum Zeitpunkt der Bestellung gültigen Fassung."
            },
            {
                heading: "§ 2 Leistungsumfang",
                body: "Gegenstand des Vertrages ist die Erstellung von Websites, Suchmaschinenoptimierung und Prozessautomatisierung wie im jeweiligen Angebot individuell vereinbart."
            },
            {
                heading: "§ 3 Abnahme",
                body: "Nach Fertigstellung der Leistung ist der Kunde zur Abnahme verpflichtet, sofern die Leistung den vertraglichen Anforderungen entspricht."
            },
            {
                heading: "§ 4 Urheberrecht",
                body: "Sämtliche Nutzungsrechte an den erstellten Werken gehen erst nach vollständiger Bezahlung der vereinbarten Vergütung auf den Kunden über."
            }
        ]
    }
};
