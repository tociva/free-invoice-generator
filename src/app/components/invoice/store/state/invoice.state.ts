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
    accountNumber:'225522552255',
    accountName:'Joeh Doe',
    bankName:'Bank Of Stringhills',
    organization: {
      name: 'Stringhills Labs',
      authorityName: 'Joeh Doe',
      authorityDesignation:'Manager',
      address: 'String Towers,String Valley',
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
      email: 'stringlabs@string.com',
      phone: '2255225522',
      gstin: '5522552255'
    },
    customer: {
      name: 'Tom Technologies',
      address: 'Tom towers,tom valley',
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
      email: 'tomtechnologies@gmail.com',
      phone: '1234567890',
      gstin: '1234567890'
    },
    items: [
      {
        name: 'Web Development',
        description: 'Website development',
        quantity: 1,
        price: 100000,
        itemTotal: 100000,
        discountAmount: 0,
        discPercentage: 0,
        subTotal: 100000,
        tax1Amount: 0,
        tax1Percentage: 0,
        tax2Amount: 0,
        tax2Percentage: 0,
        tax3Amount: 0,
        tax3Percentage: 0,
        taxTotal: 0,
        grandTotal: 100000,
      },
      {
        name: 'Android App Development',
        description: 'Android application Development',
        quantity: 1,
        price: 200000,
        itemTotal: 200000,
        discountAmount: 0,
        discPercentage: 0,
        subTotal: 200000,
        tax1Amount: 0,
        tax1Percentage: 0,
        tax2Amount: 0,
        tax2Percentage: 0,
        tax3Amount: 0,
        tax3Percentage: 0,
        taxTotal: 0,
        grandTotal: 200000,
      }
    ],
    itemTotal: 300000,
    discountTotal: 0,
    subTotal: 300000,
    taxTotal: 0,
    roundOff: 0,
    grandTotal: 300000,
    grandTotalInWords: 'Three Lakhs',
    terms:'Payment is due within 15 days of the invoice date. Late payments may incur interest. Please contact us within 7 days regarding any discrepancies.',
    notes:'Type aditional notes here',
    smallLogo: '',
    largeLogo: ''
  },
  error: null
};
