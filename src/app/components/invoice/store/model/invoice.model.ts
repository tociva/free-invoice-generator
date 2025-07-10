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
export interface Organization {
  name: string;
  address: string;
  country: Country;
  email: string;
  phone: string;
  gstin: string;
  authorityName:string;
  authorityDesignation:string;
}

export interface Customer {
  name: string;
  address: string;
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
  internationalNumbering: boolean;
  accountNumber:number;
  accountName:string;
  bankName:string;
  terms:string;
  deliveryState: string;
  organization: Organization,
  customer: Customer,
  items: InvoiceItem[]
  itemTotal: number;
  discountTotal: number;
  subTotal: number;
  taxTotal: number;
  roundOff: number;
  grandTotal: number;
  grandTotalInWords: string;
  smallLogo: string;
  largeLogo: string;
}