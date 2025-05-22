import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, delay, map, mergeMap } from 'rxjs/operators';
import * as TaxActions from '../actions/tax.actions';

@Injectable()
export class TaxEffects {
  private taxes = ['CGST/SGST', 'IGST', 'Non-Taxable'];
  constructor(private actions$: Actions) {}

  loadTaxes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaxActions.loadTaxes),
      mergeMap(() => {
        // Simulate a delay for API call
        return of(this.taxes).pipe(
          delay(500), // Simulated delay
          map((taxes: string[]) =>
            TaxActions.loadTaxesSuccess({ taxes })
          ),
          catchError(error =>
            of(TaxActions.loadTaxesFailure({ error: error.message }))
          )
        );
      })
    )
  );

}
