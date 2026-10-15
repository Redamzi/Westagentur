export type LegalKey = 'imprint' | 'privacy' | 'tos';

export const OWNER_NAME = 'Argjend Krasniqi';
const STREET = 'Schildkamp 1\n59063 Hamm';

const ADDRESS = `Westagentur\nInhaber: ${OWNER_NAME}\n${STREET}\nDeutschland`;

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
      {
        heading: 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
        body: `${OWNER_NAME}\n${STREET}`,
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
          'Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des Erstellers. Eine Nutzung der Inhalte für das Training von KI-Systemen (Text- und Data-Mining) ist nicht gestattet; wir behalten uns diese Nutzung gemäß § 44b Abs. 3 UrhG ausdrücklich vor (maschinenlesbar in unserer robots.txt). Gestattet ist das Erfassen durch Suchmaschinen und KI-Suchdienste, soweit sie auf unsere Seiten verweisen.',
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
        heading: '10. KI-Assistent „Toni“ (Telefon, Live-Demo und Chat)',
        body:
          'Für unseren KI-Telefonassistenten und die Live-Demo auf dieser Website nutzen wir den Dienst Vapi (Vapi, Inc., USA). Dabei werden Sprachaufnahmen in Echtzeit verarbeitet: Spracherkennung, Antworterzeugung und Sprachausgabe erfolgen über ein Sprachmodell der OpenAI, L.L.C. (USA), das Vapi für uns betreibt. Anrufer werden zu Beginn des Gesprächs darauf hingewiesen, dass sie mit einer KI sprechen.\n\nLive-Demo: Die Software von Vapi wird erst geladen, wenn Sie auf „Gespräch mit Toni starten“ klicken. Erst dann wird – nach Freigabe in Ihrem Browser – Ihr Mikrofon genutzt und Ihre Sprache übertragen. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Sie durch Beenden des Gesprächs jederzeit für die Zukunft widerrufen können.\n\nChat: Wenn Sie Toni eine Nachricht schreiben, leitet unser Server Ihre Nachricht an Vapi weiter; die Antwort wird über ein Sprachmodell der OpenAI, L.L.C. (USA) erzeugt. Ihre IP-Adresse wird dabei nicht an Vapi übermittelt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Bearbeitung Ihrer Anfrage) bzw. Art. 6 Abs. 1 lit. f DSGVO. Vereinbaren Sie im Chat einen Termin, speichern wir die dafür angegebenen Daten wie bei einer Terminbuchung über die Website. Bitte geben Sie im Chat keine sensiblen Daten ein.\n\nTelefon: Bei Anrufen verarbeiten wir Ihre Telefonnummer, den Gesprächsinhalt und eine automatisch erstellte Zusammenfassung, um Ihr Anliegen zu bearbeiten und ggf. einen Termin einzutragen (Art. 6 Abs. 1 lit. b und f DSGVO).\n\nDie Übermittlung in die USA erfolgt auf Grundlage des EU-US Data Privacy Framework, soweit der jeweilige Anbieter zertifiziert ist, im Übrigen auf Grundlage von EU-Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO).',
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
    title: 'Allgemeine Geschäftsbedingungen',
    updated: 'Stand: Oktober 2026',
    sections: [
      {
        heading: '§ 1 Geltungsbereich',
        body:
          `Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen der Westagentur, Inhaber ${OWNER_NAME}, ${STREET.replace('\n', ', ')} (nachfolgend „Agentur“), und ihren Kunden über Leistungen in den Bereichen Webdesign, Webentwicklung, Suchmaschinenoptimierung, KI-Telefonie, Prozessautomatisierung, Hosting und Wartung.\n\nUnser Angebot richtet sich ausschließlich an Unternehmer im Sinne von § 14 BGB, juristische Personen des öffentlichen Rechts und öffentlich-rechtliche Sondervermögen. Abweichende Bedingungen des Kunden gelten nur, wenn die Agentur ihnen ausdrücklich in Textform zustimmt.`,
      },
      {
        heading: '§ 2 Vertragsschluss',
        body:
          'Angebote der Agentur sind freibleibend und 30 Tage gültig, sofern nicht anders angegeben. Ein Vertrag kommt durch die Annahme des Angebots in Textform (z. B. per E-Mail) oder durch den Beginn der Leistungserbringung auf Wunsch des Kunden zustande. Maßgeblich für den Leistungsumfang ist das jeweilige Angebot.',
      },
      {
        heading: '§ 3 Leistungen und Mitwirkung des Kunden',
        body:
          'Die Agentur erbringt die vereinbarten Leistungen nach dem Stand der Technik. Sie darf zur Leistungserbringung qualifizierte Subunternehmer und technische Dienstleister einsetzen.\n\nDer Kunde stellt alle für die Leistung erforderlichen Inhalte, Zugänge und Informationen (z. B. Texte, Bilder, Logos, Zugangsdaten) rechtzeitig und in geeigneter Form bereit. Er sichert zu, dass er zur Nutzung der überlassenen Inhalte berechtigt ist und diese keine Rechte Dritter verletzen. Verzögerungen durch fehlende Mitwirkung verlängern vereinbarte Fristen entsprechend; dadurch entstehender Mehraufwand kann gesondert berechnet werden.',
      },
      {
        heading: '§ 4 Änderungswünsche',
        body: 'Änderungen und Erweiterungen des vereinbarten Leistungsumfangs bedürfen einer Vereinbarung in Textform. Mehraufwand wird nach Absprache bzw. nach dem vereinbarten Stundensatz berechnet. Im Angebot genannte Korrekturschleifen sind im Preis enthalten.',
      },
      {
        heading: '§ 5 Abnahme',
        body:
          'Werkleistungen (z. B. Websites) werden nach Fertigstellung zur Abnahme bereitgestellt (§ 640 BGB). Der Kunde prüft die Leistung innerhalb von 14 Tagen und erklärt die Abnahme oder teilt wesentliche Mängel in Textform mit. Die Leistung gilt als abgenommen, wenn der Kunde innerhalb dieser Frist keine wesentlichen Mängel benennt oder die Leistung produktiv nutzt (z. B. Veröffentlichung der Website). Unwesentliche Mängel berechtigen nicht zur Verweigerung der Abnahme.',
      },
      {
        heading: '§ 6 Vergütung und Zahlung',
        body:
          'Es gelten die im Angebot vereinbarten Preise zuzüglich der gesetzlichen Umsatzsteuer, soweit diese anfällt. Bei Projekten kann die Agentur angemessene Abschlagszahlungen verlangen (üblich: 50 % bei Auftrag, 50 % bei Abnahme). Rechnungen sind innerhalb von 14 Tagen ohne Abzug zahlbar. Laufende Leistungen (Hosting, Wartung, KI-Telefonie) werden monatlich oder jährlich im Voraus berechnet. Kosten externer Dienste (z. B. Domains, Telefonie- und KI-Nutzung) werden gesondert berechnet, sofern im Angebot nicht anders geregelt.',
      },
      {
        heading: '§ 7 Nutzungsrechte',
        body:
          'Mit vollständiger Zahlung erhält der Kunde die zur vertragsgemäßen Nutzung erforderlichen, zeitlich und räumlich unbeschränkten einfachen Nutzungsrechte an den individuell für ihn erstellten Arbeitsergebnissen. Bis dahin ist die Nutzung nur widerruflich gestattet. Rechte an Open-Source-Komponenten, Bibliotheken und Werkzeugen der Agentur sowie an Leistungen Dritter richten sich nach deren Lizenzbedingungen. Die Agentur darf das Projekt als Referenz nennen, sofern der Kunde nicht widerspricht.',
      },
      {
        heading: '§ 8 KI-gestützte Leistungen',
        body:
          'Bei KI-Telefonie und Automatisierungen setzt die Agentur Dienste Dritter (z. B. Sprach- und Sprachmodell-Anbieter) ein. KI-Systeme können fehlerhafte oder unvollständige Antworten erzeugen; eine bestimmte inhaltliche Richtigkeit einzelner KI-Ausgaben wird nicht geschuldet. Der Kunde ist als Betreiber für den rechtmäßigen Einsatz verantwortlich, insbesondere für die Information seiner Anrufer bzw. Nutzer, dass sie mit einem KI-System interagieren (Art. 50 KI-Verordnung), sowie für die datenschutzrechtliche Zulässigkeit. Die Agentur unterstützt ihn dabei.',
      },
      {
        heading: '§ 9 Datenschutz und Auftragsverarbeitung',
        body: 'Soweit die Agentur personenbezogene Daten im Auftrag des Kunden verarbeitet (z. B. bei Hosting, Kontaktformularen oder KI-Telefonie), schließen die Parteien einen Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO.',
      },
      {
        heading: '§ 10 Gewährleistung',
        body: 'Es gelten die gesetzlichen Mängelrechte mit der Maßgabe, dass die Agentur zunächst nach ihrer Wahl nachbessert oder neu leistet. Die Verjährungsfrist für Mängelansprüche beträgt ein Jahr ab Abnahme bzw. Leistung, außer bei Vorsatz, Arglist und in den Fällen des § 11 Satz 1.',
      },
      {
        heading: '§ 11 Haftung',
        body:
          'Die Agentur haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit, für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit, nach dem Produkthaftungsgesetz sowie im Umfang einer übernommenen Garantie. Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten (Pflichten, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags erst ermöglicht und auf deren Einhaltung der Kunde regelmäßig vertrauen darf) ist die Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt. Im Übrigen ist die Haftung für leichte Fahrlässigkeit ausgeschlossen. Für den Verlust von Daten haftet die Agentur nur, soweit dieser bei ordnungsgemäßer Datensicherung durch den Kunden nicht vermeidbar gewesen wäre.',
      },
      {
        heading: '§ 12 Laufzeit von Dauerleistungen',
        body: 'Hosting-, Wartungs- und KI-Telefonie-Verträge laufen, sofern nicht anders vereinbart, auf unbestimmte Zeit und können von beiden Seiten mit einer Frist von einem Monat zum Monatsende in Textform gekündigt werden. Das Recht zur außerordentlichen Kündigung bleibt unberührt.',
      },
      {
        heading: '§ 13 Schlussbestimmungen',
        body:
          'Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Ist der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist Gerichtsstand Hamm. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt; an ihre Stelle tritt die gesetzliche Regelung.',
      },
    ],
  },
};
