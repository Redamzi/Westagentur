import React, { useEffect, useRef } from 'react';

interface SarahAvatarProps {
    isSpeaking: boolean;
    volume: number; // 0 to 1
    className?: string;
}

const SarahAvatar: React.FC<SarahAvatarProps> = ({ isSpeaking, volume, className }) => {
    const mouthRef = useRef<SVGPathElement>(null);
    const glowRef = useRef<SVGGElement>(null);
    const eyesRef = useRef<SVGGElement>(null);

    useEffect(() => {
        if (mouthRef.current) {
            // Simple mouth movement based on volume/speaking
            const targetOpen = isSpeaking ? 0.2 + volume * 0.8 : 0; // 0 to 1 range approx
            const currentScaleY = parseFloat(mouthRef.current.getAttribute('data-scale') || '0');

            // Lerp for smoothness
            const newScaleY = currentScaleY + (targetOpen - currentScaleY) * 0.3;
            mouthRef.current.setAttribute('data-scale', newScaleY.toString());

            // Morph the mouth path slightly or just scale it
            // Simple approach: Scale Y around center
            // Center of mouth approx: 100, 135
            mouthRef.current.style.transform = `scaleY(${1 + newScaleY * 1.5})`;
            mouthRef.current.style.transformOrigin = "100px 135px";
        }

        if (glowRef.current && eyesRef.current) {
            // Pulse glow based on state
            const baseOpacity = isSpeaking ? 0.8 : 0.3;
            const volAdd = volume * 0.5;
            glowRef.current.style.opacity = (baseOpacity + volAdd).toString();

            // Eyes brighter when speaking
            eyesRef.current.style.filter = isSpeaking
                ? `drop-shadow(0 0 ${5 + volume * 10}px #00f2ff)`
                : `drop-shadow(0 0 2px #bc13fe)`;
        }
    }, [isSpeaking, volume]);

    return (
        <div className={`${className} relative`}>
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                <defs>
                    <linearGradient id="armorGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#2a2a2a" />
                        <stop offset="50%" stopColor="#4a4a4a" />
                        <stop offset="100%" stopColor="#1a1a1a" />
                    </linearGradient>
                    <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#dcb8a0" />
                        <stop offset="100%" stopColor="#ac8060" />
                    </linearGradient>
                    <linearGradient id="techGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#00f2ff" />
                        <stop offset="100%" stopColor="#bc13fe" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Base Glow Behind */}
                <circle cx="100" cy="100" r="80" fill="url(#techGrad)" opacity="0.1" className="animate-pulse" />

                {/* Shoulders / Armor */}
                <path d="M40 180 Q100 210 160 180 L160 200 L40 200 Z" fill="url(#armorGrad)" />
                <path d="M40 180 Q30 150 50 140 L150 140 Q170 150 160 180" fill="none" stroke="#333" strokeWidth="2" />
                {/* Armor Accents */}
                <circle cx="50" cy="160" r="5" fill="#00f2ff" filter="url(#glow)" opacity="0.6" />
                <circle cx="150" cy="160" r="5" fill="#00f2ff" filter="url(#glow)" opacity="0.6" />

                {/* Neck */}
                <path d="M85 140 L85 110 L115 110 L115 140" fill="url(#skinGrad)" />

                {/* Hair Back */}
                <path d="M60 100 Q40 140 30 180" fill="none" stroke="#222" strokeWidth="15" strokeLinecap="round" />
                <path d="M140 100 Q160 140 170 180" fill="none" stroke="#222" strokeWidth="15" strokeLinecap="round" />

                {/* Face Shape */}
                <path d="M70 70 Q70 120 100 145 Q130 120 130 70 Q130 30 100 30 Q70 30 70 70" fill="url(#skinGrad)" />

                {/* Helmet / Headgear */}
                <path d="M65 60 Q100 10 135 60 L135 50 Q100 0 65 50 Z" fill="url(#armorGrad)" />
                <path d="M90 35 L100 25 L110 35" fill="#00f2ff" filter="url(#glow)" />
                <path d="M65 50 Q60 80 68 100" fill="none" stroke="url(#armorGrad)" strokeWidth="4" />
                <path d="M135 50 Q140 80 132 100" fill="none" stroke="url(#armorGrad)" strokeWidth="4" />
                {/* Tech Lines on Helmet */}
                <path d="M75 55 Q100 45 125 55" fill="none" stroke="#00f2ff" strokeWidth="1" opacity="0.7" />

                {/* Eyes */}
                <g ref={eyesRef}>
                    <path d="M80 85 Q90 80 100 85" fill="none" stroke="#333" strokeWidth="1" />
                    <ellipse cx="85" cy="85" rx="4" ry="2" fill={isSpeaking ? "#00f2ff" : "#bc13fe"} />
                    <ellipse cx="115" cy="85" rx="4" ry="2" fill={isSpeaking ? "#00f2ff" : "#bc13fe"} />
                    {/* Tech Monocle / HUD over Right Eye */}
                    <circle cx="115" cy="85" r="8" fill="none" stroke="#00f2ff" strokeWidth="0.5" opacity="0.4" />
                </g>

                {/* Nose */}
                <path d="M100 85 L98 105 L102 105 Z" fill="#b08060" opacity="0.5" />

                {/* Mouth */}
                {/* Neutral Lip Line */}
                <path d="M90 125 Q100 128 110 125" fill="none" stroke="#8d5e40" strokeWidth="1" />
                {/* Animated Mouth Opening */}
                <path
                    ref={mouthRef}
                    d="M92 125 Q100 130 108 125"
                    fill="#502020"
                    opacity={isSpeaking ? 1 : 0}
                />

                {/* Glowing Tech Markings on Cheeks */}
                <g ref={glowRef}>
                    <path d="M75 100 L85 105" fill="none" stroke="#00f2ff" strokeWidth="1" filter="url(#glow)" />
                    <path d="M125 100 L115 105" fill="none" stroke="#00f2ff" strokeWidth="1" filter="url(#glow)" />

                    {/* Center Chest Orb */}
                    <circle cx="100" cy="180" r="8" fill="#00f2ff" filter="url(#glow)" />
                </g>

            </svg>
        </div>
    );
};

export default SarahAvatar;
