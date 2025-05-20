import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AgGridModule } from 'ag-grid-angular';
import { GetRowIdParams, GridOptions } from 'ag-grid-community';
import { FormColumnDef } from '../../../../util/form-column-def.type';
import { loadCountries } from '../store/actions/country.actions';
import { CreateInvoiceCustomerComponent } from './create-invoice-customer.component';
import { loadCurrencies } from '../store/actions/currency.actions';
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
export class CreateInvoiceComponent extends CreateInvoiceCustomerComponent {


  gridOptions: GridOptions = {
    domLayout: 'autoHeight',
    rowHeight: 30,
    singleClickEdit: true,
    enableBrowserTooltips: true,
    stopEditingWhenCellsLoseFocus: true,
  };

  defaultColDef = {
    sortable: false,
    resizable: false,
    suppressMenu: true,
    editable: false
  };

  

  


  onCellClicked(event: any): void {
    const isDeleteBtn = event.event?.target?.closest('[data-clear]');
    if (event.colDef.field === 'delete' && isDeleteBtn) {
      const index = event.rowIndex;

      if (this.itemdetailsRowData.length > 1) {
        this.itemdetailsRowData.splice(index, 1);
        this.itemdetailsRowData = [...this.itemdetailsRowData];
      }
    }
  }


  onCellValueChanged(event: any): void {
    const data = event.data;
    const rowIndex = event.rowIndex;
    const price = Number(data.price);
    let quantity = Number(data.quantity);

    if (data.item?.trim() && price > 0 && (!quantity || quantity === 0)) {
      data.quantity = 1;
      quantity = 1;
    }
    if (data.item?.trim() && price > 0 && (!quantity || quantity === 0)) {
      data.quantity = 1;
      quantity = 1;
    }

    data.total = price * quantity;
    const isLastRow = rowIndex === this.itemdetailsRowData.length - 1;
    if (this.isRowComplete(data) && isLastRow) {
      this.itemdetailsRowData = [
        ...this.itemdetailsRowData,
        { item: '', price: '', quantity: '', total: '' }
      ];
    }
    event.api.refreshCells({ rowNodes: [event.node], force: true });
  }



  onCellKeyDown(event: any): void {
    const isEnter = event.event.key === 'Enter';
    if (!isEnter) return;

    const row = event.node.data;
    const isComplete =
      row.item?.trim() &&
      Number(row.price) > 0 &&
      Number(row.quantity) > 0;

    const isLastRow = event.rowIndex === this.itemdetailsRowData.length - 1;

    if (isComplete && isLastRow) {
      this.itemdetailsRowData = [
        ...this.itemdetailsRowData,
        { item: '', price: '', quantity: '', total: '' }
      ];
    }
  }
  isRowComplete(row: any): boolean {
    return row.item?.trim() && Number(row.price) > 0 && Number(row.quantity) > 0;
  }

  ngOnInit(): void {
    this.store.dispatch(loadCountries());
    this.store.dispatch(loadCurrencies());
  }

  getRowId = (params: GetRowIdParams<FormColumnDef>) => {
    const data = params?.data;
    return data?.label ?? '';
  };

  calculateSummary(): void {
    const validRows = this.itemdetailsRowData.filter(row => {
      return (
        typeof row.item === 'string' &&
        row.item.trim() !== '' &&
        Number(row.price) > 0 &&
        Number(row.quantity) > 0
      );
    });

    if (validRows.length === 0) {
      this.summaryRowData = this.summaryRowData.map(row => ({
        ...row,
        value: ''
      }));
      return;
    }
    const itemTotal = validRows.reduce((sum, row) => sum + Number(row.total), 0);
    const discountRow = this.summaryRowData.find(r => r.label === 'Discount');
    const discount = discountRow ? Number(discountRow.value) || 0 : 0;
    const subTotal = itemTotal - discount;
    const tax = subTotal * 0.18;
    const roundGrand = subTotal + tax;
    const roundOff = Math.round(roundGrand) - roundGrand;
    const grandTotal = Math.round(roundGrand);

    this.summaryRowData = this.summaryRowData.map(row => {
      switch (row.label) {
        case 'Item Total': return { ...row, value: itemTotal };
        case 'Sub Total': return { ...row, value: subTotal };
        case 'Tax': return { ...row, value: tax };
        case 'Round Off': return { ...row, value: roundOff };
        case 'Grand Total': return { ...row, value: grandTotal };
        default: return row;
      }
    });
  }
  onSummaryCellValueChanged(event: any): void {
    if (event.data.label === 'Discount') {
      this.calculateSummary();
    }
  }
}
