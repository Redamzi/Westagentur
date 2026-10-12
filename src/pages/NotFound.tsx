import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { HOME_PATH, type Lang } from '../seo/site';

const TEXT: Record<Lang, { title: string; desc: string; back: string }> = {
  de: { title: 'Seite nicht gefunden', desc: 'Die angeforderte Seite existiert nicht oder wurde verschoben.', back: 'Zur Startseite' },
  en: { title: 'Page not found', desc: 'The requested page does not exist or has been moved.', back: 'Back to home' },
};

const NotFound: React.FC<{ lang: Lang }> = ({ lang }) => (
  <section className="pt-28 md:pt-40 pb-20 md:pb-32 bg-background">
    <div className="container mx-auto px-6 max-w-3xl">
      <p className="text-accent font-display font-bold tracking-widest mb-4">404</p>
      <h1 className="heading-section mb-6">{TEXT[lang].title}</h1>
      <p className="text-muted text-lg mb-10">{TEXT[lang].desc}</p>
      <Link to={HOME_PATH[lang]} className="btn-primary">
        {TEXT[lang].back} <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  </section>
);

export default NotFound;
