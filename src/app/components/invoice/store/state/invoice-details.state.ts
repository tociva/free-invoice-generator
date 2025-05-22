import { InvoiceDetails } from '../model/invoice-details.model';

export interface InvoiceDetailsState {
  selectedInvoiceDetails: InvoiceDetails;
  error: string | null;
}

export const initialInvoiceDetailsState: InvoiceDetailsState = {
  selectedInvoiceDetails: {
    number: '1234567890',
    date: new Date(),
    dueDate: new Date(),
    currency: {
      name: 'Indian Rupee',
      html: '&#8377;',
      unicode: '20B9',
      decimal: 2
    },
    deliveryState: 'Missouri',
    taxOption: 'Non Taxable',
    itemDescription: true,
    showDiscount: true
  },
  error: null
};
