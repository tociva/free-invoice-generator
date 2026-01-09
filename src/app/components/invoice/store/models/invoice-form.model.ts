import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Currency } from '../currency/currency.model';
import { DateFormat } from '../date-format/date-format.model';
import { TaxOption } from './invoice-model';
import { Country } from '../country/country.model';

export interface InvoiceItemForm {
  name: FormControl<string>;
  description: FormControl<string | null>;
  quantity: FormControl<number>;
  price: FormControl<number>;
  itemTotal: FormControl<number>;
  discountAmount: FormControl<number>;
  discPercentage: FormControl<number>;
  subTotal: FormControl<number>;
  tax1Amount: FormControl<number>;
  tax1Percentage: FormControl<number>;
  tax2Amount: FormControl<number>;
  tax2Percentage: FormControl<number>;
  tax3Amount: FormControl<number>;
  tax3Percentage: FormControl<number>;
  taxTotal: FormControl<number>;
  grandTotal: FormControl<number>;
}
export interface OrganizationForm {
  name: FormControl<string>;
  address: FormControl<string>;
  country: FormControl<Country | null>;
  email: FormControl<string>;
  phone: FormControl<string>;
  gstin: FormControl<string>;
  authorityName: FormControl<string>;
  authorityDesignation: FormControl<string>;
}

export interface CustomerForm {
  name: FormControl<string>;
  address: FormControl<string>;
  country: FormControl<Country | null>;
  email: FormControl<string>;
  phone: FormControl<string>;
  gstin: FormControl<string>;
}

export interface InvoiceForm {
  invoiceNo: FormControl<string>;
  invoiceDate: FormControl<Date>;
  invoiceDueDate: FormControl<Date | null>;
  currency: FormControl<Currency | null>;
  decimalPlaces: FormControl<number | null>;
  dateFormat: FormControl<DateFormat | null>;
  taxOption: FormControl<TaxOption>;
  hasItemDescription: FormControl<boolean>;
  hasItemDiscount: FormControl<boolean>;
  internationalNumbering: FormControl<boolean>;
  accountNumber: FormControl<string>;
  accountName: FormControl<string>;
  bankName: FormControl<string>;
  terms: FormControl<string>;
  notes: FormControl<string>;
  deliveryState: FormControl<string>;

  organization: FormGroup<OrganizationForm>;
  customer: FormGroup<CustomerForm>;
  items: FormArray<FormGroup<InvoiceItemForm>>;

  itemTotal: FormControl<number>;
  discountTotal: FormControl<number>;
  subTotal: FormControl<number>;
  taxTotal: FormControl<number>;
  roundOff: FormControl<number>;
  grandTotal: FormControl<number>;
  grandTotalInWords: FormControl<string>;

  smallLogo: FormControl<string>;
  largeLogo: FormControl<string>;
}
