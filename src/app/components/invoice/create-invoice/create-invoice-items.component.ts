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
    editable: false,
    width: 150,
    resizable: false,
    sortable: false,
    filter: false,
    floatingFilter: false,
  };
  itemsColumnDefs: ColDef<InvoiceItemWithAction>[] = [];

  itemsRowData: InvoiceItem[] = [];

  itemsGridApi!: GridApi<InvoiceItem>;

  itemsGridWidth = '1000px';

  private numberCellWidth = 60;

  private nameCellWidth = 300;


  private handleNameCellValueChanged = (params: NewValueParams<InvoiceItem>) => {
    const { oldValue, data } = params;
    if(oldValue.trim().length) {
      return;
    }
    this.store.dispatch(addInvoiceItem({item: data}));
  }

  private handleItemCellValueChanged = (params: NewValueParams<InvoiceItem>) => {
    const rowIndex = Number(params.node?.id);
    this.store.dispatch(updateInvoiceItem({index: rowIndex, item: params.data}));
  }

  private createItemLabelColumn(
    field: keyof InvoiceItem,
    headerName: string,
    placeholder = '',
    editable = false,
    width?: number,
    onCellValueChanged?: (event: any) => void
  ): ColDef<InvoiceItemWithAction> {
    return {
      field,
      headerName,
      width,
      editable,
      cellRenderer: LabelColumnRendererComponent,
      cellRendererParams: (params: ICellRendererParams<InvoiceItem>) => {
        const value = params.data?.[field];
        const labelValue = typeof value === 'string' ? value.trim() : value?.toString();
        return {
          labelValue: labelValue && labelValue !== '0' ? labelValue : placeholder
        };
      },
      onCellValueChanged
    };
  }

  private createItemsColumnDefs(invoice: Invoice): void {
    const itemsColumnDefsTemp: Array<ColGroupDef<InvoiceItemWithAction>> = [];
  
    const itemColumns: ColGroupDef<InvoiceItemWithAction> = {
      headerName: 'Item Details',
      children: [
        this.createItemLabelColumn('name', 'Name', 'Click here to add item name', true, this.nameCellWidth, this.handleNameCellValueChanged),
        this.createItemLabelColumn('price', 'Price', '', true, this.numberCellWidth, this.handleItemCellValueChanged),
        this.createItemLabelColumn('quantity', 'Quantity', '', true, this.numberCellWidth, this.handleItemCellValueChanged),
        this.createItemLabelColumn('itemTotal', 'Item Total', '', false, this.numberCellWidth, this.handleItemCellValueChanged)
      ]
    };
  
    if (invoice.hasItemDescription) {
      itemColumns.children.splice(
        1,
        0,
        this.createItemLabelColumn('description', 'Description', 'Click here to add description', true, this.nameCellWidth, this.handleItemCellValueChanged)
      );
    }
  
    itemsColumnDefsTemp.push(itemColumns);
  
    if (invoice.hasItemDiscount) {
      itemsColumnDefsTemp.push({
        headerName: 'Discount',
        children: [
          this.createItemLabelColumn('discPercentage', 'Percentage', '', true, this.numberCellWidth, this.handleItemCellValueChanged),
          this.createItemLabelColumn('discountAmount', 'Discount Amount', '', false, this.numberCellWidth, this.handleItemCellValueChanged),
          this.createItemLabelColumn('subTotal', 'Sub Total', '', false, this.numberCellWidth, this.handleItemCellValueChanged)
        ]
      });
    }
  
    if (invoice.taxOption === TaxOption.CGST_SGST) {
      itemsColumnDefsTemp.push({
        headerName: 'Tax',
        children: [
          this.createItemLabelColumn('tax1Percentage', 'CGST %', '', true, this.numberCellWidth, this.handleItemCellValueChanged),
          this.createItemLabelColumn('tax1Amount', 'CGST Amount', '', false, this.numberCellWidth, this.handleItemCellValueChanged),
          this.createItemLabelColumn('tax2Percentage', 'SGST %', '', true, this.numberCellWidth, this.handleItemCellValueChanged),
          this.createItemLabelColumn('tax2Amount', 'SGST Amount', '', false, this.numberCellWidth, this.handleItemCellValueChanged),
          this.createItemLabelColumn('taxTotal', 'Tax Total', '', false, this.numberCellWidth, this.handleItemCellValueChanged)
        ]
      });
    } else if (invoice.taxOption === TaxOption.IGST) {
      itemsColumnDefsTemp.push({
        headerName: 'Tax',
        children: [
          this.createItemLabelColumn('tax1Percentage', 'IGST %', '', true, this.numberCellWidth, this.handleItemCellValueChanged),
          this.createItemLabelColumn('tax1Amount', 'IGST Amount', '', false, this.numberCellWidth, this.handleItemCellValueChanged),
          this.createItemLabelColumn('taxTotal', 'Tax Total', '', false, this.numberCellWidth, this.handleItemCellValueChanged)
        ]
      });
    }
  
    itemsColumnDefsTemp.push({
      headerName: '',
      children: [
        this.createItemLabelColumn('grandTotal', 'Grand Total', '', false, this.numberCellWidth, this.handleItemCellValueChanged),
        {
          field: 'action',
          editable: false,
          headerName: '',
          width: 80,
          cellRenderer: IconColumnRendererComponent,
          cellRendererParams: {
            icon: 'delete',
            customClass: 'icon-danger',
            iconClickListener: (rowId: string) => {
              const rowIndex = Number(rowId);
              this.store.dispatch(deleteInvoiceItem({ index: rowIndex }));
            }
          }
        }
      ]
    });
  
    this.itemsColumnDefs = itemsColumnDefsTemp;
  }
  
  private setNumberCellWidth(invoice: Invoice): void {
    this.numberCellWidth = 110 - (invoice.hasItemDiscount ? 25 : 0);
    const extraColumns = invoice.hasItemDiscount ? 3 : 0;
    if(invoice.taxOption === TaxOption.CGST_SGST) {
      this.itemsGridWidth = `${600 + this.numberCellWidth * (9 + extraColumns) + 50 + 35}px`;
    } else if(invoice.taxOption === TaxOption.IGST) {
      this.itemsGridWidth = `${600 + this.numberCellWidth * (7 + extraColumns) + 50 + 35}px`;
    } else if (invoice.taxOption === TaxOption.NON_TAXABLE) {
      this.itemsGridWidth = `${600 + this.numberCellWidth * (4 + extraColumns) + 50 + 35}px`;
    }
  }

  onItemsGridReady(params: GridReadyEvent<InvoiceItem>): void {
    this.itemsGridApi = params.api;
    this.store.select(selectInvoice).subscribe((invoice) => {
      this.setNumberCellWidth(invoice);
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