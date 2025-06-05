import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, delay, map, mergeMap } from 'rxjs/operators';
import * as DateFormatActions from '../actions/date-format.actions';
import { DateFormat } from '../model/date-format.model';
import { countries } from './country-list';

@Injectable()
export class DateFormatEffects {
  constructor(private actions$: Actions) {}

  loadDateFormats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DateFormatActions.loadDateFormats),
      mergeMap(() => {
        // Simulate a delay for API call
        const dateFormatsAll = countries.map((country) => country.dateformat);
        const dateFormats = Array.from(
          new Map(dateFormatsAll.map((c) => [c.name, c])).values()
        );
        return of(dateFormats).pipe(
          delay(500), // Simulated delay
          map((dfList: DateFormat[]) =>
            DateFormatActions.loadDateFormatsSuccess({ dateFormats:dfList })
          ),
          catchError((error) =>
            of(DateFormatActions.loadDateFormatsFailure({ error: error.message }))
          )
        );
      })
    )
  );

}
