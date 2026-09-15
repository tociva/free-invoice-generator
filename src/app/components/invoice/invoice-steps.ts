export interface InvoiceStepConfig {
  id: number;
  label: string;
  description?: string;
}

export const ADVANCED_INVOICE_STEPS: readonly InvoiceStepConfig[] = [
  { id: 1, label: 'Organization Info & Logo', description: 'Tell us about your business' },
  { id: 2, label: 'Customer Details', description: 'Add client information' },
  { id: 3, label: 'Invoice Details', description: 'Set invoice information' },
  { id: 4, label: 'Items and Summary', description: 'Add items and review' },
  { id: 5, label: 'Select a template', description: 'Choose a template' },
  { id: 6, label: 'Preview and Download', description: 'Review and download' },
];

export const SIMPLE_INVOICE_STEPS: readonly InvoiceStepConfig[] = [
  { id: 1, label: 'Fill invoice details' },
  { id: 2, label: 'Select a template' },
  { id: 3, label: 'Preview and Download' },
];
