export type LegalKey = 'imprint' | 'privacy' | 'tos';

export const LEGAL_CONTENT: Record<LegalKey, { title: string; sections: { heading: string; body: string }[] }> = {
    imprint: {
        title: "Impressum",
        sections: [
            {
                heading: "Angaben gemäß § 5 DDG",
                body: "Westagentur Digital Solutions GmbH\nKielstraße 28\n44145 Dortmund"
            },
            {
                heading: "Vertreten durch",
                body: "Geschäftsführer: Max Mustermann"
            },
            {
                heading: "Kontakt",
                body: "Telefon: +49 152 27506958\nE-Mail: mail@westagentur.de"
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
