import { TaxOption } from "../model/invoice.model";

export interface TaxState {
  taxes: string[];
  selectedTax: string | null;
  error: string | null;
}

export const initialTaxState: TaxState = {
  taxes: [TaxOption.CGST_SGST, TaxOption.IGST, TaxOption.NON_TAXABLE],
  selectedTax: null,
  error: null
};
