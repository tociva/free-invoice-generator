export interface TaxState {
  taxes: string[];
  selectedTax: string | null;
  error: string | null;
}

export const initialTaxState: TaxState = {
  taxes: ['SGST/CGST', 'IGST', 'Non Taxable'],
  selectedTax: null,
  error: null
};
