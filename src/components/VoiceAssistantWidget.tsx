import React, { useState, useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';

// Vapi Configuration
const VAPI_PUBLIC_KEY = "0439aee3-ffe1-49c9-b7a4-f34a3f128c43";
const VAPI_ASSISTANT_ID = "54f190b2-aeb9-4e8a-b4b6-6731b6db2601";

const vapi = new Vapi(VAPI_PUBLIC_KEY);

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceAssistantWidget: React.FC<Props> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<'ready' | 'connecting' | 'active' | 'error' | 'finished'>('ready');
  const [volume, setVolume] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle Vapi Events
  useEffect(() => {
    const onCallStart = () => {
      console.log("Call started");
      setStatus('active');
    };

    const onCallEnd = () => {
      console.log("Call ended");
      setStatus('finished');
      setVolume(0);
      setIsSpeaking(false);
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    const onVolumeLevel = (vol: number) => {
      // Vapi returns volume 0-1 usually, mostly low. Boost for visualization.
      setVolume(vol);
    };

    const onError = (e: any) => {
      console.error("Vapi Error:", e);
      if (e.error?.message?.includes("ended") || e.message?.includes("ended")) {
        setStatus('finished');
        return;
      }
      setStatus('error');
    };

    // Attach Listeners
    vapi.on('call-start', onCallStart);
    vapi.on('call-end', onCallEnd);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);
    vapi.on('volume-level', onVolumeLevel);
    vapi.on('error', onError);

    return () => {
      vapi.off('call-start', onCallStart);
      vapi.off('call-end', onCallEnd);
      vapi.off('speech-start', onSpeechStart);
      vapi.off('speech-end', onSpeechEnd);
      vapi.off('volume-level', onVolumeLevel);
      vapi.off('error', onError);
    };
  }, []);

  // Cleanup call on unmount or close
  useEffect(() => {
    if (!isOpen && status === 'active') {
      // Optional: Hang up when closing modal? 
      // For now, we prefer manual hangup, but let's reset visual state if needed.
    }
  }, [isOpen]);

  // Orb Visualization Loop
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const isUserActive = isSpeaking || volume > 0.01;

      // Base Radius
      let radius = 12;
      let color = '#bc13fe'; // Idle Purple
      let glow = 10;

      if (isUserActive) {
        // ACTIVE: Cyan, pulsed by volume
        radius = 14 + (volume * 60); // Even smaller sensitivity
        color = '#00f2ff';
        glow = 20 + (volume * 40);
      } else {
        // IDLE: Breathing
        const time = Date.now() / 1000;
        radius = 12 + Math.sin(time * 2) * 1.5;
        glow = 10 + Math.sin(time * 2) * 3;
      }

      // Draw Glow
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius * 1.5);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw Core
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowBlur = glow;
      ctx.shadowColor = color;
      ctx.fill();
      ctx.shadowBlur = 0; // Reset

      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [isOpen, status, volume, isSpeaking]);

  if (!isOpen) return null;

  const toggleCall = async () => {
    if (status === 'active') {
      try {
        await vapi.stop();
        setStatus('finished'); // Optimistic update
      } catch (err) {
        console.error(err);
      }
    } else {
      setStatus('connecting');
      try {
        await vapi.start(VAPI_ASSISTANT_ID);
      } catch (err) {
        console.error("Failed to start", err);
        setStatus('error');
      }
    }
  };

  const handleClose = () => {
    if (status === 'active') {
      vapi.stop();
    }
    onClose();
    // Reset after closing
    setTimeout(() => setStatus('ready'), 300);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-entrance">
      {/* Outer Phone Wrapper */}
      <div className="relative w-[320px] md:w-[380px] h-[85vh] max-h-[650px] md:h-[780px] md:max-h-[780px] bg-[#050505] rounded-[3.5rem] p-3 shadow-[0_0_100px_rgba(0,242,255,0.15)] border-[8px] border-[#1a1a1a] flex flex-col items-center overflow-hidden transition-all duration-700">

        {/* Hardware details */}
        <div className="absolute top-[150px] -left-2 w-1 h-12 bg-[#1a1a1a] rounded-r-lg"></div> {/* Vol Up */}
        <div className="absolute top-[210px] -left-2 w-1 h-12 bg-[#1a1a1a] rounded-r-lg"></div> {/* Vol Down */}
        <div className="absolute top-[180px] -right-2 w-1 h-16 bg-[#1a1a1a] rounded-l-lg"></div> {/* Power */}

        {/* Display Content */}
        <div className="relative w-full h-full bg-[#010103] rounded-[2.8rem] overflow-hidden flex flex-col items-center pt-6 px-6">

          {/* Dynamic Island */}
          <div className="w-24 h-7 bg-black rounded-full flex items-center justify-center gap-2 mb-2 z-20 shrink-0">
            {isSpeaking && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>}
            <div className="w-2 h-2 bg-white/10 rounded-full"></div>
          </div>

          {/* Caller Info */}
          <div className="mt-2 flex flex-col items-center shrink-0">
            <div className={`w-20 h-20 md:w-32 md:h-32 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-full flex items-center justify-center mb-2 shadow-[0_0_40px_rgba(188,19,254,0.3)] transition-all duration-500 ${isSpeaking ? 'scale-110 shadow-[0_0_60px_rgba(188,19,254,0.6)]' : ''}`}>
              <svg className="w-10 h-10 md:w-16 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-white font-vanguard font-black text-xl md:text-3xl uppercase italic tracking-wider mb-1">KI-Assistent</h2>
            <p className="text-neutral-500 font-technical text-[10px] uppercase tracking-[0.2em] h-4">
              {status === 'connecting' ? 'Verbinde...' : status === 'active' ? (isSpeaking ? 'Sarah spricht...' : 'Hört zu...') : status === 'finished' ? 'Beendet' : 'Bereit'}
            </p>
          </div>

          {/* Spacer for visual balance */}
          <div className="flex-1 w-full flex flex-col justify-center items-center gap-2 min-h-0">
            {/* Visualizer Container - Responsive Height */}
            <div className="w-[280px] md:w-[300px] h-[100px] md:h-[150px] flex-none overflow-hidden rounded-full relative flex items-center justify-center border border-white/5 bg-white/5 backdrop-blur-sm shadow-inner transition-all">
              <canvas
                ref={canvasRef}
                width={300}
                height={150}
                className="w-full h-full opacity-90 object-contain"
              />
            </div>

            {/* Status Text Area */}
            <div className="h-6 flex items-center justify-center shrink-0">
              {status === 'active' && !isSpeaking && (
                <p className="text-cyan-400 font-body italic text-xs md:text-sm animate-pulse">
                  Sprechen Sie jetzt...
                </p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="w-full pb-8 flex flex-col items-center gap-4 shrink-0">
            <div className="grid grid-cols-3 w-full max-w-[200px] md:max-w-[240px] gap-3 mb-2">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-square rounded-full bg-white/5 flex items-center justify-center text-white/20 text-[10px] md:text-xs">
                  •
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center w-full max-w-[200px]">
              {/* Decline / Close */}
              <button
                onClick={handleClose}
                className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
              >
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Accept / Start */}
              <button
                onClick={toggleCall}
                disabled={status === 'connecting'}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all ${status === 'active' ? 'bg-cyan-500 text-white shadow-[0_0_30px_#00f2ff]' : 'bg-green-500 text-white hover:bg-green-400'}`}
              >
                {status === 'connecting' ? (
                  <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
                    {status === 'active' ? (
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    ) : (
                      <path d="M6.62 10.79a15.15 15.15 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27 11.72 11.72 0 003.7.59 1 1 0 011 1V20a1 1 0 01-1 1A16 16 0 013 5a1 1 0 011-1h3.41a1 1 0 011 1 11.72 11.72 0 00.59 3.7 1 1 0 01-.27 1.11l-2.2 2.2z" />
                    )}
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Home Bar */}
          <div className="absolute bottom-2 w-32 h-1 bg-white/20 rounded-full"></div>
        </div>
      </div>

      {/* Floating Info */}
      <div className="absolute bottom-10 text-center pointer-events-none opacity-40">
        <p className="font-technical text-[9px] text-white uppercase tracking-[0.3em]">
          End-to-End Encrypted Session
        </p>
      </div>
    </div>
  );
};

export default VoiceAssistantWidget;
