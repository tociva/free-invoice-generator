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
import { organizationReducer } from './components/invoice/store/reducer/organization.reducer';
import { TaxEffects } from './components/invoice/store/effects/tax.effects';
import { taxReducer } from './components/invoice/store/reducer/tax.reducer';
import { invoiceDetailsReducer } from './components/invoice/store/reducer/invoice-details.reducer';
import { InvoiceDetailsEffects } from './components/invoice/store/effects/invoice-details.effects';
import { dateFormatReducer } from './components/invoice/store/reducer/date-format.reducer';
import { DateFormatEffects } from './components/invoice/store/effects/date-format.effects';
import { invoiceReducer } from './components/invoice/store/reducer/invoice.reducer';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore({
      country: countryReducer,
      currency: currencyReducer,
      dateFormat: dateFormatReducer,
      organization: organizationReducer,
      invoiceDetails: invoiceDetailsReducer,
      tax: taxReducer,
      invoice: invoiceReducer
    }),
    provideEffects([CountryEffects, CurrencyEffects, DateFormatEffects, TaxEffects, InvoiceDetailsEffects]),
    provideNativeDateAdapter(),
    provideHttpClient()
  ]
};
