import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-checkbox-cell-renderer',
  standalone: true,
  template: `
    <mat-checkbox [checked]="_value" (change)="onToggle($event.checked)">
    </mat-checkbox>
  `,
  imports: [MatCheckboxModule]
})
export class CheckboxCellRendererComponent implements ICellRendererAngularComp {
  private params: any;
  _value = false;

  agInit(params: any): void {
    this.params = params;
    this._value = params.value === 'true';
  }

  refresh(): boolean {
    return false;
  }

  onToggle(checked: boolean) {
    this._value = checked;
    this.params.node.setDataValue(this.params.colDef.field, checked.toString());
  }
}
