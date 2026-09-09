import { inject, Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { invoiceStore } from '../invoice.store';
import { createInvoice } from './invoice-form.factory';
import { Invoice } from './invoice-model';

@Injectable({ providedIn: 'root' })
export class InvoiceFormService {
  private fb = inject(FormBuilder);
  private store = inject(invoiceStore);

  replaceInvoice(invoice: Invoice) {
    const replacement = createInvoice(this.fb, invoice);
    this.form.setControl('items', replacement.controls.items, { emitEvent: false });
    this.form.reset(replacement.getRawValue());
  }

  readonly form = createInvoice(this.fb, this.store.invoice());
}
