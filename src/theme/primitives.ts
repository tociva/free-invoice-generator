import { ThemePrimitives } from '@tailng-ui/theme';
import { appPalette } from './palette';

export const appPrimitives = {
  color: appPalette,
  typography: {
    fontSans: '"Inter", ui-sans-serif, system-ui, sans-serif',
    fontHeading: '"Nunito Sans", ui-sans-serif, system-ui, sans-serif',
    fontMono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    textXs: '0.75rem',
    textSm: '0.875rem',
    textMd: '0.9375rem',
    textLg: '1.125rem',
    textTitle: '2.25rem',
  },
  radius: {
    none: '0',
    xs: '0.25rem',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
    control: '0.375rem',
  },
  spacing: {
    none: '0',
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    '3xl': '3rem',
  },
  motion: {
    durationFast: '120ms',
    durationNormal: '180ms',
    durationSlow: '280ms',
    easingStandard: 'cubic-bezier(0.2, 0, 0, 1)',
  },
} as const satisfies ThemePrimitives;

/** TNG 0.75 has no layout/shadow scales. These app-only primitives are exposed once. */
export const appLayout = {
  'page-max-width': '90rem',
  'content-max-width': '75rem',
  'page-padding-inline': '1.5rem',
  'page-padding-bottom': '4rem',
  'grid-gap': '1.25rem',
  'shadow-surface': '0 4px 20px color-mix(in srgb, var(--tng-color-black) 8%, transparent)',
  'shadow-overlay': '0 12px 40px color-mix(in srgb, var(--tng-color-black) 20%, transparent)',
} as const;

/** CSS media queries use matching literals: custom properties cannot be used in queries. */
export const appBreakpoints = {
  compact: 640,
  page: 700,
  editor: 768,
  wide: 1024,
  catalog: 1280,
} as const;
