import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { createTheme, defaultThemePreset, provideTailngTheme } from '@tailng-ui/theme';
import { routes } from './app.routes';
import { countryStore } from './components/invoice/store/country/country.store';
import { currencyStore } from './components/invoice/store/currency/currency.store';
import { dateFormatStore } from './components/invoice/store/date-format/date-format.store';
import { templateStore } from './components/invoice/store/template/template.store';
import { provideAppIcon } from './provider/icon-provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideTailngTheme({
      theme: createTheme(defaultThemePreset, {
        tokens: { semantic: { accent: { brand: '#367588' } } },
      }),
    }),
    provideAppIcon(),
    countryStore,
    dateFormatStore,
    currencyStore,
    templateStore,
  ],
};
