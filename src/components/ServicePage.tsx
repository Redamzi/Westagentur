
import React from 'react';
import { ServiceData } from '../types';

interface ServicePageProps {
    data: ServiceData;
    onBack: () => void;
}

const MailScoutIcon: React.FC<{ className?: string; idSuffix?: string }> = ({ className = "w-12 h-12", idSuffix = "default" }) => {
    const gradId = `logoGrad-service-${idSuffix}`;
    const glowId = `logoGlow-service-${idSuffix}`;

    return (
        <div className={`mailscout-icon-container aspect-square rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center p-6 ${className} select-none overflow-hidden`}>
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-2xl"
            >
                <defs>
                    <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                    <filter id={glowId}>
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Dynamic Motion Flow Lines */}
                <g className="opacity-60">
                    <path
                        className="animate-flow-1"
                        d="M 40 25 Q 65 35, 40 45"
                        stroke="#3B82F6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <path
                        className="animate-flow-2"
                        d="M 50 30 Q 70 40, 50 50"
                        stroke="#60A5FA"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <path
                        className="animate-flow-3"
                        d="M 60 35 Q 75 45, 60 55"
                        stroke="#93C5FD"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                    />
                </g>

                {/* Main Voyager Plane Shape */}
                <path
                    d="M 15 25 L 55 45 L 15 65 L 25 45 Z"
                    fill={`url(#${gradId})`}
                    filter={`url(#${glowId})`}
                    className="transition-transform duration-500 hover:scale-105"
                />

                {/* Targeting Core / Autopilot Node */}
                <circle cx="78" cy="45" r="5" fill="#7C3AED" className="animate-pulse">
                    <animate
                        attributeName="r"
                        values="4;6;4"
                        dur="2s"
                        repeatCount="indefinite"
                    />
                </circle>

                {/* Subtle Orbit Path */}
                <circle
                    cx="78"
                    cy="45"
                    r="10"
                    stroke="#7C3AED"
                    strokeWidth="1"
                    strokeDasharray="2 4"
                    className="opacity-30"
                >
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 78 45"
                        to="360 78 45"
                        dur="10s"
                        repeatCount="indefinite"
                    />
                </circle>
            </svg>
        </div>
    );
};

const ServicePage: React.FC<ServicePageProps> = ({ data, onBack }) => {
    const isAutomation = data.title.toLowerCase().includes('automatisierung') || data.title.toLowerCase().includes('automation') || data.title.toLowerCase().includes('ki');

    return (
        <div className="pt-24 md:pt-40 pb-16 md:pb-24 px-4 md:px-6 min-h-screen relative z-10">
            <div className="max-w-6xl mx-auto">
                {/* Zurück Button */}
                <button
                    onClick={onBack}
                    className="mb-8 md:mb-12 flex items-center gap-3 text-[9px] md:text-[10px] font-technical font-bold text-white uppercase tracking-[0.1em] hover:text-cyan-400 transition-all group"
                >
                    <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Zurück
                </button>

                <div className="inline-flex items-center gap-2 md:gap-3 px-3 py-1 md:px-4 md:py-1.5 mb-6 md:mb-8 text-[8px] md:text-[9px] font-technical font-bold tracking-[0.1em] text-cyan-400 cosmic-glass rounded-full border-cyan-500/20 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    {data.subtitle}
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-vanguard font-black mb-8 md:mb-10 leading-tight tracking-[0.05em] md:tracking-[0.1em] uppercase italic text-white shimmer-text break-words">
                    {data.title}
                </h1>

                <p className="text-lg md:text-2xl text-neutral-100 font-body font-light italic mb-12 md:mb-16 leading-relaxed max-w-4xl opacity-80">
                    {data.heroText}
                </p>

                {/* Referenz Spotlight */}
                {isAutomation && (
                    <div className="mb-12 md:mb-20 relative group">
                        <div className="relative p-6 md:p-14 cosmic-glass glass-reflection rounded-[1.5rem] md:rounded-[2.5rem] border-white/10 overflow-hidden shadow-xl">
                            <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
                                <div className="w-full lg:w-1/3 flex justify-center">
                                    <a href="https://mailscout.app" target="_blank" rel="nofollow" className="block cursor-pointer">
                                        <MailScoutIcon className="w-48 h-48 md:w-64 md:h-64" idSuffix="service" />
                                    </a>
                                </div>

                                <div className="flex-1 text-center lg:text-left">
                                    <h3 className="text-xl md:text-4xl font-vanguard font-black text-white mb-4 md:mb-6 uppercase italic tracking-[0.1em]">Referenz: MailScout.app</h3>
                                    <p className="text-white font-body font-light italic text-base md:text-xl leading-relaxed mb-8 md:mb-10 opacity-70">
                                        Wir haben ein System entwickelt, das Kaltakquise durch intelligente Unterstützung automatisiert. Diese Technologie setzen wir erfolgreich für unsere Kunden ein.
                                    </p>
                                    <a
                                        href="https://mailscout.app"
                                        target="_blank"
                                        rel="nofollow"
                                        className="inline-flex items-center gap-3 px-8 py-4 md:px-10 md:py-5 bg-white text-black font-technical font-black rounded-xl hover:bg-cyan-400 transition-all active:scale-95 uppercase text-[10px] md:text-[11px] tracking-[0.1em]"
                                    >
                                        Projekt ansehen
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-20">
                    {data.features.map((f, i) => (
                        <div key={i} className="p-6 md:p-8 cosmic-glass glass-reflection rounded-[1.5rem] md:rounded-[2rem] border-white/5 relative overflow-hidden group shadow-md hover:border-cyan-500/30 transition-all">
                            <h4 className="text-lg md:text-xl font-vanguard font-bold text-white mb-3 md:mb-4 uppercase italic tracking-[0.1em] group-hover:text-cyan-400">{f.title}</h4>
                            <p className="text-neutral-400 text-sm md:text-base font-body italic leading-relaxed group-hover:text-neutral-200">{f.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mb-12 md:mb-20">
                    <div className="p-6 md:p-12 cosmic-glass glass-reflection rounded-[1.5rem] md:rounded-[2.5rem] border-white/5 relative">
                        <p className="text-base md:text-2xl text-white leading-relaxed font-body font-light italic whitespace-pre-line opacity-80">
                            {data.content}
                        </p>
                    </div>
                </div>

                <div className="flex justify-center pb-12">
                    <button className="px-10 py-5 md:px-16 md:py-6 bg-white text-black font-technical font-black rounded-xl transition-all hover:shadow-xl uppercase tracking-[0.1em] text-[11px] md:text-[12px] active:scale-95">
                        Beratung anfragen
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServicePage;
