import { Invoice, TaxOption } from '../../invoice/store/model/invoice.model';

export const sampleInvoice: Invoice = {
  number: 'INV-AB-001',
  date: new Date(),
  dueDate: new Date(),
  currency: {
    name: 'Indian Rupee',
    html: '&#8377;',
    unicode: '20B9',
    decimal: 2,
    shortName: 'INR',
    fraction: 'Paisa'
  },
  decimalPlaces: 2,
  deliveryState: 'Kerala',
  taxOption: TaxOption.CGST_SGST,
  hasItemDescription: true,
  hasItemDiscount: false,
  internationalNumbering: false,
  accountNumber:'',
  accountName:'',
  bankName:'',
  terms:'',
  dateFormat: {
    name: '31-01-2022',
    value: 'DD-MM-YYYY'
  },
  organization: {
    name: 'ACME Organization',
    authorityName: 'Prince Francis',
    authorityDesignation:'Director',
    address: '123 Main St\nPMG 123\nMain Street\nPattom\n695504\nKerala\nIndia',
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
        name: '31-01-2022',
        value: 'DD-MM-YYYY'
      }
    },
    email: 'organization@example.com',
    phone: '+91 9876543210',
    gstin: 'ABCD123456FFF'
  },
  customer: {
    name: 'ACME Customer',
    address: '123 Main St\nPMG 123\nMain Street\nPattom\n695504\nKerala\nIndia',
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
        name: '31-01-2022',
        value: 'DD-MM-YYYY'
      }
    },
    email: 'customer@example.com',
    phone: '+91 9876543210',
    gstin: 'ABCD123456FFF'
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
  },
  {
    name: 'ACME Product 2',
    description: 'ACME Product 2 Description',
    quantity: 2,
    price: 100,
    itemTotal: 200,
    discountAmount: 0,
    discPercentage: 0,
    subTotal: 200,
    tax1Amount: 18,
    tax1Percentage: 9,
    tax2Amount: 18,
    tax2Percentage: 9,
    tax3Amount: 0,
    tax3Percentage: 0,
    taxTotal: 36,
    grandTotal: 236,
  }],
  itemTotal: 300,
  discountTotal: 0,
  subTotal: 300,
  taxTotal: 54,
  roundOff: 0,
  grandTotal: 354,
  grandTotalInWords: 'One Hundred Eighteen Only',
  smallLogo: '',
  largeLogo: ''
};