import { Currency } from "./currency.model";

export interface InvoiceDetails {
  number: string;
  date: Date;
  dueDate: Date;
  currency: Currency;
  deliveryState: string;
  taxOption: string;
  itemDescription: boolean;
  showDiscount: boolean;
}