import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Country } from '../components/invoice/store/model/country.model';
import { map, Observable } from 'rxjs';
import { selectAllCountries } from '../components/invoice/store/selectors/country.selectors';
import { OPTIONS_COUNT } from '../../util/constants';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  constructor(private store:Store) { }

  fetchCountries(val?: string | Country): Observable<Country[]> {
    return this.store.select(selectAllCountries).pipe(
      map((countries) => {
        if (val && typeof val === 'object') {
          return [];
        }

        if (!val?.trim()) {
          return countries.slice(0, OPTIONS_COUNT);
        }

        const filterVal = val.toLowerCase();
        return countries
          .filter((country) => country.name.toLowerCase().startsWith(filterVal))
          .slice(0, OPTIONS_COUNT);
      })
    );
  }
}
