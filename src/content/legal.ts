export type LegalKey = 'imprint' | 'privacy' | 'tos';

// TODO: echte Angaben eintragen (Name des Inhabers, USt-ID oder Abschnitt entfernen).
export const OWNER_NAME = '[Vor- und Nachname des Inhabers]';
const VAT_ID = '[USt-IdNr. eintragen – oder Abschnitt entfernen, falls keine vorhanden]';

const ADDRESS = `Westagentur\nInhaber: ${OWNER_NAME}\nKielstraße 28\n44145 Dortmund\nDeutschland`;

/**
 * Legal texts. In "body", the placeholders {{email}} and {{phone}} are rendered as
 * click-to-reveal contact links (ProtectedContact) so they cannot be scraped.
 */
export const LEGAL_CONTENT: Record<LegalKey, { title: string; updated?: string; sections: { heading: string; body: string }[] }> = {
  imprint: {
    title: 'Impressum',
    sections: [
      { heading: 'Angaben gemäß § 5 DDG', body: ADDRESS },
      { heading: 'Kontakt', body: 'Telefon: {{phone}}\nE-Mail: {{email}}' },
      { heading: 'Umsatzsteuer-ID', body: `Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:\n${VAT_ID}` },
      {
        heading: 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
        body: `${OWNER_NAME}\nKielstraße 28\n44145 Dortmund`,
      },
      {
        heading: 'Verbraucherstreitbeilegung',
        body: 'Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
      },
      {
        heading: 'Haftung für Inhalte',
        body:
          'Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen entfernen wir diese Inhalte umgehend.',
      },
      {
        heading: 'Haftung für Links',
        body:
          'Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft; rechtswidrige Inhalte waren nicht erkennbar. Bei Bekanntwerden von Rechtsverletzungen entfernen wir derartige Links umgehend.',
      },
      {
        heading: 'Urheberrecht',
        body:
          'Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des Erstellers. Eine Nutzung der Inhalte für das Training von KI-Systemen oder automatisiertes Auslesen (Text- und Data-Mining) ist nicht gestattet; wir behalten uns diese Nutzung gemäß § 44b Abs. 3 UrhG ausdrücklich vor.',
      },
    ],
  },

  privacy: {
    title: 'Datenschutzerklärung',
    updated: 'Stand: Oktober 2026',
    sections: [
      {
        heading: '1. Verantwortlicher',
        body: `${ADDRESS}\nTelefon: {{phone}}\nE-Mail: {{email}}\n\nEin Datenschutzbeauftragter ist nicht bestellt, da hierzu keine gesetzliche Pflicht besteht.`,
      },
      {
        heading: '2. Überblick',
        body:
          'Wir verarbeiten personenbezogene Daten nur, soweit dies für den Betrieb dieser Website, die Bearbeitung Ihrer Anfragen und Termine sowie die Erbringung unserer Leistungen erforderlich ist. Diese Website verwendet keine Tracking-Cookies, keine Werbe- oder Analyse-Dienste von Drittanbietern und lädt keine Inhalte von Google oder sozialen Netzwerken.\n\nRechtsgrundlagen sind insbesondere Art. 6 Abs. 1 lit. a DSGVO (Einwilligung), lit. b (Vertrag und vorvertragliche Maßnahmen), lit. c (rechtliche Verpflichtung) und lit. f DSGVO (berechtigtes Interesse).',
      },
      {
        heading: '3. Hosting und Server-Logdateien',
        body:
          'Diese Website wird auf Servern der IONOS SE, Elgendorfer Str. 57, 56410 Montabaur, Deutschland, betrieben. Mit IONOS besteht ein Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO.\n\nBeim Aufruf der Website verarbeitet unser Webserver technisch notwendige Daten: Datum und Uhrzeit, aufgerufene Seite, übertragene Datenmenge, Statuscode, verweisende Seite und Browser-Kennung. Ihre IP-Adresse wird in den Logdateien nur gekürzt gespeichert (letzter Block entfernt), sodass kein Personenbezug besteht. Zum Schutz vor Missbrauch (z. B. massenhafte Formular-Anfragen) wird die vollständige IP-Adresse kurzzeitig im Arbeitsspeicher gehalten und nach höchstens zwei Stunden verworfen; sie wird nicht dauerhaft gespeichert.\n\nRechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; unser berechtigtes Interesse liegt im sicheren und stabilen Betrieb der Website. Die Logdateien sind in ihrer Größe begrenzt und werden laufend überschrieben.',
      },
      {
        heading: '4. SSL-/TLS-Verschlüsselung',
        body: 'Diese Website nutzt eine SSL-/TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie an „https://“ in der Adresszeile Ihres Browsers.',
      },
      {
        heading: '5. Schriftarten',
        body: 'Die verwendeten Schriftarten (Inter, Space Grotesk) sind lokal auf unserem Server gespeichert. Beim Aufruf der Website wird keine Verbindung zu Google oder anderen Schriftanbietern hergestellt.',
      },
      {
        heading: '6. Reichweitenmessung ohne Cookies',
        body:
          'Um zu verstehen, welche Seiten genutzt werden, zählen wir Seitenaufrufe mit einem selbst entwickelten Verfahren. Gespeichert werden ausschließlich das Datum, die aufgerufene Seite und – falls vorhanden – die Domain der verweisenden Website (z. B. „google.com“). Es werden keine Cookies gesetzt, keine IP-Adressen gespeichert und keine Nutzerprofile gebildet; ein Rückschluss auf einzelne Personen ist nicht möglich. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.',
      },
      {
        heading: '7. Kontaktformular',
        body:
          'Wenn Sie uns über das Kontaktformular schreiben, verarbeiten wir Ihren Namen, Ihre E-Mail-Adresse, Ihre Nachricht, Ihr Interessensgebiet sowie freiwillig Telefonnummer und Unternehmen. Wir nutzen die Daten zur Bearbeitung Ihrer Anfrage und senden Ihnen eine Eingangsbestätigung per E-Mail.\n\nRechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit Ihre Anfrage auf einen Vertrag zielt, im Übrigen Art. 6 Abs. 1 lit. f DSGVO (Beantwortung von Anfragen). Die Daten werden auf unserem Server in Deutschland gespeichert und nicht an Dritte weitergegeben; der E-Mail-Versand erfolgt über unseren E-Mail-Anbieter.',
      },
      {
        heading: '8. Online-Terminbuchung',
        body:
          'Bei der Buchung eines Termins verarbeiten wir den gewählten Termin, Ihren Namen, Ihre E-Mail-Adresse, Ihre Telefonnummer (wir rufen Sie zum Termin an) sowie freiwillig Unternehmen, Interessensgebiet und eine Notiz. Sie erhalten eine Bestätigung mit Kalendereinladung, eine Erinnerung etwa 24 Stunden vor dem Termin sowie einen persönlichen Link, mit dem Sie den Termin verschieben oder absagen können.\n\nRechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen auf Ihre Anfrage).',
      },
      {
        heading: '9. E-Mails im Rahmen der Anfrage',
        body:
          'Haben wir Ihnen ein Angebot geschickt, fragen wir bis zu zweimal (nach etwa 2 und 7 Tagen) per E-Mail nach, ob Fragen offen sind (Art. 6 Abs. 1 lit. b DSGVO). Nach Abschluss eines Projekts bitten wir unsere Kunden einmalig per E-Mail um eine Bewertung (Art. 6 Abs. 1 lit. f DSGVO i. V. m. § 7 Abs. 3 UWG). Sie können diesen E-Mails jederzeit widersprechen, z. B. durch eine kurze Antwort auf die E-Mail; dafür entstehen keine anderen als die Übermittlungskosten nach den Basistarifen.',
      },
      {
        heading: '10. KI-Telefonassistent und Live-Demo',
        body:
          'Für unseren KI-Telefonassistenten und die Live-Demo auf dieser Website nutzen wir den Dienst Vapi (Vapi, Inc., USA). Dabei werden Sprachaufnahmen in Echtzeit verarbeitet: Die Spracherkennung erfolgt über Deepgram, Inc. (USA), die Antworterzeugung über OpenAI, L.L.C. (USA) und die Sprachausgabe über ElevenLabs, Inc. (USA). Anrufer werden zu Beginn des Gesprächs darauf hingewiesen, dass sie mit einer KI sprechen.\n\nLive-Demo: Die Software von Vapi wird erst geladen, wenn Sie auf den Anruf-Button der Demo klicken. Erst dann wird – nach Freigabe in Ihrem Browser – Ihr Mikrofon genutzt und Ihre Sprache übertragen. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Sie durch Beenden des Gesprächs jederzeit für die Zukunft widerrufen können.\n\nTelefon: Bei Anrufen verarbeiten wir Ihre Telefonnummer, den Gesprächsinhalt und eine automatisch erstellte Zusammenfassung, um Ihr Anliegen zu bearbeiten und ggf. einen Termin einzutragen (Art. 6 Abs. 1 lit. b und f DSGVO).\n\nDie Übermittlung in die USA erfolgt auf Grundlage des EU-US Data Privacy Framework, soweit der jeweilige Anbieter zertifiziert ist, im Übrigen auf Grundlage von EU-Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO).',
      },
      {
        heading: '11. Cookies',
        body: 'Für Besucher setzt diese Website keine Cookies. Lediglich im passwortgeschützten Verwaltungsbereich wird nach der Anmeldung ein technisch notwendiges Sitzungs-Cookie gesetzt (§ 25 Abs. 2 TDDDG).',
      },
      {
        heading: '12. Speicherdauer',
        body:
          'Anfragen und Termine, aus denen kein Auftrag entsteht, löschen wir spätestens 12 Monate nach dem letzten Kontakt automatisch. Daten aus Aufträgen bewahren wir auf, solange gesetzliche Aufbewahrungspflichten bestehen (in der Regel 6 bzw. 10 Jahre nach HGB und AO). Datensicherungen werden nach 14 Tagen überschrieben.',
      },
      {
        heading: '13. Ihre Rechte',
        body:
          'Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) sowie auf Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO).\n\nWiderspruchsrecht: Soweit wir Daten auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO verarbeiten, können Sie aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit widersprechen (Art. 21 DSGVO). Werbung können Sie jederzeit ohne Angabe von Gründen widersprechen.\n\nZur Ausübung Ihrer Rechte genügt eine Nachricht an die oben genannten Kontaktdaten.',
      },
      {
        heading: '14. Beschwerderecht',
        body:
          'Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Zuständig für uns ist: Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen, Kavalleriestraße 2–4, 40213 Düsseldorf.',
      },
    ],
  },

  tos: {
    title: 'AGB',
    sections: [
      {
        heading: '§ 1 Geltungsbereich',
        body: 'Für die Geschäftsbeziehung zwischen der Westagentur und dem Kunden gelten ausschließlich die nachfolgenden Allgemeinen Geschäftsbedingungen in ihrer zum Zeitpunkt der Bestellung gültigen Fassung.',
      },
      {
        heading: '§ 2 Leistungsumfang',
        body: 'Gegenstand des Vertrages ist die Erstellung von Websites, Suchmaschinenoptimierung und Prozessautomatisierung wie im jeweiligen Angebot individuell vereinbart.',
      },
      {
        heading: '§ 3 Abnahme',
        body: 'Nach Fertigstellung der Leistung ist der Kunde zur Abnahme verpflichtet, sofern die Leistung den vertraglichen Anforderungen entspricht.',
      },
      {
        heading: '§ 4 Urheberrecht',
        body: 'Sämtliche Nutzungsrechte an den erstellten Werken gehen erst nach vollständiger Bezahlung der vereinbarten Vergütung auf den Kunden über.',
      },
    ],
  },
};
