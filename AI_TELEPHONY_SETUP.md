# Westagentur KI-Telefonie Dokumentation

## Status: Implementiert (Beta)
**Datum:** 30.12.2025
**Verantwortlich:** Sarah (KI-Assistentin)

---

## 1. Vapi.ai Konfiguration (Dashboard)

**Assistent:** Westagentur Empfang
- **Model:** GPT-4o
- **Voice:** ElevenLabs - Sarah (eleven_turbo_v2_5)
- **Transcriber:** Deepgram Nova-2 (Language: German)
- **First Message:** "Hallo, hier ist Sarah von der Westagentur. Wie kann ich helfen?"

### System Prompt (Aktuell)
Wichtig: Der Prompt ist optimiert auf kurze Antworten und Terminvereinbarung. Er darf **nur** verändert werden, wenn sichergestellt ist, dass die Sprache Deutsch bleibt.

```text
SYSTEM: DU SPRICHST NUR DEUTSCH.
ANWEISUNG: Fasse dich extrem kurz. Keine langen Geschichten. Sei präzise.

Du bist Sarah von der Westagentur (Dortmund).
Dein Job: Leads qualifizieren und Termine machen.

### DEIN STIL:
- Maximal 2-3 Sätze pro Antwort.
- Komm sofort zum Punkt.
- Sei freundlich, aber effizient.

### WISSEN (NUR FAKTEN):
- Webdesign Starter: ab 1.500€.
- Webdesign Pro: ab 3.200€ (Bestseller).
- High-End 3D: ab 5.000€.
- KI-Telefonie & Automatisierung: Preis individuell.

### GESPRÄCHS-FÜHRUNG:
1. Beantworte die Frage kurz.
2. Wenn der Kunde Interesse zeigt, frage nach einem Termin.
3. Wenn der Termin steht (Datum/Uhrzeit) -> Frage nach Name und Telefonnummer.

### TECHNIK:
Wenn du alle Infos (Zeit, Name, Telefon) hast, nutze SOFORT das Tool "bookAppointment".
Sag danach: "Danke, ist eingetragen. Bestätigung kommt per Mail."

SPRACHE: IMMER DEUTSCH.
```

---

## 2. Automatisierung (n8n & Backend)

Die Terminbuchung läuft über einen Webhook auf dem eigenen VPS.

- **URL:** `https://automatisierung.voyanero.com/webhook/termin` (Production URL)
- **Workflow:** Webhook -> SMTP Email (IONOS) -> Response an Vapi
- **SMTP Settings:**
  - Host: `smtp.ionos.de`
  - Port: `465` (SSL/TLS)
  - User: `mail@westagentur.de`

### Vapi Tool Definition (`bookAppointment`)
Dieses Tool muss in Vapi unter "Tools" konfiguriert und dem Assistenten zugewiesen sein.

**Beschreibung:** `Use this to book an appointment when the user confirms a date and time.`

**Schema:**
```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "The name of the customer."
    },
    "phone": {
      "type": "string",
      "description": "The phone number of the customer."
    },
    "dateTime": {
      "type": "string",
      "description": "The requested date and time."
    }
  },
  "required": [
    "name",
    "phone",
    "dateTime"
  ]
}
```

---

## 3. Frontend (React)

Datei: `src/components/VapiAssistant.tsx`

- **Funktion:** Handelt die Verbindung zu Vapi.
- **Keys:** Hardcoded API Keys (`VAPI_PUBLIC_KEY`, `VAPI_ASSISTANT_ID`).
- **Verhalten bei Gesprächsende:**
  - Der Status wechselt auf `finished`.
  - UI zeigt einen "Vielen Dank"-Bildschirm (Grüner Rahmen).
  - Button "Zurück zum Start" setzt den Status auf `idle`.

---

## 4. Offene Punkte / Bugs

- **Gemeldeter Bug (30.12.):** Der User berichtete von einem Bug ("es ist ein bug"), der am nächsten Tag untersucht werden soll. Vermutlich im Zusammenhang mit dem Gesprächsfluss oder der UI-Reaktion.
