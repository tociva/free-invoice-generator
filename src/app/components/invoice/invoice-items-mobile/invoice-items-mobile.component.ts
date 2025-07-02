import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GetRowIdParams, GridOptions, GridReadyEvent, NewValueParams } from 'ag-grid-community';
import { Subject, takeUntil } from 'rxjs';
import { FORM_ROW_HEIGHT } from '../../../../util/constants';
import { FormColumnDef } from '../../../../util/form-column-def.type';
import { BASE_ITEM_ROW_DATA } from '../../../../util/invoice.util';
import { addInvoiceItem, deleteInvoiceItem, updateInvoiceItem, } from '../store/actions/invoice.action';
import { Invoice, InvoiceItem, TaxOption } from '../store/model/invoice.model';
import { selectInvoice } from '../store/selectors/invoice.selectors';

export enum InvoiceItemFormItem {
  ITEM_NAME = 'Name',
  ITEM_DESCRIPTION = 'Description',
  ITEM_QUANTITY = 'Quantity',
  ITEM_PRICE = 'Price',
  ITEM_TOTAL = 'Total',
  ITEM_DISCOUNT_PERCENTAGE = 'Discount %',
  ITEM_DISCOUNT_AMOUNT = 'Discount Amount',
  ITEM_SUBTOTAL = 'Subtotal',
  ITEM_CGST_VALUE = 'CGST Value',
  ITEM_CGST_PERCENTAGE = 'CGST %',
  ITEM_SGST_VALUE = 'SGST Value',
  ITEM_SGST_PERCENTAGE = 'SGST %',
  ITEM_IGST_VALUE = 'IGST Value',
  ITEM_IGST_PERCENTAGE = 'IGST %',
  ITEM_TAX_TOTAL = 'Tax Total',
  ITEM_GRAND_TOTAL = 'Grand Total',
}

@Component({
  selector: 'app-invoice-items-mobile',
  imports: [CommonModule,
    AgGridModule, MatIconModule],  
  templateUrl: './invoice-items-mobile.component.html',
  styleUrl: './invoice-items-mobile.component.scss'
})
export class InvoiceItemsMobileComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  private invoice!:Invoice;

  public invoiceItems: InvoiceItem[] = [];

  private readonly EDITABLE_FIELDS = [
    InvoiceItemFormItem.ITEM_NAME,
    InvoiceItemFormItem.ITEM_DESCRIPTION,
    InvoiceItemFormItem.ITEM_QUANTITY,
    InvoiceItemFormItem.ITEM_PRICE,
    InvoiceItemFormItem.ITEM_DISCOUNT_PERCENTAGE,
    InvoiceItemFormItem.ITEM_DISCOUNT_AMOUNT,
    InvoiceItemFormItem.ITEM_CGST_VALUE,
    InvoiceItemFormItem.ITEM_CGST_PERCENTAGE,
    InvoiceItemFormItem.ITEM_SGST_VALUE,
    InvoiceItemFormItem.ITEM_SGST_PERCENTAGE,
    InvoiceItemFormItem.ITEM_IGST_VALUE,
    InvoiceItemFormItem.ITEM_IGST_PERCENTAGE,
  ];

  rowHeight = FORM_ROW_HEIGHT;

  defaultColDef: ColDef<FormColumnDef> = {
    editable: true,
    singleClickEdit: true,
    resizable: true,
    sortable: false,
    filter: false
  };

  gridOptions: GridOptions<FormColumnDef> = {
    suppressMenuHide: true,
    animateRows: true,
    headerHeight: 0,
  };

  constructor(private store:Store) {}

  ngOnInit(): void {
    this.store.select(selectInvoice).pipe(takeUntil(this.destroy$)).subscribe((invoice) => {
      this.invoice = invoice;
      if(this.invoiceItems.length !== invoice.items.length) {
        this.invoiceItems = invoice.items;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  

  private getUpdatedItem(params: NewValueParams<FormColumnDef>, idx: number): InvoiceItem {
    const data = params.data;
    const item = this.invoice.items[idx];
    const updItem:Partial<InvoiceItem> = {};
    switch(data.label) {
      case InvoiceItemFormItem.ITEM_NAME:
        updItem.name = data.value as string;
        break;
      case InvoiceItemFormItem.ITEM_DESCRIPTION:
        updItem.description = data.value as string;
        break;
      case InvoiceItemFormItem.ITEM_QUANTITY:
        updItem.quantity = Number(data.value);
        break;
      case InvoiceItemFormItem.ITEM_PRICE:
        updItem.price = Number(data.value);
        break;
      case InvoiceItemFormItem.ITEM_DISCOUNT_PERCENTAGE:
        updItem.discPercentage = Number(data.value);
        break;
      case InvoiceItemFormItem.ITEM_DISCOUNT_AMOUNT:
        updItem.discountAmount = Number(data.value);
        break;
      case InvoiceItemFormItem.ITEM_CGST_VALUE:
        updItem.tax1Amount = Number(data.value);
        break;
      case InvoiceItemFormItem.ITEM_CGST_PERCENTAGE:
        updItem.tax1Percentage = Number(data.value);
        break;
      case InvoiceItemFormItem.ITEM_SGST_VALUE:
        updItem.tax2Amount = Number(data.value);
        break;
      case InvoiceItemFormItem.ITEM_SGST_PERCENTAGE:
        updItem.tax2Percentage = Number(data.value);
        break;
      case InvoiceItemFormItem.ITEM_IGST_VALUE:
        updItem.tax1Amount = Number(data.value);
        break;
      case InvoiceItemFormItem.ITEM_IGST_PERCENTAGE:
        updItem.tax1Percentage = Number(data.value);
        break;
    }
    return {
      ...item,
      ...updItem
    };
  }

  public handleItemCellValueChanged = (params: NewValueParams<FormColumnDef>, idx: number) => {
    const updatedItem = this.getUpdatedItem(params, idx);
    this.store.dispatch(updateInvoiceItem({ index: idx, item: updatedItem }));
  };

  public addItem(): void {
    this.store.dispatch(addInvoiceItem({ item: {...BASE_ITEM_ROW_DATA} }));
  }

  invoiceItemsColumnDefs: ColDef<FormColumnDef>[] = [
    {
      field: 'label',
      headerName: '',
      flex: 3,
      editable: false,
    },
    {
      field: 'value',
      headerName: '',
      flex: 4,
      editable: (params) => {
        const label = params.data?.label ?? '';
        return this.EDITABLE_FIELDS.includes(label as InvoiceItemFormItem);
      },
    }
  ];

  // eslint-disable-next-line class-methods-use-this
  getItemsRowId = (params: GetRowIdParams<FormColumnDef>) => params.data.label;

   
  onInvoiceItemsGridReady(params: GridReadyEvent<FormColumnDef>, item: InvoiceItem, idx: number): void {
     
    const itemsGridApi = params.api;
      const invoiceItemsRowData: FormColumnDef[] = [
        { label: InvoiceItemFormItem.ITEM_NAME, value: item.name },
      ];
        if(this.invoice.hasItemDescription) {
          invoiceItemsRowData.push({ label: InvoiceItemFormItem.ITEM_DESCRIPTION, value: item.description });
        }
        invoiceItemsRowData.push(...[{ label: InvoiceItemFormItem.ITEM_QUANTITY, value: item.quantity },
        { label: InvoiceItemFormItem.ITEM_PRICE, value: item.price },
        { label: InvoiceItemFormItem.ITEM_TOTAL, value: item.itemTotal }
        ]);
        if(this.invoice.hasItemDiscount) {
          invoiceItemsRowData.push(...[
            { label: InvoiceItemFormItem.ITEM_DISCOUNT_PERCENTAGE, value: item.discPercentage },
            { label: InvoiceItemFormItem.ITEM_DISCOUNT_AMOUNT, value: item.discountAmount },
            { label: InvoiceItemFormItem.ITEM_SUBTOTAL, value: item.subTotal },
          ]);
        }
        if(this.invoice.taxOption === TaxOption.CGST_SGST) {
          invoiceItemsRowData.push(...[
            { label: InvoiceItemFormItem.ITEM_CGST_PERCENTAGE, value: item.tax1Percentage },
            { label: InvoiceItemFormItem.ITEM_CGST_VALUE, value: item.tax1Amount },
            { label: InvoiceItemFormItem.ITEM_SGST_PERCENTAGE, value: item.tax2Percentage },
            { label: InvoiceItemFormItem.ITEM_SGST_VALUE, value: item.tax2Amount },
            { label: InvoiceItemFormItem.ITEM_TAX_TOTAL, value: item.taxTotal },
          ]);
        }
        if(this.invoice.taxOption === TaxOption.IGST) {
          invoiceItemsRowData.push(...[
            { label: InvoiceItemFormItem.ITEM_IGST_PERCENTAGE, value: item.tax1Percentage },
            { label: InvoiceItemFormItem.ITEM_IGST_VALUE, value: item.tax1Amount },
          ]);
        }
        invoiceItemsRowData.push({ label: InvoiceItemFormItem.ITEM_GRAND_TOTAL, value: item.grandTotal });
      const existingData = [];

      for (let i = 0; i < itemsGridApi.getDisplayedRowCount(); i++) {
        const rowNode = itemsGridApi.getDisplayedRowAtIndex(i);
        if (rowNode?.data) {
          existingData.push(rowNode.data);
        }
      }
      itemsGridApi.applyTransaction({
        remove: existingData,
        add: invoiceItemsRowData,
      });
  }

  removeItem(idx: number): void {
    this.store.dispatch(deleteInvoiceItem({ index: idx }));
  }
}
