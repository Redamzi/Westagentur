import React, { useCallback, useState, useEffect, useRef } from 'react';
import type VapiClient from '@vapi-ai/web';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Loader2, MessageSquare, Mic, Phone, PhoneOff } from 'lucide-react';
import { legalPath } from '../seo/pages';
import { useTranslation } from 'react-i18next';
import SectionLabel from '../components/SectionLabel';
import { ChatView, useToniChat } from '../components/toni/ToniChat';
import ChatOverlay from '../components/toni/ChatOverlay';

// Configuration
const VAPI_PUBLIC_KEY = "0439aee3-ffe1-49c9-b7a4-f34a3f128c43";
// Voice assistant (GPT Live). The website chat uses a separate text assistant (server: VAPI_ASSISTANT_ID).
const VAPI_ASSISTANT_ID = "c8a4b33e-6f26-4ab8-adbe-f0c8cf8c4cba";

const MOBILE_QUERY = '(max-width: 1023px)';

/** True below the lg breakpoint (false during prerendering). */
const useIsMobile = () => {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return mobile;
};

const AIAssistant = () => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error' | 'finished'>('idle');
  const [volume, setVolume] = useState(0);
  const vapiRef = useRef<VapiClient | null>(null);
  const { i18n } = useTranslation();
  const de = i18n.language !== 'en';

  const [mode, setMode] = useState<'call' | 'chat'>('call');
  const chat = useToniChat(de ? 'de' : 'en');
  const sending = chat.sending;
  // Smartphone: the chat opens as a full-screen app.
  const [chatOpen, setChatOpen] = useState<false | 'typing' | 'reading'>(false);

  // Smartphone: while scrolling, the Toni card grows into a full-screen app (sticky stage).
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const immersive = isMobile && !reduceMotion;
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const grow = [0.05, 0.45];
  const cardTop = useTransform(scrollYProgress, grow, ['58%', '0%']);
  const cardSide = useTransform(scrollYProgress, grow, [16, 0]);
  const cardRadius = useTransform(scrollYProgress, grow, [28, 0]);
  const cardPadTop = useTransform(scrollYProgress, grow, [20, 88]); // clears the fixed header
  const introOpacity = useTransform(scrollYProgress, [0.05, 0.3], [1, 0]);
  const introY = useTransform(scrollYProgress, [0.05, 0.3], [0, -60]);

  const openChat = (focus: boolean) => {
    setMode('chat');
    if (isMobile) setChatOpen(focus ? 'typing' : 'reading');
  };
  const closeChat = useCallback(() => {
    setChatOpen(false);
    setMode('call');
  }, []);

  const askExample = (example: string) => {
    openChat(false);
    chat.send(example.replace(/[„“”"]/g, ''));
  };

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

  // The Toni card; "fill" = full-screen variant on smartphones (list and waveform grow).
  const renderCard = (fill: boolean) => (
    <>
      {/* Caller card */}
      <div className={`flex items-center gap-4 ${fill ? 'mb-5' : 'mb-8'}`}>
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
            <span aria-hidden="true" className={`w-2 h-2 rounded-full ${mode === 'chat' ? (sending ? 'bg-yellow-400 animate-pulse' : 'bg-accent') : STATUS[status].dot}`} />
            {mode === 'chat'
              ? sending ? (de ? 'Schreibt …' : 'Typing …') : de ? 'Chat bereit' : 'Chat ready'
              : de ? STATUS[status].de : STATUS[status].en}
          </p>
        </div>
      </div>

      {/* Mode switch */}
      <div role="tablist" aria-label={de ? 'Mit Toni sprechen oder schreiben' : 'Talk or write to Toni'} className="grid grid-cols-2 mb-6 border border-border">
        {([
          ['call', Phone, de ? 'Anrufen' : 'Call'],
          ['chat', MessageSquare, de ? 'Schreiben' : 'Write'],
        ] as const).map(([key, Icon, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={mode === key}
            onClick={() => (key === 'chat' ? openChat(true) : setMode(key))}
            className={`min-h-[44px] flex items-center justify-center gap-2 font-display font-semibold transition-colors ${
              mode === key ? 'bg-accent text-background' : 'text-muted hover:text-primary'
            }`}
          >
            <Icon aria-hidden="true" className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {mode === 'call' ? (
        <>
        {/* Waveform */}
        <div aria-hidden="true" className={`${fill ? 'flex-1 min-h-[6rem]' : 'h-24'} mb-8 flex items-center justify-center gap-1.5 border border-border bg-background px-6`}>
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
        </>
      ) : (
        <ChatView chat={chat} examples={EXAMPLES} fill={fill} />
      )}
    </>
  );

  if (immersive) {
    return (
      <section ref={sectionRef} id="ki-assistent" className="section-dark relative h-[260vh] bg-background border-b border-border">
        <div className="sticky top-0 h-[100dvh] overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
          <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] rounded-full bg-accent/15 blur-[120px] pointer-events-none" />

          <motion.div style={{ opacity: introOpacity, y: introY }} className="absolute inset-x-0 top-0 px-6 pt-24">
            <SectionLabel>{de ? 'Live-Demo' : 'Live demo'}</SectionLabel>
            <h2 className="heading-xl text-primary mb-4">
              {de ? 'Sprechen Sie mit ' : 'Talk to '}
              <span className="text-accent italic font-normal">Toni</span>
            </h2>
            <p className="text-muted text-lg leading-relaxed">
              {de
                ? 'Unser KI-Assistent beantwortet Fragen und vereinbart Termine. Weiterscrollen und ausprobieren.'
                : 'Our AI assistant answers questions and books appointments. Keep scrolling and try it.'}
            </p>
          </motion.div>

          <motion.div
            style={{ top: cardTop, left: cardSide, right: cardSide, bottom: cardSide, borderRadius: cardRadius, paddingTop: cardPadTop }}
            className="absolute flex flex-col bg-surface border border-border px-5 pb-5 overflow-hidden shadow-2xl shadow-black"
          >
            {renderCard(true)}
          </motion.div>
        </div>
        <ChatOverlay chat={chat} examples={EXAMPLES} open={chatOpen} onClose={closeChat} />
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="ki-assistent"
      className="section-dark relative section-padding scroll-mt-16 bg-background border-b border-border overflow-hidden"
    >
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
              <li key={example}>
                <button
                  type="button"
                  onClick={() => askExample(example)}
                  disabled={sending}
                  className="px-4 py-2 border border-border text-primary text-sm hover:border-accent hover:text-accent transition-colors"
                >
                  {example}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">
            {de ? 'Antippen, um die Frage im Chat zu stellen – oder einfach anrufen.' : 'Tap to ask in the chat – or simply call.'}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full max-w-md mx-auto lg:ml-auto bg-surface border border-border p-6 md:p-8 shadow-2xl shadow-black"
        >
          {renderCard(false)}
        </motion.div>
      </div>
      <ChatOverlay chat={chat} examples={EXAMPLES} open={chatOpen} onClose={closeChat} />
    </section>
  );
};

export default AIAssistant;
