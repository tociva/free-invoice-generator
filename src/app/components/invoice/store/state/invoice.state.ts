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
    deliveryState: '',
    taxOption: TaxOption.CGST_SGST,
    hasItemDescription: false,
    hasItemDiscount: false,
    internationalNumbering: true,
    dateFormat: {
      name: '24-06-2025',
      value: 'DD-MM-YYYY'
    },
    accountNumber:'',
    accountName:'',
    bankName:'',
    organization: {
      name: '',
      authorityName: '',
      authorityDesignation:'',
      address: '',
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
      email: '',
      phone: '',
      gstin: ''
    },
    customer: {
      name: '',
      address: '',
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
      email: '',
      phone: '',
      gstin: ''
    },
    items: [
      {
        name: '',
        description: '',
        quantity: 1,
        price: 0,
        itemTotal: 0,
        discountAmount: 0,
        discPercentage: 0,
        subTotal: 0,
        tax1Amount: 0,
        tax1Percentage: 0,
        tax2Amount: 0,
        tax2Percentage: 0,
        tax3Amount: 0,
        tax3Percentage: 0,
        taxTotal: 0,
        grandTotal: 0,
      }
    ],
    itemTotal: 0,
    discountTotal: 0,
    subTotal: 0,
    taxTotal: 0,
    roundOff: 0,
    grandTotal: 0,
    grandTotalInWords: '',
    terms:'Payment is due within 15 days of the invoice date. Late payments may incur interest. Please contact us within 7 days regarding any discrepancies.',
    notes:'Type aditional notes here',
    smallLogo: '',
    largeLogo: ''
  },
  error: null
};
