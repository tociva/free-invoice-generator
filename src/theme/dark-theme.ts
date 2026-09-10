import { createTheme, defaultDarkThemePreset } from '@tailng-ui/theme';
import { appPrimitives } from './primitives';

export const appDarkTheme = createTheme(defaultDarkThemePreset, {
  meta: { name: 'daybook-dark', mode: 'dark' },
  tokens: {
    primitives: appPrimitives,
    semantic: {
      background: {
        base: '{color.grey950}',
        canvas: '{color.grey900}',
        muted: '{color.grey700}',
        surface: '{color.grey800}',
        surfaceHover: '{color.grey700}',
        elevated: '{color.grey800}',
        brand: '{color.brandActive}',
        document: '{color.white}',
      },
      foreground: {
        primary: '{color.grey050}',
        secondary: '{color.grey300}',
        muted: '{color.grey400}',
        inverse: '{color.grey950}',
        onBrand: '{color.cream}',
      },
      border: { default: '{color.grey600}', subtle: '{color.grey700}', strong: '{color.grey400}' },
      accent: {
        brand: '{color.brandLight}',
        brandHover: '{color.brandLightHover}',
        brandActive: '{color.brandLightActive}',
        danger: '{color.dangerLight}',
        success: '{color.successLight}',
        warning: '{color.warningLight}',
      },
      focus: { ring: '{color.brandLight}' },
    },
  },
});
