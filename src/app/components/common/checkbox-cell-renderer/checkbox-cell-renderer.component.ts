import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-checkbox-cell-renderer',
  imports: [
    MatCheckboxModule
  ],
  templateUrl: './checkbox-cell-renderer.component.html',
  styleUrl: './checkbox-cell-renderer.component.scss'
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