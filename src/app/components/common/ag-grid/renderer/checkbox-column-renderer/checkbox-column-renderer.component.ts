import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ICellRendererParams } from 'ag-grid-community';

interface CheckboxColumn {
  selected: boolean;
  onToggle?: (arg0: boolean) => void;
}

@Component({
  selector: 'app-checkbox-column-renderer',
  imports: [MatCheckboxModule],
  templateUrl: './checkbox-column-renderer.component.html',
  styleUrl: './checkbox-column-renderer.component.scss'
})
export class CheckboxColumnRendererComponent implements ICellRendererAngularComp {
  
  value = false;
  _onToggle?: (arg0: boolean) => void;

  agInit(params: ICellRendererParams<{ id: string }> & CheckboxColumn): void {
    this.value = params.selected;
    if (params.onToggle) {
      this._onToggle = params.onToggle;
    }
  }

  refresh(): boolean {
    return false;
  }

  onToggle(checked: boolean) {
    this.value = checked;
    if (this._onToggle) {
      this._onToggle(checked);
    }
  }
}
