import React, { useState, useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';

// Konfiguration
const VAPI_PUBLIC_KEY = "0439aee3-ffe1-49c9-b7a4-f34a3f128c43";
const VAPI_ASSISTANT_ID = "54f190b2-aeb9-4e8a-b4b6-6731b6db2601";

const vapi = new Vapi(VAPI_PUBLIC_KEY);

const VapiAssistant: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error' | 'finished'>('idle');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [volume, setVolume] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        // Event Listeners definieren
        const onCallStart = () => {
            console.log("Call started");
            setStatus('connected');
            setErrorMsg('');
        };

        const onCallEnd = () => {
            console.log("Call ended");
            setStatus('finished');
            setIsSpeaking(false);
            setVolume(0);
        };

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);
        const onVolumeLevel = (vol: number) => setVolume(vol);

        const onError = (e: any) => {
            console.error("Vapi Error:", e);
            // Ignoriere typische 'Call ended' Fehler, falls sie als Error kommen
            if (e.error?.message?.includes("ended") || e.message?.includes("ended")) {
                setStatus('finished');
                return;
            }
            setStatus('error');
            setErrorMsg(e.error?.message || "Verbindungsfehler");
        };

        // Attach Listeners
        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('volume-level', onVolumeLevel);
        vapi.on('error', onError);

        // Cleanup beim Unmount
        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('volume-level', onVolumeLevel);
            vapi.off('error', onError);
            // Stoppe den Call nur wenn wirklich unmounted wird, um Seiteneffekte zu vermeiden
            try {
                // vapi.stop() hier weglassen, da es manchmal Redirects triggert wenn zu oft gerufen
            } catch (e) { }
        };
    }, []);

    const toggleCall = async () => {
        if (status === 'idle' || status === 'error' || status === 'finished') {
            setStatus('connecting');
            setErrorMsg('');
            try {
                await vapi.start(VAPI_ASSISTANT_ID);
            } catch (err) {
                console.error("Failed to start call", err);
                setStatus('error');
            }
        } else {
            // Kontrolliertes Stoppen
            try {
                vapi.stop();
                setStatus('finished'); // Manuell schon mal setzen für schnelles Feedback
            } catch (e) {
                console.error("Error stopping call", e);
            }
        }
    };

    const resetAssistant = () => {
        setStatus('idle');
    };

    // Bars für Visualizer
    const bars = Array.from({ length: 20 });

    return (
        <div className="w-full max-w-2xl mx-auto mb-16">
            <div className={`relative p-8 rounded-[2rem] cosmic-glass glass-reflection border transition-all duration-500 overflow-hidden shadow-[0_0_50px_rgba(0,242,255,0.1)] ${status === 'connected' ? 'border-cyan-400/50 shadow-[0_0_80px_rgba(0,242,255,0.2)]' : status === 'finished' ? 'border-green-400/50 shadow-[0_0_80px_rgba(34,197,94,0.2)]' : 'border-white/10'}`}>

                {/* Background Glow Animation */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 blur-[80px] rounded-full transition-all duration-1000 ${status === 'connected' ? 'bg-cyan-400/20 scale-150 opacity-80' : status === 'finished' ? 'bg-green-400/20 scale-125 opacity-80' : 'bg-cyan-400/20 scale-50 opacity-0'}`}></div>

                <div className="relative z-10 flex flex-col items-center text-center gap-6">

                    {/* Status Badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-technical uppercase tracking-widest border transition-colors duration-300 ${status === 'connected' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : status === 'finished' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-white/5 text-neutral-400 border-white/10'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status === 'connected' ? 'bg-cyan-400 animate-pulse' : status === 'connecting' ? 'bg-yellow-400 animate-bounce' : status === 'finished' ? 'bg-green-400' : 'bg-neutral-500'}`}></span>
                        {status === 'idle' && 'KI Bereit'}
                        {status === 'connecting' && 'Verbinde...'}
                        {status === 'connected' && 'Live verbunden'}
                        {status === 'finished' && 'Gespräch beendet'}
                        {status === 'error' && 'Fehler'}
                    </div>

                    {status === 'finished' ? (
                        /* Success / Thank you View */
                        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                            <h3 className="text-2xl md:text-3xl font-vanguard font-black text-white italic tracking-wider">
                                Vielen Dank!
                            </h3>
                            <p className="text-neutral-300 font-body text-sm md:text-base max-w-md">
                                Unser Team wurde informiert. Falls Sie einen Termin vereinbart haben, erhalten Sie in Kürze eine Bestätigung per E-Mail.
                            </p>
                            <div className="h-4"></div>
                            <button
                                onClick={resetAssistant}
                                className="group relative px-8 py-4 rounded-xl font-technical font-bold uppercase tracking-[0.15em] text-xs transition-all bg-white text-black hover:bg-cyan-400 active:scale-95"
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                    Zurück zum Start
                                </span>
                            </button>
                        </div>
                    ) : (
                        /* Standard View */
                        <>
                            <div className="flex flex-col items-center gap-2">
                                <h3 className="text-2xl md:text-4xl font-vanguard font-black text-white italic tracking-wider">
                                    KI-Mitarbeiter
                                </h3>
                                <p className="text-neutral-400 font-body text-sm md:text-base max-w-md">
                                    Sprechen Sie jetzt live mit unserer KI. Stellen Sie Fragen zu unseren Services oder vereinbaren Sie einen Termin.
                                </p>
                            </div>

                            {/* Visualizer Circle */}
                            <div className="relative h-24 flex items-center justify-center gap-1">
                                {status === 'connected' ? (
                                    bars.map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-1.5 bg-cyan-400 rounded-full transition-all duration-75"
                                            style={{
                                                height: `${Math.max(10, volume * 100 * (Math.random() + 0.5))}%`,
                                                opacity: Math.max(0.3, volume * 2)
                                            }}
                                        ></div>
                                    ))
                                ) : (
                                    <div className="h-1 w-32 bg-white/10 rounded-full"></div>
                                )}
                            </div>

                            {/* Call Action Button */}
                            <button
                                onClick={toggleCall}
                                disabled={status === 'connecting'}
                                className={`group relative px-10 py-5 rounded-xl font-technical font-bold uppercase tracking-[0.15em] text-sm transition-all active:scale-95 ${status === 'connected' ? 'bg-red-500/80 hover:bg-red-500 text-white' : 'bg-white text-black hover:bg-cyan-400 hover:text-black'}`}
                            >
                                {status === 'connecting' && (
                                    <span className="absolute inset-0 flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </span>
                                )}
                                <span className={status === 'connecting' ? 'opacity-0' : 'opacity-100 flex items-center gap-3'}>
                                    {status === 'connected' ? (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                            Auflegen
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                            Jetzt Sprechen
                                        </>
                                    )}
                                </span>
                            </button>
                        </>
                    )}

                    {errorMsg && (
                        <p className="text-red-400 text-xs font-technical uppercase tracking-wider">{errorMsg}</p>
                    )}

                </div>
            </div>

            <p className="text-center text-neutral-600 text-[10px] font-technical mt-4 uppercase tracking-widest leading-relaxed">
                Powered by Vapi & OpenAI Realtime API <br />
                Erlauben Sie Zugriff auf Ihr Mikrofon für das Gespräch.
            </p>
        </div>
    );
};

export default VapiAssistant;
