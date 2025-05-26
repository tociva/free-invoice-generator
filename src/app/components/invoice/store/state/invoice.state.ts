import { Invoice, TaxOption } from '../model/invoice.model';

export interface InvoiceState {
  invoice: Invoice;
  error: string | null;
}

export const initialInvoiceState: InvoiceState = {
  invoice: {
    number: '1234567890',
    date: new Date(),
    dueDate: new Date(),
    currency: {
      name: 'Indian Rupee',
      html: '&#8377;',
      unicode: '20B9',
      decimal: 2
    },
    decimalPlaces: 2,
    deliveryState: 'Kerala',
    taxOption: TaxOption.NON_TAXABLE,
    hasItemDescription: true,
    hasItemDiscount: false,
    dateFormat: {
      name: '31-01-2022',
      value: 'DD-MM-YYYY'
    },
    organization: {
      name: 'Organization',
      addressLine1: '123 Main St',
      addressLine2: 'PMG 123',
      street: 'Main Street',
      city: 'Pattom',
      zipCode: '695504',
      state: 'Kerala',
      country: {
        name: 'India',
        code: '91',
        iso: 'IN',
        currency: {
          name: 'Indian Rupee',
          html: '&#8377;',
          unicode: '20B9',
          decimal: 2
        },
        dateformat: {
          name: '31-01-2022',
          value: 'DD-MM-YYYY'
        }
      },
      email: 'organization@example.com',
      phone: '1234567890',
      gstin: '1234567890'
    },
    customer: {
      name: 'Customer',
      addressLine1: '123 Main St',
      addressLine2: 'PMG 123',
      street: 'Main Street',
      city: 'Pattom',
      zipCode: '695504',
      state: 'Kerala',
      country: {
        name: 'India',
        code: '91',
        iso: 'IN',
        currency: {
          name: 'Indian Rupee',
          html: '&#8377;',
          unicode: '20B9',
          decimal: 2
        },
        dateformat: {
          name: '31-01-2022',
          value: 'DD-MM-YYYY'
        }
      },
      email: 'customer@example.com',
      phone: '1234567890',
      gstin: '1234567890'
    },
    items: [{
      name: 'ACME Product 1',
      description: 'ACME Product 1 Description',
      quantity: 1,
      price: 100,
      itemTotal: 100,
      discountAmount: 0,
      discPercentage: 0,
      subTotal: 100,
      tax1Amount: 9,
      tax1Percentage: 9,
      tax2Amount: 9,
      tax2Percentage: 9,
      tax3Amount: 0,
      tax3Percentage: 0,
      taxTotal: 18,
      grandTotal: 118,
    }],
    itemTotal: 100,
    discountTotal: 0,
    subTotal: 100,
    taxTotal: 18,
    roundOff: 0,
    grandTotal: 118,
    grandTotalInWords: 'One Hundred Eighteen Only'
  },
  error: null
};
