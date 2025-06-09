import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AgGridModule } from 'ag-grid-angular';
import { GetRowIdParams, GridOptions } from 'ag-grid-community';
import { FormColumnDef } from '../../../../util/form-column-def.type';
import { loadCountries } from '../store/actions/country.actions';
import { loadCurrencies } from '../store/actions/currency.actions';
import { loadDateFormats } from '../store/actions/date-format.actions';
import { CreateInvoiceOrganizationComponent } from './create-invoice-organization.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-create-invoice',
  standalone: true,
  imports: [
    AgGridModule,
    DragDropModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './create-invoice.component.html',
  styleUrl: './create-invoice.component.scss'
})
export class CreateInvoiceComponent extends CreateInvoiceOrganizationComponent implements OnInit {
  showDiscount = false;
  showSummary = false;
  uploadedSmallLogo: File[] = [];
  uploadedLargeLogo: File[] = [];
  smallLogoPreviewUrl: string | null = null;
  largeLogoPreviewUrl: string | null = null;


  gridOptions: GridOptions = {
    domLayout: 'autoHeight',
    rowHeight: 30,
    singleClickEdit: true,
    enableBrowserTooltips: true,
    stopEditingWhenCellsLoseFocus: false,
  };

  defaultColDef = {
    sortable: false,
    resizable: false,
    suppressMenu: true,
    editable: false
  };

  ngOnInit(): void {
    this.store.dispatch(loadCountries());
    this.store.dispatch(loadCurrencies());
    this.store.dispatch(loadDateFormats());
  }

  // eslint-disable-next-line class-methods-use-this
  getRowId = (params: GetRowIdParams<FormColumnDef>) => {
    const data = params?.data;
    return data?.label ?? '';
  };
  // eslint-disable-next-line class-methods-use-this
  onSmallLogoDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onSmallLogoDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleSmallLogo(files[0]);
    }
  }

  onSmallLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.handleSmallLogo(files[0]);
      input.value = '';
    }
  }

  private handleSmallLogo(file: File): void {
    if (file.type.startsWith('image/')) {
      this.uploadedSmallLogo = [file];
      const reader = new FileReader();
      reader.onload = () => {
        this.smallLogoPreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      console.warn('Unsupported small logo type:', file.type);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  onLargeLogoDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onLargeLogoDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleLargeLogo(files[0]);
    }
  }

  onLargeLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.handleLargeLogo(files[0]);
      input.value = '';
    }
  }

  private handleLargeLogo(file: File): void {
    if (file.type.startsWith('image/')) {
      this.uploadedLargeLogo = [file];
      const reader = new FileReader();
      reader.onload = () => {
        this.largeLogoPreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      console.warn('Unsupported large logo type:', file.type);
    }
  }
}

