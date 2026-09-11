import { Currency } from "../currency/currency.model";
import { DateFormat } from "../date-format/date-format.model";

export interface Country {
  code: string;
  name: string;
  iso: string;
  phone: string;
  currencycode: string;
  dateformat: string;
  currency?: Currency;
  dateFormat?: DateFormat;
}

export function countryFlagClass(code: string | null | undefined): string {
  const slug = (code ?? '').trim().toLowerCase();
  return `country-flag country-flag--${slug || 'xx'}`;
}
