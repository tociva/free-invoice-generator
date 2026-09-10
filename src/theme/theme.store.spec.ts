import { ApplicationInitStatus, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { APP_THEME_STORAGE_KEY, AppThemeStore, provideAppTheme } from './theme.store';

describe('AppThemeStore', () => {
  let originalStyle: string | null;
  let originalTheme: string | null;

  beforeEach(() => {
    localStorage.removeItem(APP_THEME_STORAGE_KEY);
    originalStyle = document.documentElement.getAttribute('style');
    originalTheme = document.documentElement.getAttribute('data-theme');
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    localStorage.removeItem(APP_THEME_STORAGE_KEY);
    for (const [name, value] of [
      ['style', originalStyle],
      ['data-theme', originalTheme],
    ]) {
      if (value === null) document.documentElement.removeAttribute(name!);
      else document.documentElement.setAttribute(name!, value!);
    }
  });

  function expectAppliedTheme(darkMode: boolean): void {
    TestBed.tick();
    const root = document.documentElement;
    expect(root.dataset['theme']).toBe(darkMode ? 'dark' : 'light');
    expect(root.style.colorScheme).toBe(darkMode ? 'dark' : 'light');
    expect(root.style.getPropertyValue('--tng-semantic-background-base')).toBe(
      darkMode ? '#0b1220' : '#f9fafb',
    );
    expect(root.style.getPropertyValue('--app-page-max-width')).toBe('90rem');
  }

  it('defaults to light without writing storage', () => {
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const store = TestBed.inject(AppThemeStore);
    expect(store.darkMode()).toBe(false);
    expectAppliedTheme(false);
    expect(write).not.toHaveBeenCalled();
  });

  for (const darkMode of [false, true]) {
    it(`restores ${darkMode ? 'dark' : 'light'} from a boolean preference`, () => {
      localStorage.setItem(APP_THEME_STORAGE_KEY, JSON.stringify({ darkMode }));
      const write = vi.spyOn(Storage.prototype, 'setItem');
      expect(TestBed.inject(AppThemeStore).darkMode()).toBe(darkMode);
      expectAppliedTheme(darkMode);
      expect(write).not.toHaveBeenCalled();
    });
  }

  for (const value of [
    '',
    '{',
    'null',
    'true',
    'false',
    '1',
    '"dark"',
    'dark',
    'light',
    'system',
    '{}',
    '[]',
    '{"darkMode":"true"}',
    '{"darkMode":1}',
    '{"darkMode":null}',
    '{"darkMode":{}}',
    '{"darkMode":[]}',
  ]) {
    it(`defaults to light for invalid storage ${JSON.stringify(value)}`, () => {
      localStorage.setItem(APP_THEME_STORAGE_KEY, value);
      expect(TestBed.inject(AppThemeStore).darkMode()).toBe(false);
      expectAppliedTheme(false);
      expect(localStorage.getItem(APP_THEME_STORAGE_KEY)).toBe(value);
    });
  }

  it('persists explicit selections and toggles in both directions', () => {
    const store = TestBed.inject(AppThemeStore);
    store.setDarkMode(true);
    expectAppliedTheme(true);
    expect(localStorage.getItem(APP_THEME_STORAGE_KEY)).toBe('{"darkMode":true}');
    store.setDarkMode(false);
    expectAppliedTheme(false);
    expect(localStorage.getItem(APP_THEME_STORAGE_KEY)).toBe('{"darkMode":false}');
    store.toggleDarkMode();
    expect(store.darkMode()).toBe(true);
    expectAppliedTheme(true);
    expect(localStorage.getItem(APP_THEME_STORAGE_KEY)).toBe('{"darkMode":true}');
    store.toggleDarkMode();
    expect(store.darkMode()).toBe(false);
    expectAppliedTheme(false);
    expect(localStorage.getItem(APP_THEME_STORAGE_KEY)).toBe('{"darkMode":false}');
  });

  it('persists an explicit selection even when it matches the default', () => {
    TestBed.inject(AppThemeStore).setDarkMode(false);
    expect(localStorage.getItem(APP_THEME_STORAGE_KEY)).toBe('{"darkMode":false}');
  });

  it('defaults to light when getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Denied', 'SecurityError');
    });
    expect(TestBed.inject(AppThemeStore).darkMode()).toBe(false);
    expectAppliedTheme(false);
  });

  it('keeps both toggle directions working when the localStorage getter throws', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('Denied', 'SecurityError');
    });
    const store = TestBed.inject(AppThemeStore);
    expect(store.darkMode()).toBe(false);
    expectAppliedTheme(false);
    store.toggleDarkMode();
    expectAppliedTheme(true);
    store.toggleDarkMode();
    expectAppliedTheme(false);
  });

  it('changes state and rendered variables when storage writes fail', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError');
    });
    const store = TestBed.inject(AppThemeStore);
    store.setDarkMode(true);
    expect(store.darkMode()).toBe(true);
    expectAppliedTheme(true);
    store.setDarkMode(false);
    expect(store.darkMode()).toBe(false);
    expectAppliedTheme(false);
  });

  it('initializes during bootstrap without a header or routed component', async () => {
    localStorage.setItem(APP_THEME_STORAGE_KEY, '{"darkMode":true}');
    TestBed.configureTestingModule({ providers: [provideAppTheme()] });
    const status = TestBed.inject(ApplicationInitStatus);
    await status.donePromise;
    expectAppliedTheme(true);
    expect(TestBed.inject(AppThemeStore)).toBe(TestBed.inject(AppThemeStore));
  });

  it('avoids browser storage and DOM writes on the server', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const storage = vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('Browser API used on the server');
    });
    const store = TestBed.inject(AppThemeStore);
    expect(store.darkMode()).toBe(false);
    TestBed.tick();
    expect(document.documentElement.getAttribute('style')).toBe(originalStyle);
    expect(document.documentElement.getAttribute('data-theme')).toBe(originalTheme);
    store.toggleDarkMode();
    TestBed.tick();
    expect(storage).not.toHaveBeenCalled();
    expect(document.documentElement.getAttribute('style')).toBe(originalStyle);
  });
});
