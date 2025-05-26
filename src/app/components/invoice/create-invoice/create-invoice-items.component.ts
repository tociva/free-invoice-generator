import { Component } from '@angular/core';
import { ColDef, GridApi, GridReadyEvent, ColGroupDef } from "ag-grid-community";
import { CreateInvoiceSummaryComponent } from "./create-invoice-summary.component";
import { Invoice, InvoiceItem, TaxOption } from '../store/model/invoice.model';
import { selectInvoice } from '../store/selectors/invoice.selectors';

@Component({
  selector: 'app-create-invoice-items',
  standalone: true,
  template: '',
})
export class CreateInvoiceItemsComponent extends CreateInvoiceSummaryComponent {
  
  itemsDefaultColDef: ColDef<InvoiceItem> = {
    editable: true,
    width: 150,
    resizable: false,
    sortable: false,
    filter: false,
    floatingFilter: false,
  };
  itemsColumnDefs: ColDef<InvoiceItem>[] = [];

  itemsRowData: InvoiceItem[] = [];

  itemsGridApi!: GridApi<InvoiceItem>;

  private createItemsColumnDefs(invoice: Invoice): void {
    const itemsColumnDefsTemp: Array<ColGroupDef<InvoiceItem>> = [];
    const itemColumns:ColGroupDef<InvoiceItem> = {
      headerName: 'Item Details',
      children: [
        { field: 'name', headerName: 'Name', width: 400 },
        { field: 'price', headerName: 'Price' },
        { field: 'quantity', headerName: 'Quantity' },
        { field: 'itemTotal', headerName: 'Item Total' },
      ]
    }
    if (invoice.hasItemDescription) {
      itemColumns.children.splice(1, 0, { field: 'description', headerName: 'Description', width: 400 });
    }
    
    itemsColumnDefsTemp.push(itemColumns);
    if(invoice.hasItemDiscount) {
      itemsColumnDefsTemp.push({
        headerName: 'Discount',
        children: [
          { field: 'discPercentage', headerName: 'Percentage' },
          { field: 'discountAmount', headerName: 'Discount Amount' },
          { field: 'subTotal', headerName: 'Sub Total' },
        ]
      });
    }
    if(invoice.taxOption === TaxOption.CGST_SGST) {
      itemsColumnDefsTemp.push({
        headerName: 'Tax',
        children: [
          { field: 'tax1Percentage', headerName: 'CGST %' },
          { field: 'tax1Amount', headerName: 'CGST Amount' },
          { field: 'tax2Percentage', headerName: 'SGST %' },
          { field: 'tax2Amount', headerName: 'SGST Amount' },
          { field: 'taxTotal', headerName: 'Tax Total' },
        ]
      });
    } else if(invoice.taxOption === TaxOption.IGST) {
      itemsColumnDefsTemp.push({
        headerName: 'Tax',
        children: [
          { field: 'tax1Percentage', headerName: 'IGST %' },
          { field: 'tax1Amount', headerName: 'IGST Amount' },
          { field: 'taxTotal', headerName: 'Tax Total' },
        ]
      });
    }
    itemsColumnDefsTemp.push({
      headerName: '',
      children: [
        { field: 'grandTotal', headerName: 'Grand Total' },
      ]
    });
    this.itemsColumnDefs = itemsColumnDefsTemp;
  }

  onItemsGridReady(params: GridReadyEvent<InvoiceItem>): void {
    this.itemsGridApi = params.api;
    this.store.select(selectInvoice).subscribe((invoice) => {
      this.createItemsColumnDefs(invoice);
      this.itemsRowData = invoice.items;
      this.itemsGridApi.sizeColumnsToFit();
    });
  }

}