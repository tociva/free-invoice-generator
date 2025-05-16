import { Component } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-date-picker-cell-editor',
  imports: [
    MatDatepicker,
    MatFormFieldModule,
    MatDatepickerModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,

  ],
  templateUrl: './date-picker-cell-editor.component.html',
  styleUrl: './date-picker-cell-editor.component.scss'
})
export class DatePickerCellEditor implements ICellEditorAngularComp {
  dateValue: Date = new Date();
  agInit(params: any): void {
    this.dateValue = params.value;
  }

  getValue(): string {
    const d = this.dateValue;
    if (!d) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }


}