import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AgGridModule } from 'ag-grid-angular';
import { GetRowIdParams, GridOptions } from 'ag-grid-community';
import { FormColumnDef } from '../../../../util/form-column-def.type';
import { loadCountries } from '../store/actions/country.actions';
import { loadCurrencies } from '../store/actions/currency.actions';
import { loadDateFormats } from '../store/actions/date-format.actions';
import { CreateInvoiceOrganizationComponent } from './create-invoice-organization.component';
@Component({
  selector: 'app-create-invoice',
  standalone: true,
  imports: [
    AgGridModule,
    MatCardModule,
  ],
  templateUrl: './create-invoice.component.html',
  styleUrl: './create-invoice.component.scss'
})
export class CreateInvoiceComponent extends CreateInvoiceOrganizationComponent implements OnInit {
  showDiscount = false;
  showSummary = false;

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

  getRowId = (params: GetRowIdParams<FormColumnDef>) => {
    const data = params?.data;
    return data?.label ?? '';
  };

}
