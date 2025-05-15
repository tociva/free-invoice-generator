import { Component } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { Observable, of, startWith, map } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import data from '../../../../assets/country-list.json';

@Component({
  selector: 'app-country-autocomplete-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatAutocompleteModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './country-autocomplete-editor.component.html',
  styleUrl: './country-autocomplete-editor.component.scss'
})
export class CountryAutocompleteEditorComponent implements ICellEditorAngularComp {
  control = new FormControl<string>('');
  countries: string[] = [];
  filteredCountries: Observable<string[]> = of([]);
  private params: any;

  constructor(private http: HttpClient) { }

  agInit(params: any): void {
    this.params = params;
    const initialValue = (params.value ?? '') as string;
    this.control.setValue(initialValue);
    this.countries = data.map((c: { name: any; }) => c.name);
  }
  getValue(): string {
    return this.control.value ?? '';
  }
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.countries.filter(option =>
      option.toLowerCase().includes(filterValue)
    );
  }
}
