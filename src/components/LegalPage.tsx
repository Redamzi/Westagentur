
import React from 'react';
import { LEGAL_CONTENT } from '../constants';

interface LegalPageProps {
    type: 'imprint' | 'privacy' | 'tos';
    onBack: () => void;
}

const LegalPage: React.FC<LegalPageProps> = ({ type, onBack }) => {
    const content = LEGAL_CONTENT[type];

    return (
        <div className="pt-32 md:pt-48 pb-24 px-4 md:px-6 min-h-screen relative z-10">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={onBack}
                    className="mb-8 md:mb-12 flex items-center gap-3 text-[9px] md:text-[10px] font-technical font-bold text-white uppercase tracking-[0.1em] hover:text-cyan-400 transition-all group"
                >
                    <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Zurück zur Startseite
                </button>

                <div className="cosmic-glass glass-reflection rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 border-white/10">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 mb-8 text-[9px] font-technical font-bold tracking-[0.2em] text-cyan-400 cosmic-glass rounded-full border-cyan-500/10 uppercase">
                        Rechtliches
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-vanguard font-black mb-12 uppercase italic leading-tight text-white shimmer-text">
                        {content.title}
                    </h1>

                    <div className="space-y-12 font-body text-neutral-300">
                        {content.sections.map((section, idx) => (
                            <div key={idx} className="space-y-4">
                                <h2 className="text-lg md:text-xl font-vanguard font-bold text-white uppercase tracking-wider italic">
                                    {section.heading}
                                </h2>
                                <div className="text-sm md:text-base leading-relaxed font-light whitespace-pre-line opacity-80 italic">
                                    {section.body}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 pt-12 border-t border-white/5 text-[10px] font-technical text-neutral-600 uppercase tracking-widest text-center italic">
                        Stand: Januar 2024 — Westagentur
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalPage;
