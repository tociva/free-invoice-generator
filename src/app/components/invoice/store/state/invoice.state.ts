import { Invoice, TaxOption } from '../model/invoice.model';

export interface InvoiceState {
  invoice: Invoice;
  error: string | null;
}

export const initialInvoiceState: InvoiceState = {
  invoice: {
    number: 'INV-001',
    date: new Date('2025-06-24'),
    dueDate: new Date('2025-07-01'),
    currency: {
      name: 'Indian Rupee',
      html: '&#8377;',
      unicode: '20B9',
      decimal: 2,
      shortName: 'INR',
      fraction: 'Paisa'
    },
    decimalPlaces: 2,
    deliveryState: 'Karnataka',
    taxOption: TaxOption.CGST_SGST,
    hasItemDescription: false,
    hasItemDiscount: false,
    internationalNumbering: true,
    dateFormat: {
      name: '24-06-2025',
      value: 'DD-MM-YYYY'
    },
    accountNumber:'0000000000000000000000000000000000000000',
    accountName:'Account Name',
    bankName:'Bank Name',
    organization: {
      name: 'Organization Name',
      authorityName: 'Authority Name',
      authorityDesignation:'Authority Designation',
      address: 'Organization Address',
      country: {
        name: 'India',
        code: '91',
        iso: 'IN',
        currency: {
          name: 'Indian Rupee',
          html: '&#8377;',
          unicode: '20B9',
          decimal: 2,
          shortName: 'INR',
          fraction: 'Paisa'
        },
        dateFormat: {
          name: '24-06-2025',
          value: 'DD-MM-YYYY'
        }
      },
      email: 'organization@example.com',
      phone: '1234567890',
      gstin: '1234567890'
    },
    customer: {
      name: 'Customer Name',
      address: 'Customer Address',
      country: {
        name: 'India',
        code: '91',
        iso: 'IN',
        currency: {
          name: 'Indian Rupee',
          html: '&#8377;',
          unicode: '20B9',
          decimal: 2,
          shortName: 'INR',
          fraction: 'Paisa'
        },
        dateFormat: {
          name: '24-06-2025',
          value: 'DD-MM-YYYY'
        }
      },
      email: 'customer@example.com',
      phone: '1234567890',
      gstin: '1234567890'
    },
    items: [
      {
        name: 'Item 1',
        description: 'Item 1 Description',
        quantity: 2,
        price: 100,
        itemTotal: 200,
        discountAmount: 0,
        discPercentage: 0,
        subTotal: 200,
        tax1Amount: 0,
        tax1Percentage: 0,
        tax2Amount: 0,
        tax2Percentage: 0,
        tax3Amount: 0,
        tax3Percentage: 0,
        taxTotal: 0,
        grandTotal: 200,
      },
      {
        name: 'Item 2',
        description: 'Item 2 Description',
        quantity: 3,
        price: 200.02,
        itemTotal: 600.06,
        discountAmount: 0,
        discPercentage: 0,
        subTotal: 600.06,
        tax1Amount: 0,
        tax1Percentage: 0,
        tax2Amount: 0,
        tax2Percentage: 0,
        tax3Amount: 0,
        tax3Percentage: 0,
        taxTotal: 0,
        grandTotal: 600.06,
      }
    ],
    itemTotal: 800.06,
    discountTotal: 0,
    subTotal: 800.06,
    taxTotal: 0,
    roundOff: 0,
    grandTotal: 800.06,
    grandTotalInWords: 'Eight Hundred and Six',
    terms:'Payment is due within 15 days of the invoice date. Late payments may incur interest. Please contact us within 7 days regarding any discrepancies.',
    notes:'Type aditional notes here',
    smallLogo: '',
    largeLogo: ''
  },
  error: null
};
