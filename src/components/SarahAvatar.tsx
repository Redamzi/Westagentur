import React, { useEffect, useRef } from 'react';

interface SarahAvatarProps {
    isSpeaking: boolean;
    volume: number; // 0 to 1
    className?: string;
}

const SarahAvatar: React.FC<SarahAvatarProps> = ({ isSpeaking, volume, className }) => {
    const mouthRef = useRef<SVGPathElement>(null);
    const glowRef = useRef<SVGCircleElement>(null); // Changed to circle for chest orb
    const eyeRingRef = useRef<SVGCircleElement>(null); // For the HUD eye ring
    const eyeCrossRef = useRef<SVGPathElement>(null); // For HUD crosshair

    useEffect(() => {
        if (mouthRef.current) {
            // Mouth Animation
            const targetOpen = isSpeaking ? 0.3 + volume * 0.7 : 0;
            // Morphing from a curve to a slightly open mouth
            // Base: M88 122 Q100 132 112 122 (Smile curve)
            // Open: M88 122 Q100 (132 + open) 112 122  <-- curve gets deeper? 
            // Better: M88 122 Q100 (140) 112 122 (Open mouth shape)

            // Actually, let's keep it simple with scaleY first to avoid complex path logic if possible, 
            // but for a curve, strictly scaling Y might look weird if it's just a line.
            // Let's use a secondary path for the "open" mouth and toggle opacity/visibility if we want a full mouth open effect.
            // OR simply animate the quadratic curve control point.

            const controlY = 132 + (targetOpen * 15); // Move control point down to open
            const d = `M88 122 Q100 ${controlY} 112 122`;
            mouthRef.current.setAttribute('d', d);

            // Add a fill if speaking to look like open mouth?
            if (isSpeaking && volume > 0.1) {
                mouthRef.current.setAttribute('fill', '#300');
            } else {
                mouthRef.current.setAttribute('fill', 'none');
            }
        }

        if (glowRef.current) {
            // Chest glow pulse
            const baseOpacity = 0.6;
            const volAdd = volume * 0.4;
            glowRef.current.style.opacity = (baseOpacity + volAdd).toString();
        }

        if (eyeRingRef.current) {
            // HUD Eye activity
            if (isSpeaking) {
                eyeRingRef.current.style.strokeWidth = (0.5 + volume * 2).toString();
                eyeRingRef.current.style.filter = `drop-shadow(0 0 ${2 + volume * 5}px #00f2ff)`;
            } else {
                eyeRingRef.current.style.strokeWidth = "0.5";
                eyeRingRef.current.style.filter = "url(#glow)";
            }
        }

    }, [isSpeaking, volume]);

    return (
        <div className={`${className} relative`}>
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                <defs>
                    <linearGradient id="armorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3a3a45" />
                        <stop offset="50%" stopColor="#606070" />
                        <stop offset="100%" stopColor="#202025" />
                    </linearGradient>

                    <radialGradient id="skinGrad" cx="50%" cy="40%" r="70%">
                        <stop offset="0%" stopColor="#f2d1b8" />
                        <stop offset="100%" stopColor="#c59a7d" />
                    </radialGradient>

                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Background Halo */}
                <circle cx="100" cy="100" r="90" fill="#2a004a" opacity="0.3" />

                {/* Hair/Back */}
                <path d="M60 100 Q40 140 35 180 M140 100 Q160 140 165 180" stroke="#1a1a1a" strokeWidth="12" fill="none" strokeLinecap="round" />

                {/* Armor Body */}
                <path d="M30 190 Q100 220 170 190 L170 200 L30 200 Z" fill="url(#armorGrad)" />
                <path d="M40 180 L35 150 L60 145 M160 180 L165 150 L140 145" fill="none" stroke="#222" strokeWidth="2" />

                {/* Neck */}
                <path d="M85 140 Q100 150 115 140 L115 115 Q100 120 85 115 Z" fill="#b08060" />

                {/* Head */}
                <path d="M70 75 Q70 125 100 150 Q130 125 130 75 Q130 35 100 35 Q70 35 70 75" fill="url(#skinGrad)" />

                {/* Mouth */}
                <path
                    ref={mouthRef}
                    d="M88 122 Q100 132 112 122"
                    fill="none"
                    stroke="#7a4a3a"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
                <path d="M87 121 Q88 123 89 122 M111 122 Q112 123 113 121" fill="none" stroke="#7a4a3a" strokeWidth="0.5" />

                {/* Eyes Group */}
                <g>
                    {/* Left Eye (Normal) */}
                    <ellipse cx="85" cy="85" rx="5" ry="3" fill="white" />
                    <circle cx="85" cy="85" r="2.5" fill="#222" />

                    {/* Right Eye (Bionic/HUD) */}
                    <circle cx="115" cy="85" r="7" fill="#003344" />
                    <circle
                        ref={eyeRingRef}
                        cx="115"
                        cy="85"
                        r="9"
                        fill="none"
                        stroke="#00f2ff"
                        strokeWidth="0.5"
                        filter="url(#glow)"
                        className="transition-all duration-100"
                    />
                    <path
                        ref={eyeCrossRef}
                        d="M108 85 L122 85 M115 78 L115 92"
                        stroke="#00f2ff"
                        strokeWidth="0.2"
                        opacity={isSpeaking ? 0.8 : 0.5}
                    />
                </g>

                {/* Helmet Top */}
                <path d="M65 65 Q100 20 135 65" fill="none" stroke="url(#armorGrad)" strokeWidth="8" />
                <path d="M100 30 L100 20" stroke="#00f2ff" strokeWidth="2" filter="url(#glow)" />

                {/* Chest Glow */}
                <circle cx="100" cy="185" r="10" fill="#111" stroke="#444" strokeWidth="1" />
                <circle
                    ref={glowRef}
                    cx="100"
                    cy="185"
                    r="6"
                    fill="#00f2ff"
                    filter="url(#glow)"
                    className="transition-opacity duration-100"
                />
            </svg>
        </div>
    );
};

export default SarahAvatar;
