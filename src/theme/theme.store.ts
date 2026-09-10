import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { effect, inject, PLATFORM_ID, provideAppInitializer } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { applyTailngTheme } from '@tailng-ui/theme';
import { appDarkTheme } from './dark-theme';
import { appLightTheme } from './light-theme';
import { appLayout } from './primitives';

export const APP_THEME_STORAGE_KEY = 'daybook-theme';

function browserWindow(): Window | null {
  const document = inject(DOCUMENT);
  return isPlatformBrowser(inject(PLATFORM_ID)) ? document.defaultView : null;
}

function readDarkMode(window: Window | null): boolean {
  try {
    const stored: unknown = JSON.parse(
      window?.localStorage.getItem(APP_THEME_STORAGE_KEY) ?? 'null',
    );
    return (
      typeof stored === 'object' &&
      stored !== null &&
      'darkMode' in stored &&
      typeof stored.darkMode === 'boolean' &&
      stored.darkMode
    );
  } catch {
    return false;
  }
}

export const AppThemeStore = signalStore(
  { providedIn: 'root' },
  withState(() => ({ darkMode: readDarkMode(browserWindow()) })),
  withMethods((store, window = browserWindow()) => {
    const setDarkMode = (isDark: boolean): void => {
      patchState(store, { darkMode: isDark });
      try {
        window?.localStorage.setItem(APP_THEME_STORAGE_KEY, JSON.stringify({ darkMode: isDark }));
      } catch {
        // A denied or full storage must not block the in-memory selection.
      }
    };

    return {
      setDarkMode,
      toggleDarkMode: () => setDarkMode(!store.darkMode()),
    };
  }),
  withHooks({
    onInit(store) {
      const document = inject(DOCUMENT);
      const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

      effect(() => {
        const darkMode = store.darkMode();
        if (!isBrowser) return;

        const root = document.documentElement;
        applyTailngTheme(darkMode ? appDarkTheme : appLightTheme, { target: root });
        // TailNG 0.75 sets variables and color-scheme, but does not set data-theme.
        root.dataset['theme'] = darkMode ? 'dark' : 'light';
        for (const [name, value] of Object.entries(appLayout)) {
          root.style.setProperty(`--app-${name}`, value);
        }
      });
    },
  }),
);

/** Restore the root store during bootstrap, independently of the routed components. */
export const provideAppTheme = () =>
  provideAppInitializer(() => {
    inject(AppThemeStore);
  });
