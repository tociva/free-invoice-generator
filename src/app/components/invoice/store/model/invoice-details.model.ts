import { Currency } from "./currency.model";
import { DateFormat } from "./date-format.model";

export interface InvoiceDetails {
  number: string;
  date: Date;
  dueDate: Date;
  currency: Currency;
  decimalPlaces: number;
  deliveryState: string;
  taxOption: string;
  itemDescription: boolean;
  showDiscount: boolean;
  dateformat: DateFormat;
}