import React from 'react';

/**
 * Westagentur mark: arrow pointing west + cursor dot in a tile.
 * Colours follow the design tokens, so it inverts inside .section-dark.
 */
const LogoMark: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" className={`shrink-0 ${className}`}>
    <rect x="2" y="2" width="60" height="60" rx="14" fill="rgb(var(--c-primary))" />
    <polyline
      points="34,18 20,32 34,46"
      fill="none"
      stroke="rgb(var(--c-background))"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="45" cy="32" r="5" fill="rgb(var(--c-logo-dot))" />
  </svg>
);

export default LogoMark;
