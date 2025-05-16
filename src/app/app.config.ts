import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core'; // ✅ Add this
import { provideStore } from '@ngrx/store';

import { routes } from './app.routes';
import { countryReducer } from './components/invoice/store/reducer/country.reducer';
import { CountryEffects } from './components/invoice/store/effects/country.effects';
import { provideEffects } from '@ngrx/effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore({
      country: countryReducer
    }),
    provideEffects([CountryEffects]),
    provideNativeDateAdapter()
  ]
};
