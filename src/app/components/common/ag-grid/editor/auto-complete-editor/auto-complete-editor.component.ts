import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';
import { mergeMap, Observable, startWith } from 'rxjs';

interface NgGridAutoCompleteInput<T> {
  optionsFetcher: (arg0: T | null) => Observable<T[]>;
  onOptionSelected?: (arg0: T) => void;
  displayWith: (option: T) => string;
  value: T;
}

@Component({
  selector: 'app-auto-complete-editor',
  imports: [CommonModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, FormsModule],
  templateUrl: './auto-complete-editor.component.html',
  styleUrl: './auto-complete-editor.component.scss'
})
export class AutoCompleteEditorComponent<T> implements ICellEditorAngularComp {
  
  autoControl = new FormControl<T>(<T>null);

  optionsObservable$!: Observable<T[]>;

  displayWith!: (option: T) => string;

  @ViewChild('autoGridInput') autoGridInput!: ElementRef<HTMLInputElement>;

  getValue = (): T | null => this.autoControl.value;

  _onOptionSelected!: (arg0: T) => void;

  agInit(params: ICellEditorParams): void {

    const { optionsFetcher, displayWith, value, onOptionSelected } = params as unknown as NgGridAutoCompleteInput<T>;
    this.displayWith = displayWith;
    this.autoControl.setValue(value);
    this.optionsObservable$ = this.autoControl.valueChanges.pipe(
      startWith(null), mergeMap((val) => optionsFetcher(val))
    );
    if (onOptionSelected) {

      this._onOptionSelected = onOptionSelected;

    }

  }

  afterGuiAttached(): void {

    this.autoGridInput.nativeElement.select();

  }

  onOptionSelected(event: MatAutocompleteSelectedEvent) {

    if (this._onOptionSelected) {

      this._onOptionSelected(event.option.value);

    }

  }

}
