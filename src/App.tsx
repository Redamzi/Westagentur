
import React, { useState, useEffect, useRef } from 'react';
import { PRICING, SERVICE_DATA } from './constants';
import ThreeSpaceBackground from './components/ThreeSpaceBackground';
import FaqSection from './components/FaqSection';
import Interactive3DViewer, { AnimationType } from './components/Interactive3DViewer';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import ServicePage from './components/ServicePage';
import LegalPage from './components/LegalPage';

export type ViewState = 'home' | 'webdesign' | 'seo' | '3d' | 'automation' | 'ai' | 'security' | 'about' | 'contact' | 'imprint' | 'privacy' | 'tos';

// Hook für Scroll-Sichtbarkeit mit Fallback
const useVisible = () => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.05 }
        );

        if (ref.current) observer.observe(ref.current);

        // Fallback: Nach 2 Sekunden anzeigen, falls Observer nicht triggert
        const timer = setTimeout(() => setIsVisible(true), 2000);

        return () => {
            observer.disconnect();
            clearTimeout(timer);
        };
    }, []);

    return { ref, isVisible };
};

const HUDDataPoint: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = "text-cyan-400" }) => (
    <div className="flex flex-col gap-1 font-technical text-center min-w-[80px] md:min-w-[120px]">
        <span className="text-[8px] md:text-[10px] uppercase tracking-[0.1em] opacity-40">{label}</span>
        <span className={`text-[10px] md:text-[12px] font-bold tracking-[0.1em] ${color} drop-shadow-[0_0_8px_currentColor]`}>{value}</span>
    </div>
);

const SectionHeading: React.FC<{ subtitle: string; title: string; shimmer?: boolean; small?: boolean }> = ({ subtitle, title, shimmer = true, small = false }) => (
    <div className={`${small ? 'mb-6 md:mb-8' : 'mb-12 md:mb-16'} text-center px-4`}>
        <div className="inline-flex items-center gap-3 md:gap-4 px-3 py-1 md:px-4 md:py-1.5 mb-4 md:mb-6 text-[8px] md:text-[9px] font-technical font-bold tracking-[0.1em] text-cyan-400 cosmic-glass rounded-full border-cyan-500/30 uppercase mx-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#00f2ff]"></span>
            {subtitle}
        </div>
        <h2 className={`${small ? 'text-2xl md:text-5xl' : 'text-3xl md:text-6xl'} font-vanguard font-black tracking-[0.05em] md:tracking-[0.1em] uppercase italic leading-tight ${shimmer ? 'shimmer-text' : 'text-white'} break-words`}>
            {title}
        </h2>
    </div>
);

const AppLogo: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
            <linearGradient id="auroraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>
        <circle cx="50" cy="50" r="45" stroke="url(#auroraGradient)" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3" />
        <path d="M50 5 L50 12 M95 50 L88 50 M50 95 L50 88 M5 50 L12 50" stroke="url(#auroraGradient)" strokeWidth="1" opacity="0.6" />
        <g filter="url(#logoGlow)">
            <path d="M20 35 L35 75 L50 45 L65 75 L80 35" stroke="url(#auroraGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 50 L25 50 M75 50 L85 50" stroke="url(#auroraGradient)" strokeWidth="2" strokeLinecap="square" />
            <path d="M10 50 L20 45 V55 Z" fill="url(#auroraGradient)" />
        </g>
        <circle cx="35" cy="75" r="1.5" fill="#22d3ee" />
        <circle cx="65" cy="75" r="1.5" fill="#8b5cf6" />
    </svg>
);

const MailScoutIcon: React.FC<{ className?: string; idSuffix?: string }> = ({ className = "w-12 h-12", idSuffix = "default" }) => {
    const gradId = `logoGrad-${idSuffix}`;
    const glowId = `logoGlow-${idSuffix}`;

    return (
        <div className={`mailscout-icon-container aspect-square rounded-[2rem] md:rounded-[3rem] flex items-center justify-center p-6 ${className} select-none overflow-hidden`}>
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

const App: React.FC = () => {
    const [view, setView] = useState<ViewState>('home');
    const { ref: sectionRef, isVisible } = useVisible();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [view]);

    const renderAbout = () => (
        <div className="pt-40 pb-20 px-4 md:px-6 min-h-screen relative z-10">
            <div className="max-w-4xl mx-auto">
                <SectionHeading subtitle="Unsere Vision" title="Über Westagentur" />
                <div className="p-8 md:p-16 cosmic-glass glass-reflection rounded-[3rem] border-white/10 space-y-10">
                    <p className="text-xl md:text-3xl font-body font-light italic text-white/90 leading-relaxed">
                        Wir sind nicht nur eine Agentur – wir sind Ihr <span className="text-cyan-400 font-bold">digitaler Architekt</span>.
                    </p>
                    <div className="space-y-6 text-neutral-400 font-body text-base md:text-lg leading-relaxed italic">
                        <p>
                            In einer Welt, die sich immer schneller dreht, braucht der Mittelstand Partner, die nicht nur Technik verstehen, sondern auch Strategie. Die Westagentur wurde mit dem Ziel gegründet, High-End Design und technologische Exzellenz für kleine und mittelständische Unternehmen zugänglich zu machen.
                        </p>
                        <p>
                            Unser Ansatz kombiniert immersive 3D-Erlebnisse, datengetriebene SEO-Strategien und effiziente Automatisierungsprozesse. Wir glauben daran, dass jede Website eine Geschichte erzählen muss – Ihre Geschichte.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-10">
                        <div className="text-center">
                            <div className="text-3xl font-vanguard text-white mb-2 italic">100%</div>
                            <div className="text-[10px] font-technical text-cyan-400 uppercase tracking-widest">Leidenschaft</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-vanguard text-white mb-2 italic">24/7</div>
                            <div className="text-[10px] font-technical text-cyan-400 uppercase tracking-widest">Innovation</div>
                        </div>
                        <div className="hidden md:block text-center">
                            <div className="text-3xl font-vanguard text-white mb-2 italic">KMU</div>
                            <div className="text-[10px] font-technical text-cyan-400 uppercase tracking-widest">Fokus</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderHome = () => (
        <>
            {/* Hero Bereich */}
            <section className="relative pt-40 md:pt-64 pb-20 md:pb-32 px-4 min-h-screen flex flex-col justify-center items-center overflow-hidden text-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[160%] bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.06)_0%,transparent_60%)] pointer-events-none"></div>

                <div className="max-w-[1200px] mx-auto relative z-10 w-full flex flex-col items-center">
                    <div className="flex flex-row justify-center items-start gap-6 md:gap-20 mb-12 md:mb-20 w-full max-w-3xl">
                        <HUDDataPoint label="REAKTIONSZEIT" value="24 STUNDEN" />
                        <HUDDataPoint label="SICHERHEIT" value="DSGVO" color="text-violet-400" />
                        <HUDDataPoint label="QUALITÄT" value="PREMIUM" color="text-green-400" />
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-[5rem] lg:text-[6rem] font-vanguard font-black mb-8 md:mb-12 leading-[1.1] md:leading-[0.95] tracking-[0.02em] md:tracking-[0.05em] uppercase italic px-2">
                        <span className="block opacity-30 text-[10px] md:text-base not-italic mb-4 md:mb-8 tracking-[0.1em] md:tracking-[0.2em] font-technical">STRATEGIE & DESIGN</span>
                        <span className="shimmer-text block drop-shadow-[0_0_40px_rgba(0,242,255,0.3)] md:drop-shadow-[0_0_80px_rgba(0,242,255,0.4)]">DIGITALE</span>
                        <span className="text-white block opacity-100 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] md:drop-shadow-[0_0_40px_rgba(255,255,255,0.2)]">MARKTFÜHRER.</span>
                    </h1>

                    <p className="text-sm md:text-2xl text-neutral-300 max-w-4xl mx-auto mb-12 md:mb-20 leading-relaxed font-light tracking-[0.05em] md:tracking-[0.1em] uppercase italic opacity-90 px-4">
                        Wir transformieren Marken in <span className="text-cyan-400 font-bold drop-shadow-[0_0_8px_#00f2ff]">digitale Anlaufstellen</span>. <br className="hidden md:block" />Modernes Webdesign für den deutschen Mittelstand.
                    </p>

                    <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-10 w-full max-w-3xl px-4">
                        <button
                            onClick={() => setView('contact')}
                            className="flex-1 px-8 py-5 md:px-12 md:py-7 bg-white text-black font-technical font-black rounded-xl transition-all hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] uppercase tracking-[0.1em] md:tracking-[0.15em] text-[11px] md:text-[13px] active:scale-95"
                        >
                            Projekt anfragen
                        </button>
                        <a
                            href="#vorteile"
                            className="flex-1 px-8 py-5 md:px-12 md:py-7 bg-[#1a1c1e]/80 border border-white/10 text-white font-technical font-black rounded-xl transition-all hover:bg-white/10 hover:border-white/30 uppercase tracking-[0.1em] md:tracking-[0.15em] text-[11px] md:text-[13px] active:scale-95 backdrop-blur-md"
                        >
                            Leistungen ansehen
                        </a>
                    </div>
                </div>
            </section>

            {/* Leistungen Sektion */}
            <section id="vorteile" ref={sectionRef} className="py-20 md:py-32 relative">
                <div className="max-w-[1440px] mx-auto px-4 md:px-6">
                    <SectionHeading subtitle="Unsere Expertise" title="Professionelle Lösungen" />

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                        {/* Standard Service Cards */}
                        {[
                            { label: 'STRATEGIE', title: 'Modernes Webdesign', desc: 'Wir gestalten nutzerzentrierte Websites, die Ihre Markenidentität stärken und Besucher in Kunden verwandeln.', link: 'webdesign' },
                            { label: 'REICHWEITE', title: 'SEO-Optimierung', desc: 'Sichtbarkeit ist alles. Wir optimieren Ihre Präsenz für Spitzen-Rankings bei Google und Co.', link: 'seo' },
                            { label: 'EFFIZIENZ', title: 'Automatisierung', desc: 'Sparen Sie wertvolle Zeit durch intelligente Workflows und nahtlose Software-Integrationen.', link: 'automation' }
                        ].map((f, i) => (
                            <div
                                key={i}
                                onClick={() => setView(f.link as ViewState)}
                                style={{ animationDelay: `${i * 150}ms` }}
                                className={`group p-8 md:p-10 cosmic-glass glass-reflection rounded-[2rem] md:rounded-[2.5rem] border-white/5 relative overflow-hidden cursor-pointer animate-float ${isVisible ? 'animate-entrance' : 'opacity-0'}`}
                            >
                                <div className="text-[8px] md:text-[9px] font-technical text-cyan-400 mb-6 md:mb-8 tracking-[0.1em] font-bold opacity-60 uppercase">{f.label}</div>
                                <h3 className="text-lg md:text-2xl font-vanguard font-black mb-4 md:mb-6 uppercase italic text-white tracking-[0.1em] group-hover:text-cyan-400 transition-all leading-tight">{f.title}</h3>
                                <p className="text-sm md:text-base text-neutral-400 leading-relaxed font-light italic font-body group-hover:text-neutral-200 transition-colors">{f.desc}</p>
                                <div className="mt-8 flex items-center gap-2 text-[10px] font-technical text-cyan-400 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                    Mehr erfahren
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </div>
                            </div>
                        ))}

                        {/* High-End 3D & Tech Cards */}
                        {[
                            { label: 'IMMERSION', title: '3D Erlebnisse', desc: 'Interaktive Web-Erlebnisse durch modernste 3D-Technologie. Setzen Sie neue Standards.', type: 'quantum' as AnimationType, link: '3d' as ViewState },
                            { label: 'INTELLIGENZ', title: 'KI-Lösungen', desc: 'Nutzen Sie die Kraft künstlicher Intelligenz für Chatbots, Datenanalyse und Content-Erstellung.', type: 'neural' as AnimationType, link: 'ai' as ViewState },
                            { label: 'SECURITY', title: 'Cyber Security', desc: 'Maximaler Schutz für Ihre digitalen Assets and Kundendaten durch modernste Verschlüsselung.', type: 'shield' as AnimationType, link: 'security' as ViewState }
                        ].map((card, i) => (
                            <div
                                key={i + 3}
                                onClick={() => setView(card.link)}
                                style={{ animationDelay: `${(i + 3) * 150}ms`, animationDuration: `${8 + i}s` }}
                                className={`group p-8 md:p-10 cosmic-glass glass-reflection rounded-[2rem] md:rounded-[2.5rem] border-cyan-500/20 relative overflow-hidden flex flex-col cursor-pointer animate-float ${isVisible ? 'animate-entrance' : 'opacity-0'}`}
                            >
                                <div className="text-[8px] md:text-[9px] font-technical text-cyan-400 mb-6 tracking-[0.1em] font-bold opacity-60 uppercase">{card.label}</div>
                                <h3 className="text-lg md:text-2xl font-vanguard font-black mb-4 md:mb-6 uppercase italic text-white tracking-[0.1em] group-hover:text-cyan-400 transition-all leading-tight">{card.title}</h3>
                                <div className="flex-1 min-h-[200px] md:min-h-[250px] mb-6 relative rounded-2xl overflow-hidden bg-black/40 border border-white/5">
                                    <Interactive3DViewer type={card.type} />
                                </div>
                                <p className="text-sm md:text-base text-neutral-400 leading-relaxed font-light italic font-body group-hover:text-neutral-200 transition-colors">
                                    {card.desc}
                                </p>
                                <div className="mt-8 flex items-center gap-2 text-[10px] font-technical text-cyan-400 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                    Details ansehen
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Automatisierung Sektion (Spotlight) */}
            <section id="automation" className="py-16 md:py-24 relative">
                <div className="max-w-[1440px] mx-auto px-4 md:px-6">
                    <div className="relative cosmic-glass glass-reflection rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-16 flex flex-col lg:flex-row items-center gap-10 md:gap-12 overflow-hidden border-white/10 shadow-xl">
                        <div className="lg:w-1/2 relative z-10 w-full">
                            <SectionHeading subtitle="Effizienz" title="Prozesse optimieren" small={true} />

                            <div className="mb-8 md:mb-10 p-5 md:p-6 rounded-2xl bg-white/5 border-l-2 border-cyan-400 flex items-start gap-4 md:gap-5">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                </div>
                                <div>
                                    <div className="text-[8px] md:text-[9px] font-technical text-cyan-400 mb-1 uppercase tracking-[0.1em] font-bold opacity-60">REFERENZPROJEKT</div>
                                    <p className="text-base md:text-lg text-white font-light italic leading-relaxed">
                                        <a href="https://mailscout.app" target="_blank" className="text-white font-black hover:text-cyan-400 transition-colors underline decoration-cyan-500/30">MailScout.app</a>
                                        <span className="text-neutral-400 ml-1"> — Intelligente Lead-Automatisierung für spürbares Wachstum.</span>
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 md:gap-6">
                                <div className="p-5 md:p-6 rounded-2xl bg-white/5 border border-white/10 glass-reflection">
                                    <div className="text-[7px] md:text-[8px] font-technical text-green-400 uppercase tracking-[0.1em] mb-2 font-bold opacity-60">ANFRAGEN PLUS</div>
                                    <div className="text-2xl md:text-3xl font-vanguard font-black text-white italic tracking-[0.1em]">+280%</div>
                                </div>
                                <div className="p-5 md:p-6 rounded-2xl bg-white/5 border border-white/10 glass-reflection">
                                    <div className="text-[7px] md:text-[8px] font-technical text-violet-400 uppercase tracking-[0.1em] mb-2 font-bold opacity-60">ZEITGEWINN</div>
                                    <div className="text-2xl md:text-3xl font-vanguard font-black text-white italic tracking-[0.1em]">40h/Wo</div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative flex justify-center w-full">
                            <a
                                href="https://mailscout.app"
                                target="_blank"
                                rel="nofollow"
                                className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 relative group cursor-pointer block"
                            >
                                <MailScoutIcon className="w-full h-full" idSuffix="hero" />
                            </a>
                        </div>
                    </div>
                </div>
            </section >

            {/* Preise */}
            < section id="investment" className="py-20 md:py-32 relative" >
                <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
                    <SectionHeading subtitle="Investition" title="Paket-Übersicht" />
                    <div className="grid lg:grid-cols-3 gap-10 md:gap-12 lg:gap-16 items-stretch">
                        {PRICING.map((pkg, i) => (
                            <div
                                key={i}
                                style={{ animationDelay: `${i * 300}ms`, animationDuration: '10s' }}
                                className={`relative group animate-float flex flex-col ${pkg.recommended ? 'z-20' : 'z-10 opacity-90'}`}
                            >
                                {pkg.recommended && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-cyan-500 text-black text-[9px] md:text-[10px] font-technical font-black rounded-full tracking-[0.15em] uppercase z-30 shadow-[0_0_30px_rgba(0,242,255,0.5)] whitespace-nowrap">
                                        Empfehlung
                                    </div>
                                )}
                                <div className={`p-8 md:p-12 lg:p-14 rounded-[2.5rem] md:rounded-[3.5rem] cosmic-glass glass-reflection border-white/10 transition-all flex-1 flex flex-col ${pkg.recommended ? 'border-cyan-500/40 md:scale-105 shadow-2xl' : ''}`}>
                                    <div className="text-[9px] md:text-[10px] font-technical text-neutral-500 mb-8 md:mb-10 tracking-[0.15em] uppercase font-bold">{pkg.name}</div>
                                    <div className="text-4xl md:text-5xl font-vanguard font-black text-white mb-8 md:mb-10 tracking-[0.1em] italic">{pkg.price}</div>
                                    <ul className="space-y-5 md:space-y-7 mb-12 md:mb-16 font-body flex-1">
                                        {pkg.features.map((f, fi) => (
                                            <li key={fi} className="flex items-start gap-4 text-sm md:text-base lg:text-lg text-neutral-300 font-light italic leading-relaxed">
                                                <span className="w-2 h-2 rounded-full bg-cyan-400/60 mt-1.5 shrink-0"></span>
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setView('contact');
                                        }}
                                        className={`w-full py-5 md:py-6 rounded-2xl text-[10px] md:text-[11px] font-technical font-black uppercase tracking-[0.15em] transition-all active:scale-95 ${pkg.recommended ? 'bg-cyan-500 text-black shadow-lg hover:shadow-cyan-500/40' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                    >
                                        Jetzt anfragen
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            <FaqSection />
        </>
    );

    return (
        <div className="relative min-h-screen bg-[#010103] overflow-x-hidden font-body text-white">
            <ThreeSpaceBackground />

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-[60] py-3 md:py-4 px-3 md:px-6">
                <div className="max-w-[1440px] mx-auto cosmic-glass glass-reflection px-4 md:px-10 py-3 md:py-4 rounded-[1rem] md:rounded-[1.5rem] flex justify-between items-center group overflow-hidden border-white/10">
                    <div className="flex items-center gap-3 md:gap-6 relative cursor-pointer" onClick={() => setView('home')}>
                        <AppLogo className="w-10 h-10 md:w-16 md:h-16 transition-transform group-hover:scale-105 shrink-0 drop-shadow-[0_0_15px_rgba(0,242,255,0.4)]" />
                        <div className="flex flex-col">
                            <span className="shimmer-text font-vanguard font-black uppercase tracking-[0.1em] text-[10px] md:text-[12px] leading-none mb-1">WESTAGENTUR</span>
                            <span className="text-[6px] md:text-[7px] font-technical text-cyan-400 tracking-[0.1em] uppercase font-bold opacity-60 leading-none">Design & Strategie</span>
                        </div>
                    </div>

                    <div className="hidden lg:flex space-x-10 text-[12px] md:text-[13px] font-technical font-bold tracking-[0.1em] text-neutral-300 uppercase items-center">
                        <button onClick={() => setView('about')} className={`hover:text-cyan-400 transition-all ${view === 'about' ? 'text-cyan-400' : ''}`}>Über uns</button>
                        <button onClick={() => setView('webdesign')} className={`hover:text-cyan-400 transition-all ${view === 'webdesign' ? 'text-cyan-400' : ''}`}>Webdesign</button>
                        <button onClick={() => setView('seo')} className={`hover:text-cyan-400 transition-all ${view === 'seo' ? 'text-cyan-400' : ''}`}>SEO</button>
                        <button onClick={() => setView('3d')} className={`hover:text-cyan-400 transition-all ${view === '3d' ? 'text-cyan-400' : ''}`}>3D Design</button>
                        <button onClick={() => setView('automation')} className={`hover:text-cyan-400 transition-all ${view === 'automation' ? 'text-cyan-400' : ''}`}>Automatisierung</button>
                    </div>

                    <button onClick={() => setView('contact')} className={`px-4 py-2 md:px-8 md:py-3 rounded-lg md:rounded-xl text-[10px] md:text-[13px] font-technical font-bold uppercase tracking-[0.1em] transition-all active:scale-95 shrink-0 ${view === 'contact' ? 'bg-cyan-400 text-black' : 'bg-white text-black hover:bg-cyan-400'}`}>
                        Kontakt
                    </button>
                </div>
            </nav>

            <main className="relative z-10 text-neutral-100 selection:bg-cyan-500/50">
                {view === 'home' && renderHome()}
                {view === 'about' && renderAbout()}
                {view === 'contact' && (
                    <div className="pt-24 pb-12 min-h-screen">
                        <ContactSection isDedicatedPage={true} onBack={() => setView('home')} />
                    </div>
                )}
                {['webdesign', 'seo', '3d', 'automation', 'ai', 'security'].includes(view) && (
                    <ServicePage
                        data={SERVICE_DATA[view as keyof typeof SERVICE_DATA] || SERVICE_DATA['webdesign']}
                        onBack={() => setView('home')}
                    />
                )}
                {['imprint', 'privacy', 'tos'].includes(view) && (
                    <LegalPage
                        type={view as 'imprint' | 'privacy' | 'tos'}
                        onBack={() => setView('home')}
                    />
                )}

                {view === 'home' && <ContactSection />}
                <Footer onNavigate={(v) => setView(v)} />
            </main>
        </div>
    );
};

export default App;
