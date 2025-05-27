import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import { setCustomerCountry, setInvoiceCurrency } from '../actions/invoice.action';

@Injectable()
export class CustomerEffects {
  constructor(private actions$: Actions) {}

  updateCurrencyOnCountryChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setCustomerCountry),
      map(({ country }) => {
        return setInvoiceCurrency({ currency: country.currency });
      })
    )
  );

}
