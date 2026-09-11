import { Invoice, InvoiceItem } from '../app/components/invoice/store/model/invoice.model';
import { DEFAULT_DECIMAL_PLACES } from './constants';

export const BASE_ITEM_ROW_DATA: InvoiceItem = {
  name: '', description: '', quantity: 1, price: 0, itemTotal: 0, discountAmount: 0,
  discPercentage: 0, subTotal: 0, tax1Amount: 0, tax1Percentage: 0,
  tax2Amount: 0, tax2Percentage: 0, tax3Amount: 0, tax3Percentage: 0,
  taxTotal: 0, grandTotal: 0,
};

export const numberToFixedDecimal = (num: number, decimal: number): string => {

  if (!num) {

    return '';

  }
  const form = num.toLocaleString(undefined, { minimumFractionDigits: decimal,
    maximumFractionDigits: decimal });
  if (Number(form) === 0) {

    return '';

  }
  return form;

};

export const currencyToFixedNumber = (num: number, decimal: number): number => {

  const format = num.toFixed(decimal);
  return Number(format ?? '0');

};

export const formatItemValues = (item: InvoiceItem, decimalPlaces: number): InvoiceItem => {
  const { price, itemTotal, discountAmount, subTotal, tax1Amount, tax2Amount, tax3Amount, taxTotal, grandTotal } = item;
  const nPrice = currencyToFixedNumber(price, decimalPlaces);
  const nItemTotal = currencyToFixedNumber(itemTotal, decimalPlaces);
  const nDiscountAmount = currencyToFixedNumber(discountAmount, decimalPlaces);
  const nSubTotal = currencyToFixedNumber(subTotal, decimalPlaces);
  const nTax1Amount = currencyToFixedNumber(tax1Amount, decimalPlaces);
  const nTax2Amount = currencyToFixedNumber(tax2Amount, decimalPlaces);
  const nTax3Amount = currencyToFixedNumber(tax3Amount, decimalPlaces);
  const nTaxTotal = currencyToFixedNumber(taxTotal, decimalPlaces);
  const nGrandTotal = currencyToFixedNumber(grandTotal, decimalPlaces);
  return {
    ...item,
    price: nPrice,
    itemTotal: nItemTotal,
    discountAmount: nDiscountAmount,
    subTotal: nSubTotal,
    tax1Amount: nTax1Amount,
    tax2Amount: nTax2Amount,
    tax3Amount: nTax3Amount,
    taxTotal: nTaxTotal,
    grandTotal: nGrandTotal
  };
};

export const reCalculateInvoice = (invoice: Invoice):Invoice => {
    const { items } = invoice;
    const itemsTemp:InvoiceItem[] = [];
    let invItemTotal = 0;
    let invDiscountTotal = 0;
    let invSubTotal = 0;
    let invTaxTotal = 0;
    const decimalPlaces = invoice.decimalPlaces ?? DEFAULT_DECIMAL_PLACES;
    items.forEach((item) => {
      const nItem = formatItemValues(item, decimalPlaces);
      const itemTotal = item.price * item.quantity;
      const discountAmount = currencyToFixedNumber(item.discPercentage ? itemTotal * item.discPercentage / 100 : 0, decimalPlaces);
      const subTotal = itemTotal - discountAmount;
      const tax1Amount = currencyToFixedNumber(item.tax1Percentage ? subTotal * item.tax1Percentage / 100 : 0, decimalPlaces);
      const tax2Amount = currencyToFixedNumber(item.tax2Percentage ? subTotal * item.tax2Percentage / 100 : 0, decimalPlaces);
      const tax3Amount = currencyToFixedNumber(item.tax3Percentage ? subTotal * item.tax3Percentage / 100 : 0, decimalPlaces);
      const taxTotal = tax1Amount + tax2Amount + tax3Amount;
      const grandTotal = subTotal + taxTotal;
      itemsTemp.push({...nItem, itemTotal, discountAmount, subTotal, tax1Amount, tax2Amount, tax3Amount, taxTotal, grandTotal});
      invItemTotal += itemTotal;
      invDiscountTotal += discountAmount;
      invSubTotal += subTotal;
      invTaxTotal += taxTotal;
    });
    const grandTotal = invSubTotal + invTaxTotal + (invoice.roundOff ?? 0);
    const nInvoice = { ...invoice, items: itemsTemp, 
      itemTotal: currencyToFixedNumber(invItemTotal, decimalPlaces), 
      discountTotal: currencyToFixedNumber(invDiscountTotal, decimalPlaces), 
      subTotal: currencyToFixedNumber(invSubTotal, decimalPlaces), 
      taxTotal: currencyToFixedNumber(invTaxTotal, decimalPlaces), 
      grandTotal: currencyToFixedNumber(grandTotal, decimalPlaces) };
    return nInvoice;
};