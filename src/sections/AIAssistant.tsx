import React, { useState, useEffect, useRef } from 'react';
import type VapiClient from '@vapi-ai/web';
import { motion } from 'framer-motion';
import { Phone, PhoneOff, User } from 'lucide-react';
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

  const getStatusText = () => {
    switch (status) {
      case 'idle': return 'BEREIT / READY';
      case 'connecting': return 'VERBINDE / CONNECTING...';
      case 'connected': return 'VERBUNDEN / LIVE';
      case 'finished': return 'BEENDET / ENDED';
      case 'error': return 'FEHLER / ERROR';
      default: return 'BEREIT / READY';
    }
  };

  const getStatusColor = () => {
    if (status === 'connected') return 'text-green-500 border-green-500/50';
    if (status === 'connecting') return 'text-yellow-500 border-yellow-500/50';
    if (status === 'finished') return 'text-muted border-border';
    if (status === 'error') return 'text-red-500 border-red-500/50';
    return 'text-accent border-accent/50';
  };

  return (
    <section id="ki-assistent" className="section-dark relative section-padding scroll-mt-16 bg-background border-b border-border overflow-hidden flex justify-center">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">
        
        <div className="text-center mb-12 md:mb-16">
          <SectionLabel className="justify-center">{de ? 'Live-Demo' : 'Live demo'}</SectionLabel>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="heading-xl text-primary"
          >
            {de ? 'KI' : 'AI'} <span className="text-accent italic font-normal">{de ? 'Assistent' : 'Assistant'}</span>
          </motion.h2>
          <p className="text-muted font-sans text-lg md:text-xl mt-4 max-w-2xl mx-auto">
            {de
              ? 'Testen Sie unsere Sprach-KI live im Browser. Keine Wartezeiten, direktes Feedback.'
              : 'Try our voice AI live in your browser. No waiting, instant feedback.'}
          </p>
        </div>

        {/* Call Interface (Swiss Minimalist Phone UI) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="w-full max-w-md bg-surface border border-border p-6 md:p-8 flex flex-col items-center gap-8 md:gap-10 shadow-2xl shadow-black relative"
        >
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 border border-border flex items-center justify-center bg-background relative overflow-hidden">
              {status === 'connected' && (
                <div 
                  className="absolute inset-0 bg-accent/20"
                  style={{ opacity: Math.max(0.2, volume * 3) }}
                />
              )}
              <User className="w-10 h-10 text-muted relative z-10" />
            </div>
            
            <div className="text-center">
              <h3 className="text-2xl font-display font-bold tracking-widest text-primary uppercase">
                {de ? 'KI-Assistent' : 'AI Assistant'}
              </h3>
              <div className={`mt-2 inline-flex px-3 py-1 border text-xs font-display font-bold tracking-[0.2em] uppercase ${getStatusColor()}`}>
                {getStatusText()}
              </div>
            </div>
          </div>

          {/* Visualizer Middle Area */}
          <div aria-hidden="true" className="w-full h-32 border border-border bg-background flex items-center justify-center relative overflow-hidden">
            {status === 'connected' ? (
              <div 
                className="w-16 h-16 rounded-full bg-accent blur-xl transition-all duration-75"
                style={{ 
                  transform: `scale(${1 + volume * 2})`,
                  opacity: Math.max(0.4, volume * 3)
                }}
              />
            ) : status === 'connecting' ? (
              <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse" />
            ) : (
              <div className="w-4 h-4 bg-border rounded-full" />
            )}
            
            {/* Grid Overlay inside the visualizer */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiMzMzMiLz48L3N2Zz4=')] opacity-50 pointer-events-none" />
          </div>

          {/* Action Buttons */}
          <div className="flex w-full gap-4">
            <button
              onClick={endCall}
              aria-label={de ? 'Gespräch beenden' : 'End call'}
              disabled={status === 'idle' || status === 'finished'}
              className="flex-1 border border-border py-6 flex items-center justify-center text-muted hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <button
              onClick={startCall}
              aria-label={de ? 'Gespräch mit KI-Assistent starten' : 'Start call with AI assistant'}
              disabled={status === 'connected' || status === 'connecting'}
              className="flex-1 border border-border py-6 flex items-center justify-center text-primary bg-white/5 hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/50 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <Phone className="w-6 h-6" />
            </button>
          </div>
          
          <div className="w-full text-center">
            <p className="text-xs font-sans text-muted uppercase tracking-widest">
              Powered by Vapi & OpenAI
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AIAssistant;
