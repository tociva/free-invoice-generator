import { Component } from '@angular/core';
import { ColDef, ColGroupDef, GridApi, GridReadyEvent, ICellRendererParams, NewValueParams } from "ag-grid-community";
import { IconColumnRendererComponent } from '../../common/ag-grid/renderer/icon-column-renderer/icon-column-renderer.component';
import { LabelColumnRendererComponent } from '../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component';
import { addInvoiceItem, deleteInvoiceItem, updateInvoiceItem } from '../store/actions/invoice.action';
import { Invoice, InvoiceItem, TaxOption } from '../store/model/invoice.model';
import { selectInvoice } from '../store/selectors/invoice.selectors';
import { CreateInvoiceSummaryComponent } from "./create-invoice-summary.component";

type InvoiceItemWithAction = InvoiceItem & {action?: string};

@Component({
  selector: 'app-create-invoice-items',
  standalone: true,
  template: '',
})
export class CreateInvoiceItemsComponent extends CreateInvoiceSummaryComponent {
  
  itemsDefaultColDef: ColDef<InvoiceItemWithAction> = {
    editable: true,
    width: 150,
    resizable: false,
    sortable: false,
    filter: false,
    floatingFilter: false,
  };
  itemsColumnDefs: ColDef<InvoiceItemWithAction>[] = [];

  itemsRowData: InvoiceItem[] = [];

  itemsGridApi!: GridApi<InvoiceItem>;

  private handleNameCellValueChanged = (params: NewValueParams<InvoiceItem>) => {
    const { newValue, oldValue, data } = params;
    if(oldValue.trim().length) {
      return;
    }
    this.store.dispatch(addInvoiceItem({item: data}));
  }

  private handleItemCellValueChanged = (params: NewValueParams<InvoiceItem>) => {
    const rowIndex = Number(params.node?.id);
    this.store.dispatch(updateInvoiceItem({index: rowIndex, item: params.data}));
  }

  private createItemsColumnDefs(invoice: Invoice): void {
    const itemsColumnDefsTemp: Array<ColGroupDef<InvoiceItemWithAction>> = [];
    const itemColumns:ColGroupDef<InvoiceItemWithAction> = {
      headerName: 'Item Details',
      children: [
        { field: 'name', headerName: 'Name', width: 400, 
          cellRenderer: LabelColumnRendererComponent, cellRendererParams: (params: ICellRendererParams<InvoiceItem>) => {
          const labelValue = params.data?.name?.trim();
          return {
            labelValue: Boolean(labelValue) ? labelValue : 'Click here to add item name'
          }
        },
        onCellValueChanged: this.handleNameCellValueChanged,
      },
        { field: 'price', headerName: 'Price' ,cellRenderer: LabelColumnRendererComponent, cellRendererParams: (params: ICellRendererParams<InvoiceItem>) => {
          const labelValue = params.data?.price?.toString();
          return {
            labelValue: Number(labelValue) ? labelValue : ''
          }
        },
        onCellValueChanged: this.handleItemCellValueChanged,
      },
        { field: 'quantity', headerName: 'Quantity', cellRenderer: LabelColumnRendererComponent, cellRendererParams: (params: ICellRendererParams<InvoiceItem>) => {
          const labelValue = params.data?.quantity?.toString();
          return {
            labelValue: Number(labelValue) ? labelValue : ''
          }
        },
        onCellValueChanged: this.handleItemCellValueChanged,
      },
        { field: 'itemTotal', headerName: 'Item Total' ,cellRenderer: LabelColumnRendererComponent, cellRendererParams: (params: ICellRendererParams<InvoiceItem>) => {
          const labelValue = params.data?.itemTotal?.toString();
          return {
            labelValue: Number(labelValue) ? labelValue : ''
          }
        },
        onCellValueChanged: this.handleItemCellValueChanged,
      },
      ]
    }
    if (invoice.hasItemDescription) {
      itemColumns.children.splice(1, 0, { field: 'description', headerName: 'Description', width: 400,
        cellRenderer: LabelColumnRendererComponent, cellRendererParams: (params: ICellRendererParams<InvoiceItem>) => {
          const labelValue = params.data?.description?.trim();
          return {
            labelValue: Boolean(labelValue) ? labelValue : 'Click here to add description'
          }
        },
        onCellValueChanged: this.handleItemCellValueChanged,
      });
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
        { field: 'grandTotal', headerName: 'Grand Total', cellRenderer: LabelColumnRendererComponent, cellRendererParams: (params: ICellRendererParams<InvoiceItem>) => {
          const labelValue = params.data?.grandTotal?.toString();
          return {
            labelValue: Number(labelValue) ? labelValue : ''
          }
        } },
        { field: 'action', editable: false, headerName: 'Action', cellRenderer: IconColumnRendererComponent, cellRendererParams: {
          icon: 'delete',
          customClass: 'icon-danger',
          iconClickListener: (rowId: string) => {
            const rowIndex = Number(rowId);
            this.store.dispatch(deleteInvoiceItem({index: rowIndex}));
          }
        } },
      ]
    });
    this.itemsColumnDefs = itemsColumnDefsTemp;
  }

  onItemsGridReady(params: GridReadyEvent<InvoiceItem>): void {
    this.itemsGridApi = params.api;
    this.store.select(selectInvoice).subscribe((invoice) => {
      this.createItemsColumnDefs(invoice);
      const items = invoice.items.map((item) => ({
        ...item,
      }));
      this.itemsRowData = [...items, {
        name: '',
        description: '',
        quantity: 0,
        price: 0,
        itemTotal: 0,
        discountAmount: 0,
        discPercentage: 0,
        subTotal: 0,
        tax1Amount: 0,
        tax1Percentage: 0,
        tax2Amount: 0,
        tax2Percentage: 0,
        tax3Amount: 0,
        tax3Percentage: 0,
        taxTotal: 0,
        grandTotal: 0,
      }];
      this.itemsGridApi.sizeColumnsToFit();
    });
  }

}