import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerForm, InvoiceForm, InvoiceItemForm, OrganizationForm } from './invoice-form.model';
import { TaxOption } from './invoice-model';
import { Currency } from '../currency/currency.model';
import { DateFormat } from '../date-format/date-format.model';

export function createInvoice(fb: FormBuilder, storeInvoice: any): FormGroup<InvoiceForm> {
  return fb.group<InvoiceForm>({
    invoiceNo: fb.control(storeInvoice.invoiceNo ?? '', {
      nonNullable: true,
      validators: Validators.required,
    }),

    invoiceDate: fb.control<Date>(storeInvoice.invoiceDate ?? new Date(), {
      nonNullable: true,
      validators: Validators.required,
    }),

    invoiceDueDate: fb.control<Date | null>(storeInvoice.invoiceDueDate ?? null),

    currency: fb.control<Currency | null>(storeInvoice.currency ?? null, Validators.required),

    decimalPlaces: fb.control<number>(storeInvoice.decimalPlaces ?? 2, [
      Validators.required,
      Validators.min(0),
      Validators.max(5),
    ]),

    dateFormat: fb.control<DateFormat | null>(storeInvoice.dateFormat ?? null, Validators.required),

    taxOption: fb.control<TaxOption>(storeInvoice.taxOption ?? TaxOption.CGST_SGST, {
      nonNullable: true,
      validators: Validators.required,
    }),

    hasItemDescription: fb.control(true, { nonNullable: true }),
    hasItemDiscount: fb.control(false, { nonNullable: true }),
    internationalNumbering: fb.control(false, { nonNullable: true }),

    accountNumber: fb.control(storeInvoice.accountNumber ?? '', Validators.required),
    accountName: fb.control(storeInvoice.accountName ?? '', Validators.required),
    bankName: fb.control(storeInvoice.bankName ?? '', Validators.required),

    terms: fb.control(storeInvoice.terms ?? ''),
    notes: fb.control(storeInvoice.notes ?? ''),
    deliveryState: fb.control(storeInvoice.deliveryState ?? '', Validators.required),

    organization: fb.group<OrganizationForm>({
      name: fb.control(storeInvoice.organization?.name ?? '', Validators.required),
      address: fb.control(storeInvoice.organization?.address ?? '', Validators.required),
      country: fb.control(storeInvoice.organization?.country ?? '', Validators.required),
      email: fb.control(storeInvoice.organization?.email ?? '', [
        Validators.required,
        Validators.email,
      ]),
      phone: fb.control(storeInvoice.organization?.phone ?? '', Validators.required),
      gstin: fb.control(storeInvoice.organization?.gstin ?? '', Validators.required),
      authorityName: fb.control(
        storeInvoice.organization?.authorityName ?? '',
        Validators.required
      ),
      authorityDesignation: fb.control(
        storeInvoice.organization?.authorityDesignation ?? '',
        Validators.required
      ),
    }),

    customer: fb.group<CustomerForm>({
      name: fb.control(storeInvoice.customer?.name ?? '', Validators.required),
      address: fb.control(storeInvoice.customer?.address ?? '', Validators.required),
      country: fb.control(storeInvoice.customer?.country ?? '', Validators.required),
      email: fb.control(storeInvoice.customer?.email ?? '', [
        Validators.required,
        Validators.email,
      ]),
      phone: fb.control(storeInvoice.customer?.phone ?? '', Validators.required),
      gstin: fb.control(storeInvoice.customer?.gstin ?? '', Validators.required),
    }),

    items: fb.array<FormGroup<InvoiceItemForm>>(
      (storeInvoice.items ?? []).map((item: any) =>
        fb.group<InvoiceItemForm>({
          name: fb.control(item.name ?? '', Validators.required),
          description: fb.control(item.description ?? ''),
          quantity: fb.control(item.quantity ?? 1, [Validators.required, Validators.min(1)]),
          price: fb.control(item.price ?? 0, [Validators.required, Validators.min(0)]),

          itemTotal: fb.control(item.itemTotal ?? 0),
          discountAmount: fb.control(item.discountAmount ?? 0),
          discPercentage: fb.control(item.discPercentage ?? 0),
          subTotal: fb.control(item.subTotal ?? 0),

          tax1Amount: fb.control(item.tax1Amount ?? 0),
          tax1Percentage: fb.control(item.tax1Percentage ?? 0),
          tax2Amount: fb.control(item.tax2Amount ?? 0),
          tax2Percentage: fb.control(item.tax2Percentage ?? 0),
          tax3Amount: fb.control(item.tax3Amount ?? 0),
          tax3Percentage: fb.control(item.tax3Percentage ?? 0),

          taxTotal: fb.control(item.taxTotal ?? 0),
          grandTotal: fb.control(item.grandTotal ?? 0),
        })
      )
    ),

    itemTotal: fb.control(storeInvoice.itemTotal ?? 0),
    discountTotal: fb.control(storeInvoice.discountTotal ?? 0),
    subTotal: fb.control(storeInvoice.subTotal ?? 0),
    taxTotal: fb.control(storeInvoice.taxTotal ?? 0),
    roundOff: fb.control(storeInvoice.roundOff ?? 0),
    grandTotal: fb.control(storeInvoice.grandTotal ?? 0),
    grandTotalInWords: fb.control(storeInvoice.grandTotalInWords ?? ''),

    smallLogo: fb.control(storeInvoice.smallLogo, { nonNullable: true }),

    largeLogo: fb.control(storeInvoice.largeLogo ?? '', { nonNullable: true }),
  });
}
