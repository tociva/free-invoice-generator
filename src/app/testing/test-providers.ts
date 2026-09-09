import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { countryStore } from '../components/invoice/store/country/country.store';
import { currencyStore } from '../components/invoice/store/currency/currency.store';
import { dateFormatStore } from '../components/invoice/store/date-format/date-format.store';
import { templateStore } from '../components/invoice/store/template/template.store';
import { provideAppIcon } from '../provider/icon-provider';

export const testProviders = [
  provideRouter([]),
  provideHttpClient(),
  provideHttpClientTesting(),
  provideAppIcon(),
  countryStore,
  currencyStore,
  dateFormatStore,
  templateStore,
];
