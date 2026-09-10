import { isThemeContractValid, toCssVars } from '@tailng-ui/theme';
import { appDarkTheme, appLightTheme } from './index';

function luminance(hex: string): number {
  const rgb = hex
    .replace('#', '')
    .match(/../g)!
    .map((channel) => {
      const value = parseInt(channel, 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

describe('Application TNG themes', () => {
  for (const theme of [appLightTheme, appDarkTheme]) {
    it(`${theme.meta.mode} resolves a complete TNG contract with readable semantic colors`, () => {
      expect(isThemeContractValid(theme)).toBe(true);
      const vars = toCssVars(theme);
      expect(Object.values(vars).some((value) => value.includes('{color.'))).toBe(false);
      const contrast = (foreground: string, background: string) => {
        const a = luminance(vars[`--tng-semantic-${foreground}`]);
        const b = luminance(vars[`--tng-semantic-${background}`]);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      };
      for (const text of ['primary', 'secondary', 'muted']) {
        expect(contrast(`foreground-${text}`, 'background-surface')).toBeGreaterThanOrEqual(4.5);
      }
      for (const accent of ['brand', 'brandHover', 'brandActive', 'danger', 'success']) {
        expect(contrast('foreground-inverse', `accent-${accent}`)).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
  it('exposes identical variable names for either mode', () => {
    expect(Object.keys(toCssVars(appLightTheme)).sort()).toEqual(
      Object.keys(toCssVars(appDarkTheme)).sort(),
    );
  });
});
