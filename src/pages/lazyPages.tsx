import React from 'react';
import type { PageKind } from '../seo/pages';

// Everything except the home page is loaded on demand, so the start page ships less JavaScript.
const loaders = {
  service: () => import('./ServicePage'),
  legal: () => import('./LegalPage'),
  booking: () => import('./BookingPage'),
  case: () => import('./CaseStudyPage'),
  manage: () => import('./ManageBookingPage'),
  admin: () => import('./AdminPage'),
  notfound: () => import('./NotFound'),
} satisfies Partial<Record<PageKind, () => Promise<{ default: React.ComponentType<any> }>>>;

export type LazyKind = keyof typeof loaders;

const loaded = new Map<LazyKind, React.ComponentType<any>>();
const pending = new Map<LazyKind, Promise<void>>();

export const isLazyKind = (kind: PageKind): kind is LazyKind => kind in loaders;

/** Loads the code of a page; awaited before hydration so the prerendered HTML is reused as is. */
export const loadPage = (kind: PageKind): Promise<void> => {
  if (!isLazyKind(kind) || loaded.has(kind)) return Promise.resolve();
  if (!pending.has(kind)) {
    pending.set(kind, loaders[kind]().then((m) => void loaded.set(kind, m.default)));
  }
  return pending.get(kind)!;
};

/** Prerendering: all pages must be available synchronously. */
export const loadAllPages = () => Promise.all(Object.keys(loaders).map((kind) => loadPage(kind as LazyKind)));

/** Renders a lazily loaded page; suspends (nearest <Suspense>) until its code is there. */
export const LazyPage = ({ kind, ...props }: { kind: LazyKind } & Record<string, unknown>) => {
  const Component = loaded.get(kind);
  if (!Component) throw loadPage(kind);
  return <Component {...props} />;
};
