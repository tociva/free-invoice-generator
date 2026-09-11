import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTngIcons } from '@tailng-ui/icons';
import { countryStore } from '../components/invoice/store/country/country.store';
import { currencyStore } from '../components/invoice/store/currency/currency.store';
import { dateFormatStore } from '../components/invoice/store/date-format/date-format.store';
import { templateStore } from '../components/invoice/store/template/template.store';

export const testProviders = [
  provideRouter([]),
  provideHttpClient(),
  provideHttpClientTesting(),
  provideTngIcons(),
  countryStore,
  currencyStore,
  dateFormatStore,
  templateStore,
];
