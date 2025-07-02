import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { selectInvoice } from '../store/selectors/invoice.selectors';
import { Invoice } from '../store/model/invoice.model';

export enum InvoiceItemFormItem {
  ITEM_NAME = 'Name',
  ITEM_DESCRIPTION = 'Description',
  ITEM_QUANTITY = 'Quantity',
  ITEM_PRICE = 'Price',
  ITEM_TOTAL = 'Total',
  ITEM_DISCOUNT_PERCENTAGE = 'Discount %',
  ITEM_DISCOUNT_AMOUNT = 'Discount Amount',
  ITEM_SUBTOTAL = 'Subtotal',
  ITEM_TAX_1_AMOUNT = 'Tax 1 Amount',
  ITEM_TAX_1_PERCENTAGE = 'Tax 1 %',
  ITEM_TAX_2_AMOUNT = 'Tax 2 Amount',
  ITEM_TAX_2_PERCENTAGE = 'Tax 2 %',
  ITEM_TAX_3_AMOUNT = 'Tax 3 Amount',
  ITEM_TAX_3_PERCENTAGE = 'Tax 3 %',
  ITEM_TAX_TOTAL = 'Tax Total',
  ITEM_GRAND_TOTAL = 'Grand Total',
}

@Component({
  selector: 'app-invoice-items-mobile',
  imports: [CommonModule,
    AgGridModule],  
  templateUrl: './invoice-items-mobile.component.html',
  styleUrl: './invoice-items-mobile.component.scss'
})
export class InvoiceItemsMobileComponent implements OnDestroy, OnInit {

  private destroy$ = new Subject<void>();

  public invoice!:Invoice;

  constructor(private store:Store) {}

  ngOnInit(): void {
    this.store.select(selectInvoice).pipe(takeUntil(this.destroy$)).subscribe((invoice) => {
      this.invoice = invoice;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
