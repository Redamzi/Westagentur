import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SlotPicker from '../components/SlotPicker';
import { errorClass } from '../components/formStyles';
import { BOOKING_PATHS, BOOKING_TEXT, formatAppointment } from '../content/booking';
import type { Lang } from '../seo/site';

interface Booking {
  start_utc: string;
  status: 'confirmed' | 'cancelled';
  name: string;
}

const ManageBookingPage: React.FC<{ lang: Lang }> = ({ lang }) => {
  const text = BOOKING_TEXT[lang];
  const [token, setToken] = useState('');
  const [booking, setBooking] = useState<Booking | null>();
  const [mode, setMode] = useState<'view' | 'reschedule'>('view');
  const [newSlot, setNewSlot] = useState<string>();
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string }>();
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('t') ?? '';
    setToken(t);
    if (!t) {
      setBooking(null);
      return;
    }
    fetch(`/api/bookings/${encodeURIComponent(t)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setBooking(data.booking))
      .catch(() => setBooking(null));
  }, []);

  const post = async (action: 'cancel' | 'reschedule', body: object) => {
    setBusy(true);
    setMessage(undefined);
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(token)}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setBooking(data.booking);
        setMode('view');
        setNewSlot(undefined);
        setMessage({ kind: 'ok', text: action === 'cancel' ? text.cancelled : text.rescheduled });
      } else if (data.error === 'slot_taken') {
        setNewSlot(undefined);
        setReloadKey((k) => k + 1);
        setMessage({ kind: 'error', text: text.taken });
      } else {
        setMessage({ kind: 'error', text: text.loadError });
      }
    } finally {
      setBusy(false);
    }
  };

  const isPast = booking ? Date.parse(booking.start_utc) < Date.now() : false;

  return (
    <section className="pt-28 md:pt-40 pb-20 md:pb-32 bg-background">
      <div className="container mx-auto px-6 max-w-3xl">
        <h1 className="heading-section mb-10">{text.manageTitle}</h1>

        {booking === undefined && <p className="text-muted" role="status">{text.manageLoading}</p>}
        {booking === null && <p className="text-muted">{text.manageNotFound}</p>}

        {booking && (
          <div className="space-y-8">
            <div className="bg-surface border border-border p-6 md:p-8">
              <p className="text-sm text-muted mb-1">
                {booking.status === 'confirmed' ? text.statusConfirmed : text.statusCancelled}
              </p>
              <p className={`text-xl md:text-2xl font-display font-semibold ${booking.status === 'cancelled' ? 'text-muted line-through' : 'text-primary'}`}>
                {formatAppointment(booking.start_utc, lang)}
              </p>
            </div>

            {message && (
              <p role={message.kind === 'error' ? 'alert' : 'status'} className={message.kind === 'error' ? errorClass : 'text-primary'}>
                {message.text}
              </p>
            )}

            {booking.status === 'confirmed' && isPast && <p className="text-muted">{text.pastNotice}</p>}

            {booking.status === 'confirmed' && !isPast && mode === 'view' && (
              <div className="flex flex-col sm:flex-row gap-4">
                <button type="button" onClick={() => setMode('reschedule')} className="btn-primary">{text.reschedule}</button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => window.confirm(text.cancelConfirm) && post('cancel', {})}
                  className="btn-ghost"
                >
                  {text.cancel}
                </button>
              </div>
            )}

            {booking.status === 'confirmed' && mode === 'reschedule' && (
              <div className="space-y-6">
                <SlotPicker lang={lang} selected={newSlot} onSelect={(start) => setNewSlot(start)} reloadKey={reloadKey} />
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    disabled={!newSlot || busy}
                    onClick={() => newSlot && post('reschedule', { start: newSlot })}
                    className="btn-primary disabled:opacity-50"
                  >
                    {text.rescheduleConfirm}
                  </button>
                  <button type="button" onClick={() => setMode('view')} className="btn-ghost">{text.back}</button>
                </div>
              </div>
            )}

            {booking.status === 'cancelled' && (
              <Link to={BOOKING_PATHS[lang].book} className="btn-primary">{text.bookNew}</Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ManageBookingPage;
