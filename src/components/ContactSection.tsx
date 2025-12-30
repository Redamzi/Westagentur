
import React from 'react';

const ContactCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex-1 min-w-[140px] p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center group hover:bg-white/10 transition-all duration-500">
        <div className="text-cyan-400 mb-4 group-hover:scale-110 transition-transform duration-500">
            {icon}
        </div>
        <span className="text-[8px] md:text-[10px] font-technical text-neutral-500 uppercase tracking-widest mb-1">{label}</span>
        <span className="text-[11px] md:text-sm font-body font-semibold text-white tracking-wide">{value}</span>
    </div>
);

interface ContactSectionProps {
    isDedicatedPage?: boolean;
    onBack?: () => void;
}

const ContactSection: React.FC<ContactSectionProps> = ({ isDedicatedPage = false, onBack }) => {
    return (
        <section id="kontakt" className={`py-20 md:py-40 relative px-4 ${isDedicatedPage ? 'pt-24' : ''}`}>
            <div className="max-w-7xl mx-auto">
                {isDedicatedPage && onBack && (
                    <button
                        onClick={onBack}
                        className="mb-8 md:mb-12 flex items-center gap-3 text-[9px] md:text-[10px] font-technical font-bold text-white uppercase tracking-[0.1em] hover:text-cyan-400 transition-all group"
                    >
                        <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Zurück zur Startseite
                    </button>
                )}

                <div className="cosmic-glass rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-24 text-center relative overflow-hidden border-white/10">
                    {/* Subtle Glow Background */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,rgba(0,242,255,0.05)_0%,transparent_70%)] pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <span className="text-[8px] md:text-[10px] font-technical font-bold text-cyan-400 tracking-[0.3em] md:tracking-[0.5em] uppercase mb-6 md:mb-8 block">
                            Digitales Wachstum
                        </span>

                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-vanguard font-black mb-8 md:mb-10 leading-[1.1] md:leading-tight tracking-tight uppercase italic text-white flex flex-col items-center">
                            <span>Jetzt</span>
                            <span className="break-all sm:break-normal">unverbindlich</span>
                            <span className="shimmer-text">beraten</span>
                            <span className="shimmer-text">lassen</span>
                        </h2>

                        <p className="max-w-xl mx-auto text-neutral-400 text-sm md:text-xl font-body font-light leading-relaxed mb-12 md:mb-16 italic opacity-80">
                            Bereit für eine Website, die Ihr Unternehmen nach vorne bringt? Kontaktieren Sie uns für ein kostenloses Beratungsgespräch – wir analysieren Ihre Anforderungen und erstellen ein unverbindliches Angebot.
                        </p>

                        <div className="flex justify-center mb-16 md:mb-24 w-full px-2">
                            <a
                                href="mailto:mail@westagentur.de"
                                className="w-full sm:w-auto px-8 md:px-12 py-5 md:py-6 rounded-2xl bg-gradient-to-r from-[#8b5cf6] via-[#7c3aed] to-[#06b6d4] text-white font-technical font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-[10px] md:text-xs hover:shadow-[0_0_50px_rgba(6,182,212,0.4)] transition-all active:scale-95 flex items-center justify-center gap-4 group"
                            >
                                Kostenlose Beratung anfordern
                                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                </svg>
                            </a>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16 md:mb-20 w-full">
                            <ContactCard
                                label="E-Mail"
                                value="mail@westagentur.de"
                                icon={<svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>}
                            />
                            <ContactCard
                                label="Telefon"
                                value="Auf Anfrage"
                                icon={<svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>}
                            />
                            <ContactCard
                                label="Standort"
                                value="Deutschland"
                                icon={<svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>}
                            />
                            <ContactCard
                                label="Reaktionszeit"
                                value="24 Stunden"
                                icon={<svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-x-12 gap-y-4 text-neutral-500 font-technical text-[8px] md:text-[9px] uppercase tracking-[0.2em] opacity-60">
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-cyan-400">✓</span> Festpreis-Garantie
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-cyan-400">✓</span> Schnelle Umsetzung
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-cyan-400">✓</span> DSGVO-konform
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
