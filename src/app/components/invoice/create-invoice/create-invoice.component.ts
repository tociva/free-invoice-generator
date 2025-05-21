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
  showDiscount = false;
  showSummary = false;


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
        this.calculateSummary();
      }
    }
  }

  onCellValueChanged(event: any): void {
    const data = event.data;
    const rowIndex = event.rowIndex;

    const price = Number(data.price);
    let quantity = Number(data.quantity);
    const discountPercent = Number(data.discount);

    if (data.item?.trim() && price > 0 && (!quantity || quantity === 0)) {
      data.quantity = 1;
      quantity = 1;
    }

    const total = price * quantity;
    data.total = total;

    const discountValue = (discountPercent && discountPercent > 0)
      ? (total * discountPercent) / 100
      : 0;

    data.value = discountValue;

    data.sub_total = total - discountValue;

    const isLastRow = rowIndex === this.itemdetailsRowData.length - 1;
    if (this.isRowComplete(data) && isLastRow) {
      this.itemdetailsRowData = [...this.itemdetailsRowData, {
        item: '',
        price: null,
        quantity: null,
        total: null,
        discount: null,
        value: null,
        sub_total: null,
        cgst: null,
        sgst: null,
        igst: null,
        grand_total: null
      }];
    }

    this.calculateSummary();

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
        {
          item: '', price: null, quantity: null, total: null, discount: null,
          value: null,
          sub_total: null,
          cgst: null,
          sgst: null,
          igst: null,
          grand_total: null
        }
      ];
      this.calculateSummary();
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
    const validRows = this.itemdetailsRowData.filter(row =>
      row.item?.trim() && Number(row.price) > 0 && Number(row.quantity) > 0
    );

    this.showSummary = validRows.length > 0;

    if (validRows.length === 0) {
      this.summaryRowData = this.summaryRowData.map(row => ({ ...row, value: '' }));
      return;
    }

    const itemTotal = validRows.reduce((sum, row) => sum + Number(row.total), 0);
    const discountTotal = validRows.reduce((sum, row) => sum + (Number(row.value) || 0), 0);
    const subTotal = validRows.reduce((sum, row) => sum + (Number(row.sub_total) || 0), 0);


    const taxOption = this.getTaxOption();
    const tax = (taxOption === 'Non Taxable') ? 0 : subTotal * 0.18;
    let totalTax = 0;

    // ✅ Recalculate tax per row
    this.itemdetailsRowData = this.itemdetailsRowData.map(row => {
      const rowTax = (taxOption === 'Non Taxable')
        ? 0
        : Number(row.sub_total ?? row.total) * 0.18;

      const grandTotal = Number(row.sub_total ?? row.total) + rowTax;

      totalTax += rowTax;

      return {
        ...row,
        cgst: taxOption === 'CGST/SGST' ? rowTax / 2 : null,
        sgst: taxOption === 'CGST/SGST' ? rowTax / 2 : null,
        igst: taxOption === 'IGST' ? rowTax : null,
        grand_total: Math.round(grandTotal)
      };
    });

    const roundOffRow = this.summaryRowData.find(r => r.label === 'Round Off');
    const roundOff = roundOffRow ? Number(roundOffRow.value) || 0 : 0;
    const grandTotal = Math.round(subTotal + tax + roundOff);

    this.summaryRowData = this.summaryRowData.map(row => {
      switch (row.label) {
        case 'Item Total': return { ...row, value: itemTotal };
        case 'Discount': return { ...row, value: discountTotal };
        case 'Sub Total': return { ...row, value: subTotal };
        case 'Tax': return { ...row, value: totalTax };
        case 'Rount Off': return { ...row, value: roundOff };
        case 'Grand Total': return { ...row, value: grandTotal };
        default: return row;
      }
    });
  }

  onSummaryCellValueChanged(event: any): void {
   if (event.data.label === 'Discount' || event.data.label === 'Round Off') {
      this.calculateSummary();
    }
  }
  override getTaxOption(): string {
    const taxOptionRow = this.invoiceRowData.find(row => row.label === 'Tax Option');
    return typeof taxOptionRow?.value === 'string' ? taxOptionRow.value : '';
  }
  

}
