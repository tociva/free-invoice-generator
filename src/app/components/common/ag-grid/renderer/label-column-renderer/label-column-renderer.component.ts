import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { MatIconModule } from '@angular/material/icon';

interface LabelColumn {
  labelValue: string;
  labelClass?: string;
  multiLine?: boolean;
  tooltip?: string;
  maxLength?: number;
  icon?: string;
  iconClass?: string;
}

@Component({
  selector: 'app-label-column-renderer',
  imports: [CommonModule, MatIconModule],
  templateUrl: './label-column-renderer.component.html',
  styleUrl: './label-column-renderer.component.scss'
})
export class LabelColumnRendererComponent implements ICellRendererAngularComp {

  labelValue!: string;

  labelClass = '';

  multiLine = false;

  icon!: string;
  
  iconClass = 'icon-column';
  // eslint-disable-next-line class-methods-use-this
  refresh = (_params: ICellRendererParams): boolean => true;

  agInit(params: ICellRendererParams<{ id: string }> & LabelColumn): void {

    const labelValue = params.labelValue;
    let labelValueToDisplay = labelValue;
    if (params.maxLength && labelValue.length > params.maxLength) {
      labelValueToDisplay = `${labelValue.substring(0, params.maxLength - 3) }...`;
    } 
    if(params.tooltip) {
      labelValueToDisplay = `${labelValueToDisplay} <span class="tooltip-trigger" tabindex="0" >?
      <span class="tooltip-text">${params.tooltip}</span>
      </span>`;
    }
    this.labelValue = `<span>${labelValueToDisplay}</span>`;
    if (params.labelClass) {

      this.labelClass = params.labelClass;

    }
    this.multiLine = params.multiLine ?? false;
    this.icon = params.icon ?? '';
    this.iconClass = params.iconClass ?? 'icon-column';
  }

}