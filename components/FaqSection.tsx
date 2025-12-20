
import React, { useState } from 'react';
import { FAQS } from '../constants';

const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 md:py-40 relative overflow-hidden px-4">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-24">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 mb-6 text-[9px] font-technical font-bold tracking-[0.2em] text-cyan-400 cosmic-glass rounded-full border-cyan-500/10 uppercase shadow-[0_0_20px_rgba(0,242,255,0.05)]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f2ff]"></span>
              Wissensdatenbank
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-vanguard font-black mb-6 md:mb-8 uppercase tracking-[0.05em] italic leading-tight">
                <span className="shimmer-text block mb-2">Häufig gestellte</span>
                <span className="text-white opacity-40">Fragen</span>
            </h2>
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent mx-auto"></div>
        </div>

        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          {FAQS.map((faq, idx) => (
            <div 
              key={idx} 
              className={`rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden transition-all duration-700 cosmic-glass ${openIndex === idx ? 'border-cyan-500/20 shadow-[0_0_40px_rgba(0,242,255,0.05)]' : 'border-white/5 opacity-80 hover:opacity-100'}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full text-left p-6 md:p-10 flex justify-between items-center group relative overflow-hidden"
              >
                <div className="flex flex-col gap-2 md:gap-3 relative z-10 pr-6">
                   <span className="text-[7px] md:text-[8px] font-technical text-cyan-500/60 tracking-[0.2em] uppercase font-bold">{faq.category}</span>
                   <span className="font-vanguard font-black text-sm md:text-xl lg:text-2xl uppercase tracking-[0.02em] transition-colors group-hover:text-cyan-400 leading-tight italic">{faq.question}</span>
                </div>
                <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center border transition-all duration-500 flex-shrink-0 ${openIndex === idx ? 'rotate-180 bg-cyan-400 border-cyan-400 text-black shadow-[0_0_20px_rgba(0,242,255,0.4)]' : 'border-white/10 group-hover:border-cyan-400/50 group-hover:text-cyan-400'}`}>
                  <svg className="w-3 h-3 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </button>
              
              <div className={`overflow-hidden transition-all duration-700 ease-in-out ${openIndex === idx ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 md:p-10 pt-0 border-t border-white/5">
                  <div className="pl-0 md:pl-2 border-l-2 border-cyan-500/20">
                    <p className="text-neutral-400 leading-relaxed text-sm md:text-lg font-body font-light italic opacity-90 pl-4">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
