import { Component } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-picker-cell-editor',
  standalone: true,
  template: `
    <div style="display: flex; align-items: center; height: 100%; width: 100%;">
  <mat-form-field appearance="outline" style="width: 100%; margin: 0; height:190%">
    <input matInput [matDatepicker]="picker" [(ngModel)]="dateValue" />
    <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
    <mat-datepicker #picker></mat-datepicker>
  </mat-form-field>
</div>

  `,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule
  ],
})
export class DatePickerCellEditor implements ICellEditorAngularComp {
  dateValue: Date = new Date();

  agInit(params: any): void {
    const val = params.value;
    this.dateValue = val ? new Date(val) : new Date();
  }

 getValue(): string {
    const d = this.dateValue;
    if (!d) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }
}

