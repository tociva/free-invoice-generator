import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AgGridModule } from 'ag-grid-angular';
import { GridOptions } from 'ag-grid-community';
import { loadTemplates } from '../../templates/store/actions/template.actions';
import { loadCountries } from '../store/actions/country.actions';
import { loadCurrencies } from '../store/actions/currency.actions';
import { loadDateFormats } from '../store/actions/date-format.actions';
import { CreateInvoiceOrganizationComponent } from '../create-organization-details/create-invoice-organization.component';

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

  override gridOptions: GridOptions = {
    domLayout: 'autoHeight',
    rowHeight: 30,
    singleClickEdit: true,
    enableBrowserTooltips: true,
    stopEditingWhenCellsLoseFocus: false,
  };

  override defaultColDef = {
    sortable: false,
    resizable: false,
    suppressMenu: true,
    editable: false
  };

  ngOnInit(): void {
    this.store.dispatch(loadTemplates());
    this.store.dispatch(loadCountries());
    this.store.dispatch(loadCurrencies());
    this.store.dispatch(loadDateFormats());
  }

   
  // getRowId = (params: GetRowIdParams<FormColumnDef>) => {
  //   const data = params?.data;
  //   return data?.label ?? '';
  // };
}

