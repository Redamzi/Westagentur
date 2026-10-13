# Umsetzungsplan Westagentur

**Positionierung:** Webdesign & KI-Automatisierung für den Mittelstand
**Kernbotschaft:** Website, die Anfragen bringt – plus KI, die sie automatisch bearbeitet.

## Entscheidungen
- 3D wird komplett entfernt.
- Keine Fremddienste (kein Calendly, kein Supabase) – alles Eigenentwicklung. Ausnahme: Vapi bleibt.
- Mailversand über eigenen SMTP-Zugang.
- Preise: Webdesign mit „ab“-Preisen (Starter ab 1.500 €, Pro ab 3.200 €), KI-Automatisierung „individuell nach kostenlosem Check“.
- Design: hell als Basis, dunkle Akzentsektionen (Hero, KI-Assistent, CTA). Akzentfarbe Petrol `#0E7490` für Text, Cyan nur dekorativ.

## Prüfergebnis (Ist-Stand)
- Kontrast: ok (axe ohne Fehler).
- Mobil: Hero-Überschrift „KI-Automatisierung“ läuft über; 12 Touch-Ziele < 44 px; Seite ~13.300 px lang.
- Inhalte erscheinen erst beim Scrollen (Animation) – SEO-Risiko.
- Tastatur: Reihenfolge ok, Fokusrahmen kaum sichtbar, 2–3 Icon-Buttons ohne Label.
- SEO: reine SPA, nur eine URL, keine robots.txt/sitemap.xml, kein OG-Bild, `logo.png` fehlt, kein hreflang.
- Rechtstexte nur als `alert()`.
- Alte, ungenutzte Komponenten mit undefinierten Klassen.

## Schritte
1. ✅ **Aufräumen** – 3D (`three`, `Interactive3DViewer`, `ThreeSpaceBackground`), alte Komponenten, 3D in Schema/Texten/Vapi-Prompt entfernen.
2. ✅ **Design** – helles Design-System (Tokens in Tailwind), Mobil-Fixes, Fokus-Stile, aria-Labels, Touch-Ziele ≥ 44 px.
3. ✅ **SEO-Basis** – Prerendering, Routing (`/webdesign`, `/ki-automatisierung`, `/ki-telefonie`, `/kontakt`, `/impressum`, `/datenschutz`, `/agb`, `/en/...`), Meta/OG/hreflang je Seite, `robots.txt`, `sitemap.xml`, JSON-LD (`LocalBusiness`, Service, FAQ), Logo + OG-Bild, Performance (Lazy-Load Vapi, Fonts self-hosted, nginx gzip/Cache).
4. ✅ **Backend** – Node-Container in `docker-compose.yml`, nginx `/api` → Backend, SQLite auf Volume + tägliches Backup, `nodemailer` (SMTP aus `.env`). Kontaktformular mit Honeypot + Rate-Limit, Bestätigungs- und Benachrichtigungsmail.
5. ✅ **Terminbuchung** – Verfügbarkeiten, freie Slots, Buchung, `.ics`-Einladung, Storno/Verschieben per Link.
6. ✅ **Admin `/admin`** – Leads, Termine, Status-Pipeline, Verfügbarkeiten, Statistik (cookielos). Passwortgeschützt.
7. ✅ **Automatisierung** – Vapi-Webhook `/api/vapi` (Lead + Termin), Follow-ups nach 2/7 Tagen, Terminerinnerung 24 h vorher, Bewertungsanfrage nach Projektabschluss, optional Angebots-PDF.
8. **Vermarktung/Inhalte** – lokale Landingpages (Hamm, Dortmund, Ruhrgebiet), Ratgeber/Blog, Fallstudien (MailScout, Direktverteilung, Voyanero), Lead-Magnet „Website- & Automatisierungs-Check“, Live-Demo „Sarah anrufen“, Google-Unternehmensprofil.

## Offene Punkte aus Schritt 3
- Impressum: Westagentur, Inhaber Argjend Krasniqi, Schildkamp 1, Hamm. USt-ID ergänzen, falls vorhanden. Website komplett auf Hamm umgestellt.
- Datenschutzerklärung neu (Hosting IONOS, Logs, Formular, Termine, Statistik, Vapi) – rechtlich prüfen lassen.
- Fiktives Kundenzitat („Musterkunde GmbH“) entfernt – echte Kundenstimmen ergänzen.
- Angebots-PDF (optional aus Schritt 7) noch nicht umgesetzt.
- Logo „West-Prompt“ (Variante C) umgesetzt: `public/logo.svg`, `logo.png`, `logo-mail.png`, `favicon.svg`, `src/components/LogoMark.tsx`.

## Benötigt
- SMTP-Daten (Host, Port, Benutzer, Passwort) – nur in `.env` auf dem Server.

- Zahlen/Ergebnisse für die Fallstudien.
