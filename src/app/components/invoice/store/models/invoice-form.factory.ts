import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Country } from '../country/country.model';
import { Currency } from '../currency/currency.model';
import { DateFormat } from '../date-format/date-format.model';
import { CustomerForm, InvoiceForm, InvoiceItemForm, OrganizationForm } from './invoice-form.model';
import { Invoice, TaxOption } from './invoice-model';
const emptyCountry: Country = {
  code: '',
  name: '',
  iso: '',
  phone: '',
  currencycode: '',
  dateformat: '',
};

export function createInvoice(
  fb: FormBuilder,
  storeInvoice: Partial<Invoice>,
): FormGroup<InvoiceForm> {
  return fb.group<InvoiceForm>({
    invoiceNo: fb.nonNullable.control(storeInvoice.invoiceNo ?? '', {
      validators: Validators.required,
    }),

    invoiceDate: fb.nonNullable.control<Date | null>(
      storeInvoice.invoiceDate === undefined ? new Date() : storeInvoice.invoiceDate,
      {
        validators: Validators.required,
      },
    ),
    invoiceDueDate: fb.nonNullable.control<Date | null>(
      storeInvoice.invoiceDueDate === undefined ? new Date() : storeInvoice.invoiceDueDate,
      {
        validators: Validators.required,
      },
    ),

    currency: fb.nonNullable.control<Currency | null>(
      storeInvoice.currency ?? null,
      Validators.required,
    ),

    decimalPlaces: fb.nonNullable.control<number>(storeInvoice.decimalPlaces ?? 2, [
      Validators.required,
      Validators.min(0),
      Validators.max(5),
    ]),

    dateFormat: fb.nonNullable.control<DateFormat | null>(
      storeInvoice.dateFormat ?? null,
      Validators.required,
    ),

    taxOption: fb.nonNullable.control<TaxOption>(storeInvoice.taxOption ?? TaxOption.CGST_SGST, {
      validators: Validators.required,
    }),

    hasItemDescription: fb.nonNullable.control(storeInvoice.hasItemDescription ?? false),
    hasItemDiscount: fb.nonNullable.control(storeInvoice.hasItemDiscount ?? false),
    internationalNumbering: fb.nonNullable.control(storeInvoice.internationalNumbering ?? false),

    accountNumber: fb.nonNullable.control(storeInvoice.accountNumber ?? '', Validators.required),
    accountName: fb.nonNullable.control(storeInvoice.accountName ?? '', Validators.required),
    bankName: fb.nonNullable.control(storeInvoice.bankName ?? '', Validators.required),

    terms: fb.nonNullable.control(storeInvoice.terms ?? ''),
    notes: fb.nonNullable.control(storeInvoice.notes ?? ''),
    deliveryState: fb.nonNullable.control(storeInvoice.deliveryState ?? '', Validators.required),

    organization: fb.group<OrganizationForm>({
      name: fb.nonNullable.control(storeInvoice.organization?.name ?? '', Validators.required),
      address: fb.nonNullable.control(
        storeInvoice.organization?.address ?? '',
        Validators.required,
      ),
      country: fb.nonNullable.control(
        storeInvoice.organization?.country ?? emptyCountry,
        Validators.required,
      ),
      email: fb.nonNullable.control(storeInvoice.organization?.email ?? '', [
        Validators.required,
        Validators.email,
      ]),
      phone: fb.nonNullable.control(storeInvoice.organization?.phone ?? '', Validators.required),
      gstin: fb.nonNullable.control(storeInvoice.organization?.gstin ?? '', Validators.required),
      authorityName: fb.nonNullable.control(
        storeInvoice.organization?.authorityName ?? '',
        Validators.required,
      ),
      authorityDesignation: fb.nonNullable.control(
        storeInvoice.organization?.authorityDesignation ?? '',
        Validators.required,
      ),
    }),

    customer: fb.group<CustomerForm>({
      name: fb.nonNullable.control(storeInvoice.customer?.name ?? '', Validators.required),
      address: fb.nonNullable.control(storeInvoice.customer?.address ?? '', Validators.required),
      country: fb.nonNullable.control(
        storeInvoice.customer?.country ?? emptyCountry,
        Validators.required,
      ),
      email: fb.nonNullable.control(storeInvoice.customer?.email ?? '', [
        Validators.required,
        Validators.email,
      ]),
      phone: fb.nonNullable.control(storeInvoice.customer?.phone ?? '', Validators.required),
      gstin: fb.nonNullable.control(storeInvoice.customer?.gstin ?? '', Validators.required),
    }),

    items: fb.array<FormGroup<InvoiceItemForm>>(
      (storeInvoice.items ?? []).map((item) =>
        fb.group<InvoiceItemForm>({
          name: fb.nonNullable.control(item.name ?? '', Validators.required),
          description: fb.nonNullable.control(item.description ?? ''),
          quantity: fb.nonNullable.control(item.quantity ?? 1, [
            Validators.required,
            Validators.min(1),
          ]),
          price: fb.nonNullable.control(item.price ?? 0, [Validators.required, Validators.min(0)]),

          itemTotal: fb.nonNullable.control(item.itemTotal ?? 0),
          discountAmount: fb.nonNullable.control(item.discountAmount ?? 0),
          discPercentage: fb.nonNullable.control(item.discPercentage ?? 0),
          subTotal: fb.nonNullable.control(item.subTotal ?? 0),

          tax1Amount: fb.nonNullable.control(item.tax1Amount ?? 0),
          tax1Percentage: fb.nonNullable.control(item.tax1Percentage ?? 0),
          tax2Amount: fb.nonNullable.control(item.tax2Amount ?? 0),
          tax2Percentage: fb.nonNullable.control(item.tax2Percentage ?? 0),
          tax3Amount: fb.nonNullable.control(item.tax3Amount ?? 0),
          tax3Percentage: fb.nonNullable.control(item.tax3Percentage ?? 0),

          taxTotal: fb.nonNullable.control(item.taxTotal ?? 0),
          grandTotal: fb.nonNullable.control(item.grandTotal ?? 0),
        }),
      ),
    ),

    itemTotal: fb.nonNullable.control(storeInvoice.itemTotal ?? 0),
    discountTotal: fb.nonNullable.control(storeInvoice.discountTotal ?? 0),
    subTotal: fb.nonNullable.control(storeInvoice.subTotal ?? 0),
    taxTotal: fb.nonNullable.control(storeInvoice.taxTotal ?? 0),
    roundOff: fb.nonNullable.control(storeInvoice.roundOff ?? 0),
    grandTotal: fb.nonNullable.control(storeInvoice.grandTotal ?? 0),
    grandTotalInWords: fb.nonNullable.control(storeInvoice.grandTotalInWords ?? ''),

    smallLogo: fb.nonNullable.control(storeInvoice.smallLogo ?? ''),

    largeLogo: fb.nonNullable.control(storeInvoice.largeLogo ?? ''),
  });
}
