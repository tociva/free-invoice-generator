import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core'; // ✅ Add this
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { routes } from './app.routes';
import { CountryEffects } from './components/invoice/store/effects/country.effects';
import { CurrencyEffects } from './components/invoice/store/effects/currency.effects';
import { countryReducer } from './components/invoice/store/reducer/country.reducer';
import { currencyReducer } from './components/invoice/store/reducer/currency.reducer';
import { TaxEffects } from './components/invoice/store/effects/tax.effects';
import { taxReducer } from './components/invoice/store/reducer/tax.reducer';
import { dateFormatReducer } from './components/invoice/store/reducer/date-format.reducer';
import { DateFormatEffects } from './components/invoice/store/effects/date-format.effects';
import { invoiceReducer } from './components/invoice/store/reducer/invoice.reducer';
import { provideHttpClient } from '@angular/common/http';
import { templateReducer } from './components/templates/store/reducer/template.reducer';
import { TemplateEffects } from './components/templates/store/effects/tempate.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore({
      country: countryReducer,
      currency: currencyReducer,
      dateFormat: dateFormatReducer,
      tax: taxReducer,
      invoice: invoiceReducer,
      template: templateReducer
    }),
    provideEffects([CountryEffects, CurrencyEffects, DateFormatEffects, TaxEffects, TemplateEffects]),
    provideNativeDateAdapter(),
    provideHttpClient()
  ]
};
