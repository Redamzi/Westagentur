import React from 'react';
import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import Services from './sections/Services';
import AIAssistant from './sections/AIAssistant';
import About from './sections/About';
import Projects from './sections/Projects';
import WhyUs from './sections/WhyUs';
import FAQ from './sections/FAQ';
import CTA from './sections/CTA';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/30">
      <Navbar />
      <main>
        <Hero />
        <AIAssistant />
        <Services />
        <About />
        <Projects />
        <WhyUs />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;
