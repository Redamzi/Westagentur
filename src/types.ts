
// Types definitions
export interface FAQItem {
  category: string;
  question: string;
  answer: string;
}

export interface PricingPackage {
  name: string;
  price: string;
  recommended?: boolean;
  features: string[];
}

export interface ServiceData {
  title: string;
  subtitle: string;
  heroText: string;
  content: string;
  features: { title: string; desc: string }[];
}

// Navigation Steps (optional, generic)
export type Step = 'home' | 'details' | 'contact' | 'success';
