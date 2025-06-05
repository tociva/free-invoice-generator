import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, delay, map, mergeMap } from 'rxjs/operators';
import * as CountryActions from '../actions/country.actions';
import { Country } from '../model/country.model';
import { countries } from './country-list';

@Injectable()
export class CountryEffects {
  constructor(private actions$: Actions) { }

  loadCountries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CountryActions.loadCountries),
      mergeMap(() =>
        of(countries).pipe(
          delay(500),
          map((result: Country[]) =>
            CountryActions.loadCountriesSuccess({ countries: result })
          ),
          catchError((error) =>
            of(CountryActions.loadCountriesFailure({ error: error.message }))
          )
        )
      )
    )
  );
}
