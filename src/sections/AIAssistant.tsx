import React, { useState, useEffect, useRef } from 'react';
import type VapiClient from '@vapi-ai/web';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Loader2, Mic, Phone, PhoneOff } from 'lucide-react';
import { legalPath } from '../seo/pages';
import { useTranslation } from 'react-i18next';
import SectionLabel from '../components/SectionLabel';

// Configuration
const VAPI_PUBLIC_KEY = "0439aee3-ffe1-49c9-b7a4-f34a3f128c43";
const VAPI_ASSISTANT_ID = "54f190b2-aeb9-4e8a-b4b6-6731b6db2601";

const AIAssistant = () => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error' | 'finished'>('idle');
  const [volume, setVolume] = useState(0);
  const vapiRef = useRef<VapiClient | null>(null);
  const { i18n } = useTranslation();
  const de = i18n.language !== 'en';

  // The Vapi SDK is large, so it is only loaded when a call is started.
  const getVapi = async () => {
    if (vapiRef.current) return vapiRef.current;
    const { default: Vapi } = await import('@vapi-ai/web');
    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    vapi.on('call-start', () => setStatus('connected'));
    vapi.on('call-end', () => {
      setStatus('finished');
      setVolume(0);
    });
    vapi.on('volume-level', (vol: number) => setVolume(vol));
    vapi.on('error', (e: any) => {
      if (e.error?.message?.includes("ended") || e.message?.includes("ended")) {
        setStatus('finished');
        return;
      }
      setStatus('error');
    });
    vapiRef.current = vapi;
    return vapi;
  };

  useEffect(() => () => {
    vapiRef.current?.stop();
  }, []);

  const startCall = async () => {
    if (status === 'connecting' || status === 'connected') return;
    setStatus('connecting');
    try {
      const vapi = await getVapi();
      await vapi.start(VAPI_ASSISTANT_ID);
    } catch (err) {
      console.error("Failed to start call", err);
      setStatus('error');
    }
  };

  const endCall = () => {
    if (status === 'connected' || status === 'connecting') {
      try {
        vapiRef.current?.stop();
      } catch (e) {
        console.error("Error stopping call", e);
      }
      setStatus('finished');
    }
  };

  const live = status === 'connected';
  const busy = status === 'connecting';

  const STATUS: Record<typeof status, { de: string; en: string; dot: string }> = {
    idle: { de: 'Bereit', en: 'Ready', dot: 'bg-accent' },
    connecting: { de: 'Verbinde …', en: 'Connecting …', dot: 'bg-yellow-400 animate-pulse' },
    connected: { de: 'Live – sprechen Sie einfach', en: 'Live – just start talking', dot: 'bg-green-400 animate-pulse' },
    finished: { de: 'Gespräch beendet', en: 'Call ended', dot: 'bg-muted' },
    error: { de: 'Verbindung fehlgeschlagen', en: 'Connection failed', dot: 'bg-red-500' },
  };

  const EXAMPLES = de
    ? ['„Was kostet eine Website?“', '„Ich hätte gern einen Termin.“', '„Was kann KI-Telefonie?“']
    : ['“How much is a website?”', '“I would like an appointment.”', '“What can AI telephony do?”'];

  // Waveform: bar heights follow the call volume; a calm pattern while idle.
  const BARS = [0.35, 0.6, 0.85, 0.5, 1, 0.7, 0.4, 0.9, 0.55, 0.8, 0.45, 0.65, 0.3];

  return (
    <section id="ki-assistent" className="section-dark relative section-padding scroll-mt-16 bg-background border-b border-border overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-accent/10 blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <SectionLabel>{de ? 'Live-Demo' : 'Live demo'}</SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="heading-xl text-primary mb-6"
          >
            {de ? 'Sprechen Sie mit ' : 'Talk to '}
            <span className="text-accent italic font-normal">Toni</span>
          </motion.h2>
          <p className="text-muted text-lg md:text-xl max-w-xl leading-relaxed mb-8">
            {de
              ? 'Toni ist unser KI-Telefonassistent. Er beantwortet Fragen, kennt unsere Leistungen und vereinbart Termine – genau so könnte er auch für Ihr Unternehmen ans Telefon gehen.'
              : 'Toni is our AI phone assistant. He answers questions, knows our services and books appointments – just like he could answer the phone for your business.'}
          </p>
          <p className="text-sm font-display font-bold uppercase tracking-widest text-muted mb-3">
            {de ? 'Probieren Sie zum Beispiel' : 'For example, try'}
          </p>
          <ul className="flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <li key={example} className="px-4 py-2 border border-border text-primary text-sm">{example}</li>
            ))}
          </ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full max-w-md mx-auto lg:ml-auto bg-surface border border-border p-6 md:p-8 shadow-2xl shadow-black"
        >
          {/* Caller card */}
          <div className="flex items-center gap-4 mb-8">
            <div className="relative shrink-0">
              {live && <span aria-hidden="true" className="absolute inset-0 rounded-full bg-accent/40 animate-ping" />}
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-accent to-[#0E7490] flex items-center justify-center text-2xl font-display font-bold text-background">
                T
              </div>
            </div>
            <div className="min-w-0">
              <h3 className="text-2xl font-display font-bold text-primary">Toni</h3>
              <p className="text-sm text-muted">{de ? 'KI-Assistent der Westagentur' : 'AI assistant at Westagentur'}</p>
              <p role="status" className="mt-2 inline-flex items-center gap-2 text-sm text-primary">
                <span aria-hidden="true" className={`w-2 h-2 rounded-full ${STATUS[status].dot}`} />
                {de ? STATUS[status].de : STATUS[status].en}
              </p>
            </div>
          </div>

          {/* Waveform */}
          <div aria-hidden="true" className="h-24 mb-8 flex items-center justify-center gap-1.5 border border-border bg-background px-6">
            {BARS.map((factor, i) => {
              const level = live ? Math.min(1, 0.12 + volume * 2.4 * factor) : busy ? 0.25 : 0.1 + factor * 0.08;
              return (
                <span
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-100 ${live ? 'bg-accent' : 'bg-border'} ${busy ? 'animate-pulse' : ''}`}
                  style={{ height: `${Math.round(level * 100)}%` }}
                />
              );
            })}
          </div>

          {/* Call button */}
          {live || busy ? (
            <button
              type="button"
              onClick={endCall}
              className="w-full min-h-[56px] flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white font-display font-semibold text-lg transition-colors"
            >
              {busy ? <Loader2 aria-hidden="true" className="w-5 h-5 animate-spin" /> : <PhoneOff aria-hidden="true" className="w-5 h-5" />}
              {busy ? (de ? 'Abbrechen' : 'Cancel') : de ? 'Gespräch beenden' : 'End call'}
            </button>
          ) : (
            <button
              type="button"
              onClick={startCall}
              className="w-full min-h-[56px] flex items-center justify-center gap-3 bg-accent hover:bg-accent/85 text-background font-display font-semibold text-lg transition-colors"
            >
              <Phone aria-hidden="true" className="w-5 h-5" />
              {status === 'finished' || status === 'error'
                ? de ? 'Erneut mit Toni sprechen' : 'Talk to Toni again'
                : de ? 'Gespräch mit Toni starten' : 'Start talking to Toni'}
            </button>
          )}

          <p className="mt-5 flex gap-2 text-xs text-muted leading-relaxed">
            <Mic aria-hidden="true" className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              {de
                ? 'Ihr Mikrofon wird erst nach dem Klick genutzt. Die Sprache wird über Vapi und OpenAI (USA) verarbeitet. '
                : 'Your microphone is only used after you click. Speech is processed by Vapi and OpenAI (USA). '}
              <Link to={legalPath('privacy')} className="underline underline-offset-2 hover:text-primary">
                {de ? 'Datenschutz' : 'Privacy policy'}
              </Link>
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AIAssistant;
