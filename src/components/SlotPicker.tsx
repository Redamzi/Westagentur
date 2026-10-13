import React, { useCallback, useEffect, useState } from 'react';
import { BOOKING_TEXT, formatSlot } from '../content/booking';
import type { Lang } from '../seo/site';

interface SlotDay {
  date: string;
  slots: string[];
}

interface SlotPickerProps {
  lang: Lang;
  selected?: string;
  onSelect: (start: string, timeZone: string) => void;
  /** Change this value to force a reload (e.g. after a slot was taken). */
  reloadKey?: number;
}

const SlotPicker: React.FC<SlotPickerProps> = ({ lang, selected, onSelect, reloadKey = 0 }) => {
  const text = BOOKING_TEXT[lang];
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [days, setDays] = useState<SlotDay[]>([]);
  const [timeZone, setTimeZone] = useState('Europe/Berlin');
  const [activeDate, setActiveDate] = useState<string>();

  const load = useCallback(async () => {
    setState('loading');
    try {
      const res = await fetch('/api/slots?days=31');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDays(data.days);
      setTimeZone(data.timezone);
      setActiveDate((current) => (data.days.some((d: SlotDay) => d.date === current) ? current : data.days[0]?.date));
      setState('ready');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  if (state === 'loading') return <p className="text-muted" role="status">{text.loading}</p>;
  if (state === 'error') {
    return (
      <div role="alert" className="text-muted">
        {text.loadError}{' '}
        <button onClick={load} className="text-accent underline underline-offset-2 min-h-[44px]">{text.retry}</button>
      </div>
    );
  }
  if (!days.length) return <p className="text-muted">{text.noSlots}</p>;

  const active = days.find((d) => d.date === activeDate) ?? days[0];
  const dayLabel = (date: string) => {
    const noon = `${date}T12:00:00Z`;
    return {
      weekday: formatSlot(noon, lang, 'UTC', { weekday: 'short' }),
      day: formatSlot(noon, lang, 'UTC', { day: 'numeric', month: 'short' }),
    };
  };

  return (
    <div>
      <h2 className="text-lg font-display font-semibold text-primary mb-4">{text.chooseDay}</h2>
      <div role="group" aria-label={text.chooseDay} className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-1 px-1">
        {days.map((d) => {
          const label = dayLabel(d.date);
          const isActive = d.date === active.date;
          return (
            <button
              key={d.date}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveDate(d.date)}
              className={`shrink-0 min-w-[72px] px-3 py-3 border text-center transition-colors ${
                isActive ? 'bg-primary text-background border-primary' : 'bg-surface text-primary border-border hover:border-primary'
              }`}
            >
              <span className="block text-xs uppercase tracking-widest opacity-80">{label.weekday}</span>
              <span className="block font-display font-semibold">{label.day}</span>
            </button>
          );
        })}
      </div>

      <h2 className="text-lg font-display font-semibold text-primary mb-4">{text.chooseTime}</h2>
      <div role="group" aria-label={text.chooseTime} className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {active.slots.map((iso) => {
          const isSelected = iso === selected;
          return (
            <button
              key={iso}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(iso, timeZone)}
              className={`min-h-[44px] px-2 py-2 border font-display font-medium transition-colors ${
                isSelected ? 'bg-accent text-surface border-accent' : 'bg-surface text-primary border-border hover:border-accent hover:text-accent'
              }`}
            >
              {formatSlot(iso, lang, timeZone, { hour: '2-digit', minute: '2-digit' })}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-muted mt-4">{text.timezone}</p>
    </div>
  );
};

export default SlotPicker;
