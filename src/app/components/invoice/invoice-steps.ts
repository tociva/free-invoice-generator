export interface InvoiceStepConfig {
  id: number;
  label: string;
}

export const ADVANCED_INVOICE_STEPS: readonly InvoiceStepConfig[] = [
  { id: 1, label: 'My Organization Info & Logo' },
  { id: 2, label: 'Customer Details' },
  { id: 3, label: 'Invoice Details' },
  { id: 4, label: 'Items and Summary' },
  { id: 5, label: 'Select a template' },
  { id: 6, label: 'Preview and Download' },
];

export const SIMPLE_INVOICE_STEPS: readonly InvoiceStepConfig[] = [
  { id: 1, label: 'Fill invoice details' },
  { id: 2, label: 'Select a template' },
  { id: 3, label: 'Preview and Download' },
];

