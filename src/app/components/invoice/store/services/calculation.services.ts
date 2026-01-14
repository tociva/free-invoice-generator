import { Injectable } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { signal, computed } from '@angular/core';
import { CurrencyUtil } from '../currency/currency.util';

@Injectable({ providedIn: 'root' })
export class InvoiceCalculationService {
  grandTotal = signal(0);
  code = signal<string>('');
  decimalPlaces = signal(2);
  fraction = signal<string>('');
  hasInternational = signal<boolean>(false);
  symbol =signal<string>('');
  roundOff = signal<number>(0);

  grandTotalInWords = computed(() =>
    CurrencyUtil.numberToWords(
      this.grandTotal(),
      this.code(),
      this.fraction(),
      this.decimalPlaces(),
      this.hasInternational()
    )
  );
 


  calculateTotals(invoiceForm: FormGroup) {
    const items = invoiceForm.get('items') as FormArray;
    if (!items) return;
    const itemTotal = items.controls.reduce((sum, i) => sum + (i.get('itemTotal')?.value || 0), 0);
    const discountTotal = items.controls.reduce(
      (sum, i) => sum + (i.get('discountAmount')?.value || 0),
      0
    );
    const subTotal = items.controls.reduce((sum, i) => sum + (i.get('subTotal')?.value || 0), 0);
    const taxTotal = items.controls.reduce((sum, i) => sum + (i.get('taxTotal')?.value || 0), 0);
    const grandT = items.controls.reduce((sum, i) => sum + (i.get('grandTotal')?.value || 0), 0);
  
    
    invoiceForm.get('itemTotal')?.setValue(itemTotal, { emitEvent: false });
    invoiceForm.get('discountTotal')?.setValue(discountTotal, { emitEvent: false });
    invoiceForm.get('subTotal')?.setValue(subTotal, { emitEvent: false });
    invoiceForm.get('taxTotal')?.setValue(taxTotal, { emitEvent: false });
    invoiceForm.get('grandTotal')?.setValue(grandT, { emitEvent: false });
    const decimalCtrl = invoiceForm.get('decimalPlaces');
    if (decimalCtrl) {
      decimalCtrl.valueChanges.subscribe((value) => this.decimalPlaces.set(value || 2));
      this.decimalPlaces.set(decimalCtrl.value || 2);
    }

    const internationalCtrl = invoiceForm.get('internationalNumbering');
    if (internationalCtrl) {
      internationalCtrl.valueChanges.subscribe((value) =>
        this.hasInternational.set(value ?? false)
      );
      this.hasInternational.set(internationalCtrl.value ?? false); 
    }

    const currency = invoiceForm.get('currency') as FormGroup;
    if (currency) {
      currency.valueChanges.subscribe((value) => {
        this.code.set(value.code);
        this.fraction.set(value.fraction);
        this.symbol.set(value.symbol);
      });
      this.code.set(currency.get('code')?.value || 'INR');
      this.fraction.set(currency.get('fraction')?.value);
      this.symbol.set(currency.get('fraction')?.value ||'₹');

    }
    const roundOff = invoiceForm.get('roundOff');
    if(roundOff){
      roundOff.valueChanges.subscribe((value)=> this.roundOff.set(value || 0));
      this.roundOff.set(roundOff.value || 0);
    }
    this.grandTotal.set(grandT);
  
  }
}
