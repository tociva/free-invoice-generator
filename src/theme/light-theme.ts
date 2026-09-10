import { createTheme, defaultThemePreset } from '@tailng-ui/theme';
import { appPrimitives } from './primitives';

export const appLightTheme = createTheme(defaultThemePreset, {
  meta: { name: 'daybook-light', mode: 'light' },
  tokens: {
    primitives: appPrimitives,
    semantic: {
      background: {
        base: '{color.grey050}',
        canvas: '{color.grey100}',
        muted: '{color.grey200}',
        surface: '{color.white}',
        surfaceHover: '{color.grey100}',
        elevated: '{color.white}',
        brand: '{color.brand}',
        document: '{color.white}',
      },
      foreground: {
        primary: '{color.grey800}',
        secondary: '{color.grey600}',
        muted: '{color.grey500}',
        inverse: '{color.white}',
        onBrand: '{color.cream}',
      },
      border: { default: '{color.grey300}', subtle: '{color.grey200}', strong: '{color.grey500}' },
      accent: {
        brand: '{color.brand}',
        brandHover: '{color.brandHover}',
        brandActive: '{color.brandActive}',
        danger: '{color.danger}',
        success: '{color.success}',
        warning: '{color.warning}',
      },
      focus: { ring: '{color.brand}' },
    },
  },
});
