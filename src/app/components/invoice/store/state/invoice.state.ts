import { Invoice, TaxOption } from '../model/invoice.model';

export interface InvoiceState {
  invoice: Invoice;
  error: string | null;
}

export const initialInvoiceState: InvoiceState = {
  invoice: {
    number: 'SRV-2025-00914',
    date: new Date('2025-06-24'),
    dueDate: new Date('2025-07-01'),
    currency: {
      name: 'Indian Rupee',
      html: '&#8377;',
      unicode: '20B9',
      decimal: 2
    },
    decimalPlaces: 2,
    deliveryState: 'Tamil Nadu',
    taxOption: TaxOption.CGST_SGST,
    hasItemDescription: true,
    hasItemDiscount: true,
    internationalNumbering: false,
    dateFormat: {
      name: '24-06-2025',
      value: 'DD-MM-YYYY'
    },
    accountNumber:12345678910,
    accountName:'',
    bankName:'',
    terms:'',
    organization: {
      name: 'NextEdge Software Solutions',
      authorityName: 'Prince Francis',
      designation:'Director',
      addressLine1: 'Block C, Olympia Tech Park',
      addressLine2: 'SIDCO Industrial Estate',
      street: 'Guindy',
      city: 'Chennai',
      zipCode: '600032',
      state: 'Tamil Nadu',
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
        dateFormat: {
          name: '24-06-2025',
          value: 'DD-MM-YYYY'
        }
      },
      email: 'accounts@nextedge.in',
      phone: '+91-9840032100',
      gstin: '33NEXT4567L1Z9'
    },
    customer: {
      name: 'PixelCraft Private Limited',
      authorityName: 'Prince Francis',
      designation:'Director',
      addressLine1: 'Plot No. 5, Kavuri Hills',
      addressLine2: 'Phase 1',
      street: 'Madhapur',
      city: 'Hyderabad',
      zipCode: '500081',
      state: 'Telangana',
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
        dateFormat: {
          name: '24-06-2025',
          value: 'DD-MM-YYYY'
        }
      },
      email: 'finance@pixelcraft.co.in',
      phone: '+91-9700123456',
      gstin: '36PXLC5678P1Z2'
    },
    items: [
      {
        name: 'Custom Web App Development',
        description: 'Full-stack development of an internal HR portal with admin dashboard.',
        quantity: 1,
        price: 48000,
        itemTotal: 48000,
        discountAmount: 0,
        discPercentage: 0,
        subTotal: 48000,
        tax1Amount: 4320,
        tax1Percentage: 9,
        tax2Amount: 4320,
        tax2Percentage: 9,
        tax3Amount: 0,
        tax3Percentage: 0,
        taxTotal: 8640,
        grandTotal: 56640
      },
      {
        name: 'Monthly Cloud Maintenance',
        description: '24/7 server uptime checks, patching, and performance monitoring.',
        quantity: 1,
        price: 10000,
        itemTotal: 10000,
        discountAmount: 1000,
        discPercentage: 10,
        subTotal: 9000,
        tax1Amount: 810,
        tax1Percentage: 9,
        tax2Amount: 810,
        tax2Percentage: 9,
        tax3Amount: 0,
        tax3Percentage: 0,
        taxTotal: 1620,
        grandTotal: 10620
      },
      {
        name: 'Security Audit Report',
        description: 'Audit of web and API endpoints, vulnerability report, and recommendations.',
        quantity: 1,
        price: 8000,
        itemTotal: 8000,
        discountAmount: 0,
        discPercentage: 0,
        subTotal: 8000,
        tax1Amount: 720,
        tax1Percentage: 9,
        tax2Amount: 720,
        tax2Percentage: 9,
        tax3Amount: 0,
        tax3Percentage: 0,
        taxTotal: 1440,
        grandTotal: 9440
      },
      {
        name: 'Tech Support Retainer (June 2025)',
        description: 'Priority email & phone tech support for month of June.',
        quantity: 1,
        price: 5000,
        itemTotal: 5000,
        discountAmount: 500,
        discPercentage: 10,
        subTotal: 4500,
        tax1Amount: 405,
        tax1Percentage: 9,
        tax2Amount: 405,
        tax2Percentage: 9,
        tax3Amount: 0,
        tax3Percentage: 0,
        taxTotal: 810,
        grandTotal: 5310
      }
    ],
    itemTotal: 71000,
    discountTotal: 1500,
    subTotal: 69500,
    taxTotal: 12510,
    roundOff: 0,
    grandTotal: 82010,
    grandTotalInWords: 'Eighty Two Thousand Ten Only',
    smallLogo: 'data:image/png;base64, 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',
    largeLogo: ''
  },
  error: null
};
