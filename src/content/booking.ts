import type { Lang } from '../seo/site';

export const BOOKING_PATHS: Record<Lang, { book: string; manage: string }> = {
  de: { book: '/termin', manage: '/termin/verwalten' },
  en: { book: '/en/appointment', manage: '/en/appointment/manage' },
};

export const BOOKING_TEXT = {
  de: {
    title: 'Kostenloses Erstgespräch buchen | Westagentur',
    description:
      'Buchen Sie online ein kostenloses 30-minütiges Erstgespräch zu Webdesign, KI-Automatisierung oder KI-Telefonie. Wir rufen Sie zum Termin an.',
    navLabel: 'Termin buchen',
    h1: 'Kostenloses Erstgespräch buchen',
    intro: 'Wählen Sie einen freien Termin. Wir rufen Sie zur vereinbarten Zeit an und besprechen Ihr Vorhaben – unverbindlich und kostenlos.',
    points: ['30 Minuten per Telefon', 'Unverbindlich und kostenlos', 'Kalendereinladung per E-Mail'],
    chooseDay: 'Tag wählen',
    chooseTime: 'Uhrzeit wählen',
    timezone: 'Alle Zeiten in deutscher Zeit (Europe/Berlin).',
    loading: 'Freie Termine werden geladen …',
    noSlots: 'Aktuell sind keine Termine frei. Schreiben Sie uns gern über das Kontaktformular.',
    loadError: 'Termine konnten nicht geladen werden.',
    retry: 'Erneut versuchen',
    selected: 'Ihr Termin',
    change: 'Ändern',
    note: 'Worum geht es? (optional)',
    phoneHint: 'Unter dieser Nummer rufen wir Sie an.',
    submit: 'Termin verbindlich buchen',
    sending: 'Wird gebucht …',
    taken: 'Dieser Termin wurde gerade vergeben. Bitte wählen Sie einen anderen.',
    successTitle: 'Ihr Termin ist gebucht!',
    success: 'Sie erhalten gleich eine Bestätigung mit Kalendereinladung per E-Mail. Darin finden Sie auch einen Link, um den Termin zu verschieben oder abzusagen.',
    manageTitle: 'Termin verwalten',
    manageDescription: 'Termin verschieben oder absagen.',
    manageLoading: 'Termin wird geladen …',
    manageNotFound: 'Dieser Termin wurde nicht gefunden. Bitte prüfen Sie den Link aus Ihrer E-Mail.',
    statusConfirmed: 'Bestätigt',
    statusCancelled: 'Abgesagt',
    reschedule: 'Termin verschieben',
    rescheduleConfirm: 'Auf diesen Termin verschieben',
    rescheduled: 'Ihr Termin wurde verschoben. Sie erhalten eine neue Kalendereinladung per E-Mail.',
    cancel: 'Termin absagen',
    cancelConfirm: 'Möchten Sie den Termin wirklich absagen?',
    cancelled: 'Ihr Termin wurde abgesagt.',
    bookNew: 'Neuen Termin buchen',
    back: 'Abbrechen',
    pastNotice: 'Dieser Termin liegt in der Vergangenheit.',
  },
  en: {
    title: 'Book a Free Consultation | Westagentur',
    description:
      'Book a free 30-minute consultation on web design, AI automation or AI telephony online. We will call you at the agreed time.',
    navLabel: 'Book a call',
    h1: 'Book a free consultation',
    intro: 'Choose a free slot. We will call you at the agreed time and discuss your project – free and without obligation.',
    points: ['30 minutes by phone', 'Free and without obligation', 'Calendar invitation by email'],
    chooseDay: 'Choose a day',
    chooseTime: 'Choose a time',
    timezone: 'All times in German time (Europe/Berlin).',
    loading: 'Loading free slots …',
    noSlots: 'There are currently no free slots. Feel free to use the contact form.',
    loadError: 'Slots could not be loaded.',
    retry: 'Try again',
    selected: 'Your appointment',
    change: 'Change',
    note: 'What is it about? (optional)',
    phoneHint: 'We will call you on this number.',
    submit: 'Confirm booking',
    sending: 'Booking …',
    taken: 'This slot was just taken. Please choose another one.',
    successTitle: 'Your appointment is booked!',
    success: 'You will shortly receive a confirmation with a calendar invitation by email. It also contains a link to reschedule or cancel.',
    manageTitle: 'Manage appointment',
    manageDescription: 'Reschedule or cancel your appointment.',
    manageLoading: 'Loading appointment …',
    manageNotFound: 'This appointment was not found. Please check the link in your email.',
    statusConfirmed: 'Confirmed',
    statusCancelled: 'Cancelled',
    reschedule: 'Reschedule',
    rescheduleConfirm: 'Move to this slot',
    rescheduled: 'Your appointment has been moved. You will receive a new calendar invitation by email.',
    cancel: 'Cancel appointment',
    cancelConfirm: 'Do you really want to cancel this appointment?',
    cancelled: 'Your appointment has been cancelled.',
    bookNew: 'Book a new appointment',
    back: 'Back',
    pastNotice: 'This appointment is in the past.',
  },
} satisfies Record<Lang, Record<string, string | string[]>>;

export const formatSlot = (iso: string, lang: Lang, timeZone: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'de-DE', { timeZone, ...opts }).format(new Date(iso));

export const formatAppointment = (iso: string, lang: Lang, timeZone = 'Europe/Berlin') => {
  const text = formatSlot(iso, lang, timeZone, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return lang === 'en' ? text : `${text} Uhr`;
};
