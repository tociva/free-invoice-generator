import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import { setInvoiceDetailsDecimalPlaces } from '../actions/invoice-details.action';
import { setInvoiceCurrency } from '../actions/invoice.action';

@Injectable()
export class InvoiceDetailsEffects {
  constructor(private actions$: Actions) {}

  updateDecimalPlacesOnCurrencyChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setInvoiceCurrency),
      map(({ currency }) => {
        return setInvoiceDetailsDecimalPlaces({ decimalPlaces: currency.decimal });
      })
    )
  );

}
