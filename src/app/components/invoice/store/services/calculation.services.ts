import { Injectable, signal, computed, effect } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { CurrencyUtil } from '../currency/currency.util';

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
      this.hasInternational()
    )
  );

  private formatNumberWithDP(value: number, dp: number): string {
    const parts = value.toFixed(dp).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  initFormSubscriptions(invoiceForm: FormGroup) {
    const decimalCtrl = invoiceForm.get('decimalPlaces');
    if (decimalCtrl) {
      decimalCtrl.valueChanges.subscribe((value) => this.decimalPlaces.set(Number(value) || 2));
      this.decimalPlaces.set(Number(decimalCtrl.value) || 2);
    }

    const internationalCtrl = invoiceForm.get('internationalNumbering');
    if (internationalCtrl) {
      internationalCtrl.valueChanges.subscribe((value) => this.hasInternational.set(!!value));
      this.hasInternational.set(!!internationalCtrl.value);
    }

    const currency = invoiceForm.get('currency') as FormGroup;
    if (currency) {
      currency.valueChanges.subscribe((value) => {
        this.code.set(value.code || 'INR');
        this.fraction.set(value.fraction || '');
        this.symbol.set(value.symbol || '₹');
      });
      this.code.set(currency.get('code')?.value || 'INR');
      this.fraction.set(currency.get('fraction')?.value || '');
      this.symbol.set(currency.get('symbol')?.value || '₹');
    }

    const roundOffCtrl = invoiceForm.get('roundOff') as FormControl;
    if (roundOffCtrl) {
      roundOffCtrl.valueChanges.subscribe((value) => {
        this.roundOff.set(Number(value) || 0);
        this.calculateTotals(invoiceForm);
      });
      this.roundOff.set(Number(roundOffCtrl.value) || 0);
    }

    const itemsArray = invoiceForm.get('items') as FormArray;
    if (itemsArray) {
      itemsArray.valueChanges.subscribe(() => this.calculateTotals(invoiceForm));
    }
  }

  calculateTotals(invoiceForm: FormGroup) {
    const items = invoiceForm.get('items') as FormArray;
    if (!items || items.length === 0) return;

    const dp = this.decimalPlaces();

    const itemSum = items.controls.reduce(
      (sum, i) => sum + Number(i.get('itemTotal')?.value || 0),
      0
    );
    const discountSum = items.controls.reduce(
      (sum, i) => sum + Number(i.get('discountAmount')?.value || 0),
      0
    );
    const subSum = items.controls.reduce(
      (sum, i) => sum + Number(i.get('subTotal')?.value || 0),
      0
    );
    const taxSum = items.controls.reduce(
      (sum, i) => sum + Number(i.get('taxTotal')?.value || 0),
      0
    );
    const grandSum = items.controls.reduce(
      (sum, i) => sum + Number(i.get('grandTotal')?.value || 0),
      0
    );

    const roundOffValue = this.roundOff();

    this.grandTotal.set(grandSum);

    invoiceForm
      .get('itemTotal')
      ?.setValue(this.formatNumberWithDP(itemSum, dp), { emitEvent: false });
    invoiceForm
      .get('discountTotal')
      ?.setValue(this.formatNumberWithDP(discountSum, dp), { emitEvent: false });
    invoiceForm
      .get('subTotal')
      ?.setValue(this.formatNumberWithDP(subSum, dp), { emitEvent: false });
    invoiceForm
      .get('taxTotal')
      ?.setValue(this.formatNumberWithDP(taxSum, dp), { emitEvent: false });
    invoiceForm
      .get('grandTotal')
      ?.setValue(this.formatNumberWithDP(grandSum + roundOffValue, dp), { emitEvent: false });
  }
}
