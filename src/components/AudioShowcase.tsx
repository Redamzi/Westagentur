import React, { useState, useRef, useEffect } from 'react';

const AudioShowcase: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Fake Waveform Bars
    const bars = Array.from({ length: 40 }, (_, i) => ({
        h: Math.random() * 40 + 10,
        delay: Math.random() * 0.5
    }));

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            // Placeholder URL - User should replace this with '/demo_call.mp3'
            if (!audioRef.current.src) {
                audioRef.current.src = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"; // Typischer "Computer Processing" Sound als Platzhalter
            }
            audioRef.current.play().catch(e => console.error("Audio Playback Error:", e));
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="w-full max-w-2xl mx-auto mb-16">
            <div className="relative p-8 rounded-[2rem] cosmic-glass glass-reflection border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,242,255,0.1)]">

                {/* Background Glow */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-400/20 blur-[50px] rounded-full transition-all duration-1000 ${isPlaying ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`}></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">

                    {/* Play Button */}
                    <button
                        onClick={togglePlay}
                        className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(0,242,255,0.6)] group"
                    >
                        {isPlaying ? (
                            <svg className="w-6 h-6 md:w-8 md:h-8 fill-black" viewBox="0 0 24 24">
                                <rect x="6" y="4" width="4" height="16" rx="1" />
                                <rect x="14" y="4" width="4" height="16" rx="1" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 md:w-8 md:h-8 fill-black translate-x-1" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>

                    {/* Waveform & Info */}
                    <div className="flex-1 w-full">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <div className="text-[10px] font-technical text-cyan-400 uppercase tracking-[0.1em] font-bold mb-1">Live Demo</div>
                                <h3 className="text-white font-vanguard italic text-xl">KI Empfangsdame</h3>
                            </div>
                            <div className="font-technical text-xs text-neutral-400 tabular-nums">
                                {isPlaying ? "00:05" : "00:00"} / 00:30
                            </div>
                        </div>

                        {/* Visualizer */}
                        <div className="h-12 flex items-center justify-between gap-1 overflow-hidden mask-linear-fade">
                            {bars.map((bar, i) => (
                                <div
                                    key={i}
                                    className="w-1.5 bg-gradient-to-t from-cyan-500 to-violet-500 rounded-full transition-all duration-300"
                                    style={{
                                        height: isPlaying ? `${Math.max(10, Math.random() * 100)}%` : '20%',
                                        opacity: isPlaying ? 1 : 0.3
                                    }}
                                ></div>
                            ))}
                        </div>

                        {/* Progress Bar (Visual Only for now) */}
                        <div className="w-full h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-cyan-400 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>

                <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />
            </div>
            <p className="text-center text-neutral-500 text-xs font-technical mt-4 uppercase tracking-widest opacity-60">
                * Beispiel eines echten KI-Gesprächs
            </p>
        </div>
    );
};

export default AudioShowcase;
