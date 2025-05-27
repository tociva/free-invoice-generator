import { Currency } from "./currency.model";
import { DateFormat } from "./date-format.model";

  export interface Country {
    name: string;
    code: string;
    iso: string;
    currency: Currency;
    dateformat: DateFormat;
  }
  