import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

interface IconColumnParam {
  icon: string;
  customClass: string;
  iconClickListener: (rowId: string) => void;
}

@Component({
  selector: 'app-icon-column-renderer',
  imports: [MatIconModule, CommonModule],
  templateUrl: './icon-column-renderer.component.html',
  styleUrl: './icon-column-renderer.component.scss'
})
export class IconColumnRendererComponent implements ICellRendererAngularComp{
  
  icon!: string;

  rowId!: string;

  customClass = 'icon-column';

  iconClickListener!: (rowId: string) => void;

  // eslint-disable-next-line class-methods-use-this
  refresh = (params: ICellRendererParams): boolean => false;

  agInit(params: ICellRendererParams<{id: string}> & IconColumnParam): void {

    if (!params.data || !params.node.id) {

      return;

    }
    this.icon = params.icon;
    this.rowId = params.node.id;
    this.iconClickListener = params.iconClickListener;
    this.customClass = params.customClass ?? 'icon-column';

  }

  handleIconClick = () => {

    this.iconClickListener(this.rowId);

  };

}
