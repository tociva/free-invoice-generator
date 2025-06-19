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
    taxOption: TaxOption.CGST_SGST,
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
    grandTotalInWords: 'One Hundred Eighteen Only',
    smallLogo: 'data:image/png;base64, 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',
    largeLogo: ''
  },
  error: null
};
