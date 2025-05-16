import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

interface LabelColumn {
  labelValue: string;
  labelClass?: string;
  multiLine?: boolean;
}

@Component({
  selector: 'app-label-column-renderer',
  imports: [CommonModule],
  templateUrl: './label-column-renderer.component.html',
  styleUrl: './label-column-renderer.component.scss'
})
export class LabelColumnRendererComponent implements ICellRendererAngularComp {

  labelValue!: string;

  labelClass = '';

  multiLine = false;

  // eslint-disable-next-line class-methods-use-this
  refresh = (_params: ICellRendererParams): boolean => false;

  agInit(params: ICellRendererParams<{ id: string }> & LabelColumn): void {

    this.labelValue = params.labelValue;
    if (params.labelClass) {

      this.labelClass = params.labelClass;

    }
    this.multiLine = params.multiLine ?? false;

  }

}