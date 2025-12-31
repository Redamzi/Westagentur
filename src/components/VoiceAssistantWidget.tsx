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

  // Canvas Visualization Loop
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let offset = 0;

    const drawWave = (offset: number, amplitude: number, frequency: number, color: string, opacity: number) => {
      if (!ctx || !canvas) return;
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.globalAlpha = opacity;

      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.sin(x * frequency + offset) * amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate amplitude based on volume
      // Base 'breathing' amplitude when connected but silent: 5
      // Active speaking adds substantial amplitude
      const targetAmp = status === 'active'
        ? 5 + (volume * 150) // Adjust multiplier based on observed Vapi volume levels
        : 2;

      // Multi-layer waves
      drawWave(offset, targetAmp, 0.03, '#00f2ff', 0.8);
      drawWave(offset * 0.8, targetAmp * 0.7, 0.04, '#bc13fe', 0.5);
      drawWave(offset * 1.2, targetAmp * 0.5, 0.02, '#ffffff', 0.3);

      // Speed up when speaking
      const speed = (status === 'active' && volume > 0.05) ? 0.2 : 0.05;
      offset += speed;

      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [isOpen, status, volume]);

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
      <div className="relative w-[320px] md:w-[380px] h-[650px] md:h-[780px] bg-[#050505] rounded-[3.5rem] p-3 shadow-[0_0_100px_rgba(0,242,255,0.15)] border-[8px] border-[#1a1a1a] flex flex-col items-center overflow-hidden transition-all duration-700">

        {/* Hardware details */}
        <div className="absolute top-[150px] -left-2 w-1 h-12 bg-[#1a1a1a] rounded-r-lg"></div> {/* Vol Up */}
        <div className="absolute top-[210px] -left-2 w-1 h-12 bg-[#1a1a1a] rounded-r-lg"></div> {/* Vol Down */}
        <div className="absolute top-[180px] -right-2 w-1 h-16 bg-[#1a1a1a] rounded-l-lg"></div> {/* Power */}

        {/* Display Content */}
        <div className="relative w-full h-full bg-[#010103] rounded-[2.8rem] overflow-hidden flex flex-col items-center pt-6 px-6">

          {/* Dynamic Island */}
          <div className="w-24 h-7 bg-black rounded-full flex items-center justify-center gap-2 mb-10 z-20">
            {isSpeaking && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>}
            <div className="w-2 h-2 bg-white/10 rounded-full"></div>
          </div>

          {/* Caller Info */}
          <div className="mt-8 flex flex-col items-center">
            <div className={`w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(188,19,254,0.3)] transition-all duration-500 ${isSpeaking ? 'scale-110 shadow-[0_0_60px_rgba(188,19,254,0.6)]' : ''}`}>
              <svg className="w-12 h-12 md:w-16 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-white font-vanguard font-black text-2xl md:text-3xl uppercase italic tracking-wider mb-2">KI-Assistent</h2>
            <p className="text-neutral-500 font-technical text-[10px] uppercase tracking-[0.2em] h-4">
              {status === 'connecting' ? 'Verbinde...' : status === 'active' ? (isSpeaking ? 'Sarah spricht...' : 'Hört zu...') : status === 'finished' ? 'Beendet' : 'Bereit'}
            </p>
          </div>

          {/* Spacer for visual balance */}
          <div className="flex-1 w-full flex flex-col justify-center items-center">
            {/* Visualizer */}
            <canvas
              ref={canvasRef}
              width={300}
              height={150}
              className="w-full h-32 opacity-80"
            />
            {status === 'active' && !isSpeaking && (
              <p className="text-cyan-400 font-body italic text-sm mt-4 animate-pulse">
                Sprechen Sie jetzt...
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="w-full pb-16 flex flex-col items-center gap-8">
            <div className="grid grid-cols-3 w-full max-w-[240px] gap-4 mb-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-square rounded-full bg-white/5 flex items-center justify-center text-white/20 text-xs">
                  •
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center w-full max-w-[200px]">
              {/* Decliine / Close */}
              <button
                onClick={handleClose}
                className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
              >
                <svg className={`w-8 h-8 ${status !== 'active' ? 'rotate-0' : 'rotate-[135deg]'}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d={status !== 'active'
                    ? "M6 18L18 6M6 6l12 12" // X-Icon when not active (just close)
                    : "M6.62 10.79a15.15 15.15 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27 11.72 11.72 0 003.7.59 1 1 0 011 1V20a1 1 0 01-1 1A16 16 0 013 5a1 1 0 011-1h3.41a1 1 0 011 1 11.72 11.72 0 00.59 3.7 1 1 0 01-.27 1.11l-2.2 2.2z" // Phone icon for hangup
                  } strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Accept / Start */}
              <button
                onClick={toggleCall}
                disabled={status === 'connecting'}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${status === 'active' ? 'bg-cyan-500 text-white shadow-[0_0_30px_#00f2ff]' : 'bg-green-500 text-white hover:bg-green-400'}`}
              >
                {status === 'connecting' ? (
                  <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    {status === 'active' ? (
                      /* Mute Icon or Active State Indicator */
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    ) : (
                      /* Phone Icon for Start */
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
