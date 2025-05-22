export interface TaxState {
  taxes: string[];
  selectedTax: string | null;
  error: string | null;
}

export const initialTaxState: TaxState = {
  taxes: [],
  selectedTax: null,
  error: null
};
