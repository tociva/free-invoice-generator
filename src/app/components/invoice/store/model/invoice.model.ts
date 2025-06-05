import { Country } from './country.model';
import { Currency } from './currency.model';
import { DateFormat } from './date-format.model';

export enum TaxOption {
  CGST_SGST = 'CGST & SGST',
  IGST = 'IGST',
  NON_TAXABLE = 'Non Taxable',
}

export interface InvoiceItem {
  name: string;
  description: string;
  quantity: number;
  price: number;
  itemTotal: number;
  discountAmount: number;
  discPercentage: number;
  subTotal: number;
  tax1Amount: number;
  tax1Percentage: number;
  tax2Amount: number;
  tax2Percentage: number;
  tax3Amount: number;
  tax3Percentage: number;
  taxTotal: number;
  grandTotal: number;
}

export interface Address {
  name: string;
  addressLine1: string;
  addressLine2: string;
  street: string;
  city: string;
  zipCode: string;
  state: string;
  country: Country;
  email: string;
  phone: string;
  gstin: string;
}

export interface Invoice {
  number: string;
  date: Date;
  dueDate: Date;
  currency: Currency;
  decimalPlaces: number;
  dateFormat: DateFormat;
  taxOption: TaxOption;
  hasItemDescription: boolean;
  hasItemDiscount: boolean;
  deliveryState: string;
  organization: Address,
  customer: Address,
  items: InvoiceItem[]
  itemTotal: number;
  discountTotal: number;
  subTotal: number;
  taxTotal: number;
  roundOff: number;
  grandTotal: number;
  grandTotalInWords: string;
}