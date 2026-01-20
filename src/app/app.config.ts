import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { countryStore } from './components/invoice/store/country/country.store';
import { dateFormatStore } from './components/invoice/store/date-format/date-format.store';
import { currencyStore } from './components/invoice/store/currency/currency.store';
import { provideAppIcon } from './provider/icon-provider';
import { templateStore } from './components/invoice/store/template/template.store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAppIcon(),
    countryStore,
    dateFormatStore,
    currencyStore,
    templateStore
  ]
};
