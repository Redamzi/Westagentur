
export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export interface PricingPackage {
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
}

export interface Step {
  title: string;
  description: string;
  phase: string;
}
