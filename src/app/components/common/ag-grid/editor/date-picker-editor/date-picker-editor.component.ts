import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';
import { DayjsDateAdapter } from '../../../adapters/dayjs-date.adapter';

interface NgGridDateInput {
  value?: Date,
  format?: string;
}

@Component({
  selector: 'app-date-picker-editor',
  imports: [
    CommonModule, 
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule, 
    ReactiveFormsModule, 
    FormsModule, 
    MatInputModule],
    providers: [
      DayjsDateAdapter,
      {
        provide: DateAdapter,
        useExisting: DayjsDateAdapter,
      },
      {
        provide: MAT_DATE_FORMATS,
        useValue: {
          parse: {
            dateInput: '',
          },
          display: {
            dateInput: '',
            monthYearLabel: 'MMM YYYY',
            dateA11yLabel: 'DD/MM/YYYY',
            monthYearA11yLabel: 'MMMM YYYY',
          },
        },
      },
    ],
  templateUrl: './date-picker-editor.component.html',
  styleUrl: './date-picker-editor.component.scss',
  
})
export class DatePickerEditorComponent implements ICellEditorAngularComp {
  
  private adapter = inject(DayjsDateAdapter);

  
  dateControl = new FormControl<Date>(new Date());
  
  @ViewChild('datePickerInput') datePickerInput!:ElementRef<HTMLInputElement>;

  getValue = ():string => {
    const value = this.dateControl.value;
    if (!value) {
      return new Date().toISOString();
    }
    return value.toISOString();
  };

  agInit(params: ICellEditorParams): void {
    const {value, format} = params as unknown as NgGridDateInput;
    this.adapter.setFormat(format ?? 'DD-MM-YYYY');
    this.dateControl.setValue(value ?? new Date());
  }

  afterGuiAttached(): void {

    this.datePickerInput.nativeElement.select();

  }

}
