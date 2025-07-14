import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { DEFAULT_DECIMAL_PLACES } from '../../../../util/constants';
import { selectInvoice } from '../store/selectors/invoice.selectors';
import { numberToFixedDecimal } from '../../../../util/invoice.util';
import { CurrencyUtil } from '../../util/currency.util';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { patchInvoiceDetails } from '../store/actions/invoice.action';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-invoice-amount-words',
  imports: [FormsModule,MatCheckboxModule],
  templateUrl: './invoice-amount-words.component.html',
  styleUrl: './invoice-amount-words.component.scss'
})
export class InvoiceAmountWordsComponent implements OnDestroy, OnInit {

  private destroy$ = new Subject<void>();
  isInternationalNumbering = false;

  totalInWords = '';
  grandTotalValue = '';
  public store = inject<Store>(Store);

  ngOnInit(): void {
    this.store.select(selectInvoice)
    .pipe(takeUntil(this.destroy$))
    .subscribe((invoice) => {
      this.isInternationalNumbering = invoice.internationalNumbering;
      const decimalPlaces = invoice.decimalPlaces ?? DEFAULT_DECIMAL_PLACES;
      const grandTotal = numberToFixedDecimal(invoice.grandTotal, decimalPlaces);
      const unicodeChar = String.fromCharCode(parseInt(invoice.currency.unicode, 16));
      this.grandTotalValue = `${unicodeChar} ${grandTotal}`;
      this.totalInWords = CurrencyUtil.numberToWords(invoice.grandTotal, 
        invoice.currency.shortName,
        invoice.currency.fraction,
        decimalPlaces, invoice.internationalNumbering);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  } 

  handleInternationalNumberingChange(event: MatCheckboxChange): void {
    this.store.dispatch(patchInvoiceDetails({ details: { internationalNumbering: event.checked } }));
  }

}
