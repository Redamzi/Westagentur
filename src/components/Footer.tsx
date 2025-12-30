
import React from 'react';
import { ViewState } from '../App';

interface FooterProps {
    onNavigate?: (view: ViewState) => void;
}

const FooterLogo: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
            <linearGradient id="footerAuroraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <filter id="footerLogoGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>
        <circle cx="50" cy="50" r="45" stroke="url(#footerAuroraGradient)" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3" />
        <path d="M50 5 L50 12 M95 50 L88 50 M50 95 L50 88 M5 50 L12 50" stroke="url(#footerAuroraGradient)" strokeWidth="1" opacity="0.6" />
        <g filter="url(#footerLogoGlow)">
            <path d="M20 35 L35 75 L50 45 L65 75 L80 35" stroke="url(#footerAuroraGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 50 L25 50 M75 50 L85 50" stroke="url(#footerAuroraGradient)" strokeWidth="2" strokeLinecap="square" />
            <path d="M10 50 L20 45 V55 Z" fill="url(#footerAuroraGradient)" />
        </g>
        <circle cx="35" cy="75" r="1.5" fill="#22d3ee" />
        <circle cx="65" cy="75" r="1.5" fill="#8b5cf6" />
    </svg>
);

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    const handleNav = (e: React.MouseEvent, view: ViewState) => {
        e.preventDefault();
        if (onNavigate) {
            onNavigate(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <footer className="py-24 border-t border-white/5 bg-black/40 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8 lg:gap-x-12 mb-20 items-start">
                    {/* Brand Column */}
                    <div className="flex flex-col">
                        <div
                            className="flex items-center gap-3 cursor-pointer mb-8 group min-h-[40px] md:min-h-[56px]"
                            onClick={(e) => handleNav(e, 'home')}
                        >
                            <FooterLogo className="w-8 h-8 md:w-12 md:h-12 drop-shadow-[0_0_15px_rgba(0,242,255,0.3)] shrink-0 transition-transform group-hover:scale-110" />
                            <span className="text-lg md:text-xl font-vanguard font-black tracking-[0.05em] text-white leading-none uppercase italic break-normal">
                                westagentur
                            </span>
                        </div>
                        <p className="text-neutral-500 font-body font-light text-xs md:text-sm leading-relaxed max-w-xs italic opacity-80">
                            Ihre professionelle Webdesign Agentur für den Mittelstand. SEO-optimiert, mobilfähig und mit modernster Technologie.
                        </p>
                    </div>

                    {/* Links Columns */}
                    <div className="flex flex-col">
                        <h4 className="text-white font-vanguard font-bold text-base md:text-lg mb-8 tracking-[0.1em] uppercase leading-none min-h-[40px] md:min-h-[56px] flex items-center">
                            Leistungen
                        </h4>
                        <ul className="space-y-4 text-neutral-500 font-body text-sm">
                            <li><button onClick={(e) => handleNav(e, 'webdesign')} className="hover:text-cyan-400 transition-colors text-left">Webdesign</button></li>
                            <li><button onClick={(e) => handleNav(e, 'telephony')} className="hover:text-cyan-400 transition-colors text-left">KI-Telefonie</button></li>
                            <li><button onClick={(e) => handleNav(e, '3d')} className="hover:text-cyan-400 transition-colors text-left">3D Webdesign</button></li>
                            <li><button onClick={(e) => handleNav(e, 'automation')} className="hover:text-cyan-400 transition-colors text-left">Automatisierung</button></li>
                            <li><button onClick={(e) => handleNav(e, 'ai')} className="hover:text-cyan-400 transition-colors text-left">KI-Lösungen</button></li>
                            <li><button onClick={(e) => handleNav(e, 'security')} className="hover:text-cyan-400 transition-colors text-left">Cyber Security</button></li>
                        </ul>
                    </div>

                    <div className="flex flex-col">
                        <h4 className="text-white font-vanguard font-bold text-base md:text-lg mb-8 tracking-[0.1em] uppercase leading-none min-h-[40px] md:min-h-[56px] flex items-center">
                            Unternehmen
                        </h4>
                        <ul className="space-y-4 text-neutral-500 font-body text-sm">
                            <li><button onClick={(e) => handleNav(e, 'about')} className="hover:text-cyan-400 transition-colors text-left">Über uns</button></li>
                            <li><a href="https://mailscout.app" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors flex items-center gap-2">Referenzen <span className="text-[10px] opacity-40 italic">(MailScout)</span></a></li>
                            <li><button onClick={(e) => handleNav(e, 'contact')} className="hover:text-cyan-400 transition-colors text-left">Kontakt</button></li>
                        </ul>
                    </div>

                    <div className="flex flex-col">
                        <h4 className="text-white font-vanguard font-bold text-base md:text-lg mb-8 tracking-[0.1em] uppercase leading-none min-h-[40px] md:min-h-[56px] flex items-center">
                            Rechtliches
                        </h4>
                        <ul className="space-y-4 text-neutral-500 font-body text-sm">
                            <li><button onClick={(e) => handleNav(e, 'imprint')} className="hover:text-cyan-400 transition-colors text-left">Impressum</button></li>
                            <li><button onClick={(e) => handleNav(e, 'privacy')} className="hover:text-cyan-400 transition-colors text-left">Datenschutz</button></li>
                            <li><button onClick={(e) => handleNav(e, 'tos')} className="hover:text-cyan-400 transition-colors text-left">AGB</button></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-technical text-neutral-700 tracking-[0.1em] uppercase text-center md:text-left">
                        © 2026 WESTAGENTUR — IHRE AGENTUR FÜR DIGITALE LÖSUNGEN
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
