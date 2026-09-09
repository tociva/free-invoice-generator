import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CurrencyUtil } from '../currency/currency.util';
import { InvoiceForm } from '../models/invoice-form.model';

@Injectable({ providedIn: 'root' })
export class InvoiceCalculationService {
  grandTotal = signal(0);
  roundOff = signal(0);
  decimalPlaces = signal(2);
  hasInternational = signal(false);
  code = signal('INR');
  fraction = signal('');
  symbol = signal('₹');

  finalGrandTotal = computed(() => this.grandTotal() + this.roundOff());

  grandTotalInWords = computed(() =>
    CurrencyUtil.numberToWords(
      this.finalGrandTotal(),
      this.code(),
      this.fraction(),
      this.decimalPlaces(),
      this.hasInternational(),
    ),
  );

  private activeForm?: FormGroup<InvoiceForm>;
  private subscriptions = new Subscription();
  constructor() {
    inject(DestroyRef).onDestroy(() => this.subscriptions.unsubscribe());
  }

  initFormSubscriptions(invoiceForm: FormGroup<InvoiceForm>) {
    if (this.activeForm === invoiceForm) return;
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
    this.activeForm = invoiceForm;
    this.subscriptions.add(
      invoiceForm.valueChanges.subscribe(() => this.calculateTotals(invoiceForm)),
    );
    this.calculateTotals(invoiceForm);
  }

  calculateTotals(invoiceForm: FormGroup<InvoiceForm>) {
    const items = invoiceForm.get('items') as FormArray;
    const value = invoiceForm.getRawValue();
    this.decimalPlaces.set(value.decimalPlaces ?? 2);
    this.hasInternational.set(value.internationalNumbering);
    this.roundOff.set(value.roundOff || 0);
    this.code.set(value.currency?.code || 'INR');
    this.fraction.set(value.currency?.fraction || '');
    this.symbol.set(value.currency?.symbol || '\u20b9');

    const itemSum = items.controls.reduce(
      (sum, i) => sum + Number(i.get('itemTotal')?.value || 0),
      0,
    );
    const discountSum = items.controls.reduce(
      (sum, i) => sum + Number(i.get('discountAmount')?.value || 0),
      0,
    );
    const subSum = items.controls.reduce(
      (sum, i) => sum + Number(i.get('subTotal')?.value || 0),
      0,
    );
    const taxSum = items.controls.reduce(
      (sum, i) => sum + Number(i.get('taxTotal')?.value || 0),
      0,
    );
    const grandSum = items.controls.reduce(
      (sum, i) => sum + Number(i.get('grandTotal')?.value || 0),
      0,
    );

    const roundOffValue = this.roundOff();

    this.grandTotal.set(grandSum);

    invoiceForm.get('itemTotal')?.setValue(itemSum, { emitEvent: false });
    invoiceForm.get('discountTotal')?.setValue(discountSum, { emitEvent: false });
    invoiceForm.get('subTotal')?.setValue(subSum, { emitEvent: false });
    invoiceForm.get('taxTotal')?.setValue(taxSum, { emitEvent: false });
    invoiceForm.get('grandTotal')?.setValue(grandSum + roundOffValue, { emitEvent: false });
    invoiceForm.controls.grandTotalInWords.setValue(this.grandTotalInWords(), { emitEvent: false });
  }
}
