import React, { useCallback, useEffect, useState } from 'react';
import { LogOut, Mail, Phone, RefreshCw } from 'lucide-react';
import { errorClass, inputClass, labelClass } from '../components/formStyles';
import { formatAppointment } from '../content/booking';

// ------------------------------------------------------------------ API

class ApiError extends Error {
  constructor(public status: number) {
    super(`HTTP ${status}`);
  }
}

const api = async <T,>(method: string, path: string, body?: unknown): Promise<T> => {
  const res = await fetch(`/api/admin${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'same-origin',
  });
  if (res.status === 401 && path !== '/login' && path !== '/me') window.dispatchEvent(new Event('admin-unauthorized'));
  if (!res.ok) throw new ApiError(res.status);
  return res.json();
};

// ------------------------------------------------------------------ types & labels

interface Lead {
  id: number;
  created_at: string;
  source: string;
  status: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
  page: string;
  notes: string | null;
}

interface Booking {
  id: number;
  start_utc: string;
  status: string;
  source: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  note: string;
}

interface Stats {
  days: number;
  views: number;
  leads: number;
  conversionRate: number;
  bookingsUpcoming: number;
  bookingsInPeriod: number;
  leadsBySource: { key: string; n: number }[];
  leadsByService: { key: string; n: number }[];
  leadsByStatus: { key: string; n: number }[];
  topPages: { key: string; n: number }[];
  topReferrers: { key: string; n: number }[];
}

interface Availability {
  weekday: number;
  start_min: number;
  end_min: number;
}

interface Settings {
  timezone: string;
  slotMinutes: number;
  minNoticeHours: number;
  maxDaysAhead: number;
}

interface Block {
  id: number;
  start_utc: string;
  end_utc: string;
  reason: string;
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Neu',
  contacted: 'Kontaktiert',
  offer: 'Angebot gesendet',
  won: 'Gewonnen',
  completed: 'Abgeschlossen',
  lost: 'Verloren',
};
const SOURCE_LABELS: Record<string, string> = { contact_form: 'Kontaktformular', booking: 'Terminbuchung', phone: 'KI-Telefon' };
const SERVICE_LABELS: Record<string, string> = { webdesign: 'Webdesign', automation: 'KI-Automatisierung', telephony: 'KI-Telefonie', other: 'Sonstiges' };
const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

const dateTime = (iso: string) =>
  new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
const toTime = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
const fromTime = (value: string) => {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
};

const cardClass = 'bg-surface border border-border p-5 md:p-6';
const smallBtn = 'inline-flex items-center gap-2 min-h-[44px] px-4 border border-border text-sm font-display hover:border-primary transition-colors';

// ------------------------------------------------------------------ login

const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('POST', '/login', { password: new FormData(event.currentTarget).get('password') });
      onLogin();
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0;
      setError(
        status === 401 ? 'Falsches Passwort.' :
        status === 429 ? 'Zu viele Versuche. Bitte in 15 Minuten erneut versuchen.' :
        status === 503 ? 'Admin-Bereich ist nicht eingerichtet (ADMIN_PASSWORD fehlt).' :
        'Anmeldung fehlgeschlagen.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={`${cardClass} max-w-sm mx-auto space-y-5`}>
      <h1 className="text-2xl font-display font-bold">Admin-Anmeldung</h1>
      <div>
        <label htmlFor="admin-password" className={labelClass}>Passwort</label>
        <input id="admin-password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </div>
      {error && <p role="alert" className={errorClass}>{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary w-full">Anmelden</button>
    </form>
  );
};

// ------------------------------------------------------------------ overview

const KeyTable: React.FC<{ title: string; rows: { key: string; n: number }[]; labels?: Record<string, string> }> = ({ title, rows, labels }) => (
  <div className={cardClass}>
    <h3 className="font-display font-semibold mb-3">{title}</h3>
    {rows.length ? (
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-t border-border">
              <td className="py-2 pr-4 break-all">{labels?.[r.key] ?? r.key}</td>
              <td className="py-2 text-right tabular-nums">{r.n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p className="text-sm text-muted">Noch keine Daten.</p>
    )}
  </div>
);

const Overview: React.FC = () => {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<Stats>();

  useEffect(() => {
    api<Stats>('GET', `/stats?days=${days}`).then(setStats).catch(() => setStats(undefined));
  }, [days]);

  if (!stats) return <p className="text-muted">Lädt …</p>;
  const tiles = [
    ['Seitenaufrufe', stats.views.toLocaleString('de-DE')],
    ['Anfragen', stats.leads.toLocaleString('de-DE')],
    ['Anfragen je Aufruf', `${(stats.conversionRate * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} %`],
    ['Kommende Termine', stats.bookingsUpcoming.toLocaleString('de-DE')],
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <label htmlFor="stats-days" className="text-sm text-muted">Zeitraum</label>
        <select id="stats-days" value={days} onChange={(e) => setDays(Number(e.target.value))} className={`${inputClass} w-auto`}>
          <option value={7}>7 Tage</option>
          <option value={30}>30 Tage</option>
          <option value={90}>90 Tage</option>
          <option value={365}>12 Monate</option>
        </select>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map(([label, value]) => (
          <div key={label} className={cardClass}>
            <p className="text-sm text-muted">{label}</p>
            <p className="text-3xl font-display font-bold mt-1 tabular-nums">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KeyTable title="Anfragen nach Quelle" rows={stats.leadsBySource} labels={SOURCE_LABELS} />
        <KeyTable title="Anfragen nach Leistung" rows={stats.leadsByService} labels={SERVICE_LABELS} />
        <KeyTable title="Pipeline (alle Anfragen)" rows={stats.leadsByStatus} labels={STATUS_LABELS} />
        <KeyTable title="Meistbesuchte Seiten" rows={stats.topPages} />
        <KeyTable title="Herkunft (Verweise)" rows={stats.topReferrers} />
      </div>
      <p className="text-xs text-muted">Statistik ohne Cookies und ohne IP-Speicherung: gezählt werden nur Tag, Seite und verweisende Domain.</p>
    </div>
  );
};

// ------------------------------------------------------------------ leads

const LeadCard: React.FC<{ lead: Lead; onChange: (lead: Lead) => void }> = ({ lead, onChange }) => {
  const [notes, setNotes] = useState(lead.notes ?? '');
  const [saving, setSaving] = useState(false);

  const save = async (changes: Partial<Lead>) => {
    setSaving(true);
    try {
      const { lead: updated } = await api<{ lead: Lead }>('PATCH', `/leads/${lead.id}`, changes);
      onChange(updated);
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className={cardClass}>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
        <div>
          <p className="text-xs text-muted">
            #{lead.id} · {dateTime(lead.created_at)} · {SOURCE_LABELS[lead.source] ?? lead.source} · {SERVICE_LABELS[lead.service] ?? lead.service}
          </p>
          <h3 className="text-lg font-display font-semibold">{lead.name}{lead.company ? ` · ${lead.company}` : ''}</h3>
        </div>
        <div>
          <label htmlFor={`status-${lead.id}`} className="sr-only">Status</label>
          <select
            id={`status-${lead.id}`}
            value={lead.status}
            disabled={saving}
            onChange={(e) => save({ status: e.target.value })}
            className={`${inputClass} w-auto`}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-6 text-sm mb-3">
        {lead.email && <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-2 py-2 text-accent"><Mail aria-hidden="true" className="w-4 h-4" />{lead.email}</a>}
        {lead.phone && <a href={`tel:${lead.phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-2 py-2 text-accent"><Phone aria-hidden="true" className="w-4 h-4" />{lead.phone}</a>}
      </div>
      {lead.message && <p className="text-sm text-muted whitespace-pre-line mb-4">{lead.message}</p>}
      <label htmlFor={`notes-${lead.id}`} className={labelClass}>Notizen</label>
      <textarea
        id={`notes-${lead.id}`}
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => notes !== (lead.notes ?? '') && save({ notes })}
        className={inputClass}
      />
    </article>
  );
};

const Leads: React.FC = () => {
  const [status, setStatus] = useState('');
  const [leads, setLeads] = useState<Lead[]>();

  const load = useCallback(() => {
    api<{ leads: Lead[] }>('GET', `/leads${status ? `?status=${status}` : ''}`).then((d) => setLeads(d.leads));
  }, [status]);
  useEffect(load, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="lead-filter" className="text-sm text-muted">Status</label>
        <select id="lead-filter" value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} w-auto`}>
          <option value="">Alle</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <button type="button" onClick={load} className={smallBtn}><RefreshCw aria-hidden="true" className="w-4 h-4" />Aktualisieren</button>
      </div>
      <p className="text-xs text-muted">
        „Angebot gesendet“ startet automatische Nachfass-Mails nach 2 und 7 Tagen. „Abgeschlossen“ sendet eine Bewertungsanfrage (falls GOOGLE_REVIEW_URL gesetzt ist).
      </p>
      {!leads ? <p className="text-muted">Lädt …</p> : !leads.length ? <p className="text-muted">Keine Anfragen.</p> : (
        leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onChange={(updated) => setLeads((all) => all?.map((l) => (l.id === updated.id ? updated : l)))} />
        ))
      )}
    </div>
  );
};

// ------------------------------------------------------------------ bookings

const Bookings: React.FC = () => {
  const [when, setWhen] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>();

  const load = useCallback(() => {
    api<{ bookings: Booking[] }>('GET', `/bookings?when=${when}`).then((d) => setBookings(d.bookings));
  }, [when]);
  useEffect(load, [load]);

  const cancel = async (booking: Booking) => {
    if (!window.confirm(`Termin von ${booking.name} wirklich absagen? Der Kunde wird per E-Mail informiert.`)) return;
    await api('POST', `/bookings/${booking.id}/cancel`, {});
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2" role="group" aria-label="Zeitraum">
        {(['upcoming', 'past'] as const).map((value) => (
          <button key={value} type="button" aria-pressed={when === value} onClick={() => setWhen(value)}
            className={`${smallBtn} ${when === value ? 'bg-primary text-background border-primary' : ''}`}>
            {value === 'upcoming' ? 'Kommende' : 'Vergangene'}
          </button>
        ))}
      </div>
      {!bookings ? <p className="text-muted">Lädt …</p> : !bookings.length ? <p className="text-muted">Keine Termine.</p> : (
        bookings.map((b) => (
          <article key={b.id} className={`${cardClass} ${b.status === 'cancelled' ? 'opacity-60' : ''}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-lg font-display font-semibold">{formatAppointment(b.start_utc, 'de')}</p>
                <p className="text-sm text-muted">
                  {b.status === 'cancelled' ? 'Abgesagt · ' : ''}{b.source === 'phone' ? 'über KI-Telefon' : 'über Website'} · {SERVICE_LABELS[b.service] ?? b.service}
                </p>
                <p className="mt-2">{b.name}{b.company ? ` · ${b.company}` : ''}</p>
                <div className="flex flex-wrap gap-x-6 text-sm">
                  {b.phone && <a href={`tel:${b.phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-2 py-2 text-accent"><Phone aria-hidden="true" className="w-4 h-4" />{b.phone}</a>}
                  {b.email && <a href={`mailto:${b.email}`} className="inline-flex items-center gap-2 py-2 text-accent"><Mail aria-hidden="true" className="w-4 h-4" />{b.email}</a>}
                </div>
                {b.note && <p className="text-sm text-muted whitespace-pre-line mt-2">{b.note}</p>}
              </div>
              {b.status === 'confirmed' && when === 'upcoming' && (
                <button type="button" onClick={() => cancel(b)} className={smallBtn}>Absagen</button>
              )}
            </div>
          </article>
        ))
      )}
    </div>
  );
};

// ------------------------------------------------------------------ availability

const AvailabilityEditor: React.FC = () => {
  const [settings, setSettings] = useState<Settings>();
  const [rows, setRows] = useState<Availability[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [message, setMessage] = useState('');

  const load = useCallback(() => {
    api<{ settings: Settings; availability: Availability[]; blocks: Block[] }>('GET', '/settings').then((d) => {
      setSettings(d.settings);
      setRows(d.availability);
      setBlocks(d.blocks);
    });
  }, []);
  useEffect(load, [load]);

  if (!settings) return <p className="text-muted">Lädt …</p>;

  const updateRow = (index: number, changes: Partial<Availability>) =>
    setRows((all) => all.map((r, i) => (i === index ? { ...r, ...changes } : r)));

  const save = async () => {
    setMessage('');
    try {
      await api('PUT', '/settings', { settings, availability: rows });
      setMessage('Gespeichert.');
      load();
    } catch {
      setMessage('Speichern fehlgeschlagen – bitte Zeiten prüfen (Beginn vor Ende).');
    }
  };

  const addBlock = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const toIso = (value: FormDataEntryValue | null) => new Date(String(value)).toISOString();
    await api('POST', '/blocks', { start: toIso(form.get('start')), end: toIso(form.get('end')), reason: form.get('reason') });
    event.currentTarget.reset();
    load();
  };

  const removeBlock = async (id: number) => {
    await api('DELETE', `/blocks/${id}`);
    load();
  };

  return (
    <div className="space-y-8">
      <section className={cardClass}>
        <h3 className="font-display font-semibold mb-4">Wöchentliche Zeiten</h3>
        <div className="space-y-3">
          {rows
            .map((row, index) => ({ row, index }))
            .sort((a, b) => WEEK_ORDER.indexOf(a.row.weekday) - WEEK_ORDER.indexOf(b.row.weekday) || a.row.start_min - b.row.start_min)
            .map(({ row, index }) => (
              <div key={index} className="flex flex-wrap items-center gap-3">
                <label className="sr-only" htmlFor={`wd-${index}`}>Wochentag</label>
                <select id={`wd-${index}`} value={row.weekday} onChange={(e) => updateRow(index, { weekday: Number(e.target.value) })} className={`${inputClass} w-40`}>
                  {WEEK_ORDER.map((d) => <option key={d} value={d}>{WEEKDAYS[d]}</option>)}
                </select>
                <label className="sr-only" htmlFor={`from-${index}`}>Von</label>
                <input id={`from-${index}`} type="time" value={toTime(row.start_min)} onChange={(e) => updateRow(index, { start_min: fromTime(e.target.value) })} className={`${inputClass} w-32`} />
                <span aria-hidden="true">–</span>
                <label className="sr-only" htmlFor={`to-${index}`}>Bis</label>
                <input id={`to-${index}`} type="time" value={toTime(row.end_min)} onChange={(e) => updateRow(index, { end_min: fromTime(e.target.value) })} className={`${inputClass} w-32`} />
                <button type="button" onClick={() => setRows((all) => all.filter((_, i) => i !== index))} className={smallBtn}>Entfernen</button>
              </div>
            ))}
        </div>
        <button type="button" onClick={() => setRows((all) => [...all, { weekday: 1, start_min: 540, end_min: 1020 }])} className={`${smallBtn} mt-4`}>
          + Zeitfenster
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div>
            <label htmlFor="slot-minutes" className={labelClass}>Termindauer</label>
            <select id="slot-minutes" value={settings.slotMinutes} onChange={(e) => setSettings({ ...settings, slotMinutes: Number(e.target.value) })} className={inputClass}>
              {[15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} Minuten</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="min-notice" className={labelClass}>Vorlauf (Stunden)</label>
            <input id="min-notice" type="number" min={0} max={168} value={settings.minNoticeHours} onChange={(e) => setSettings({ ...settings, minNoticeHours: Number(e.target.value) })} className={inputClass} />
          </div>
          <div>
            <label htmlFor="max-days" className={labelClass}>Buchbar bis (Tage)</label>
            <input id="max-days" type="number" min={1} max={180} value={settings.maxDaysAhead} onChange={(e) => setSettings({ ...settings, maxDaysAhead: Number(e.target.value) })} className={inputClass} />
          </div>
        </div>
        <div className="flex items-center gap-4 mt-6">
          <button type="button" onClick={save} className="btn-primary">Speichern</button>
          {message && <p role="status" className="text-sm text-muted">{message}</p>}
        </div>
      </section>

      <section className={cardClass}>
        <h3 className="font-display font-semibold mb-4">Abwesenheiten & Sperrzeiten</h3>
        <form onSubmit={addBlock} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end mb-6">
          <div>
            <label htmlFor="block-start" className={labelClass}>Von</label>
            <input id="block-start" name="start" type="datetime-local" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="block-end" className={labelClass}>Bis</label>
            <input id="block-end" name="end" type="datetime-local" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="block-reason" className={labelClass}>Grund</label>
            <input id="block-reason" name="reason" placeholder="z. B. Urlaub" className={inputClass} />
          </div>
          <button type="submit" className="btn-primary">Hinzufügen</button>
        </form>
        {blocks.length ? (
          <ul className="divide-y divide-border">
            {blocks.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
                <span>{dateTime(b.start_utc)} – {dateTime(b.end_utc)}{b.reason ? ` · ${b.reason}` : ''}</span>
                <button type="button" onClick={() => removeBlock(b.id)} className={smallBtn}>Entfernen</button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Keine Sperrzeiten.</p>
        )}
      </section>
    </div>
  );
};

// ------------------------------------------------------------------ page

const TABS = [
  ['overview', 'Übersicht'],
  ['leads', 'Anfragen'],
  ['bookings', 'Termine'],
  ['availability', 'Verfügbarkeit'],
] as const;
type Tab = (typeof TABS)[number][0];

const AdminPage: React.FC = () => {
  const [auth, setAuth] = useState<'checking' | 'in' | 'out'>('checking');
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    api('GET', '/me').then(() => setAuth('in'), () => setAuth('out'));
    const expired = () => setAuth('out');
    window.addEventListener('admin-unauthorized', expired);
    return () => window.removeEventListener('admin-unauthorized', expired);
  }, []);

  const logout = async () => {
    await api('POST', '/logout', {}).catch(() => undefined);
    setAuth('out');
  };

  return (
    <section className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        {auth === 'checking' && <p className="text-muted">Lädt …</p>}
        {auth === 'out' && <Login onLogin={() => setAuth('in')} />}
        {auth === 'in' && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <h1 className="text-2xl md:text-3xl font-display font-bold">
                WEST<span className="text-accent italic font-normal">AGENTUR</span> Admin
              </h1>
              <button type="button" onClick={logout} className={smallBtn}><LogOut aria-hidden="true" className="w-4 h-4" />Abmelden</button>
            </div>
            <nav aria-label="Bereiche" className="flex gap-2 overflow-x-auto mb-8 border-b border-border">
              {TABS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-current={tab === value ? 'page' : undefined}
                  onClick={() => setTab(value)}
                  className={`shrink-0 min-h-[44px] px-4 font-display border-b-2 -mb-px transition-colors ${
                    tab === value ? 'border-accent text-primary' : 'border-transparent text-muted hover:text-primary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
            {tab === 'overview' && <Overview />}
            {tab === 'leads' && <Leads />}
            {tab === 'bookings' && <Bookings />}
            {tab === 'availability' && <AvailabilityEditor />}
          </>
        )}
      </div>
    </section>
  );
};

export default AdminPage;
