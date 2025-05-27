import { Invoice, InvoiceItem } from "../app/components/invoice/store/model/invoice.model";

export const reCalculateInvoice = (invoice: Invoice):Invoice => {
    const { items } = invoice;
    const itemsTemp:Array<InvoiceItem> = [];
    let invItemTotal = 0;
    let invDiscountTotal = 0;
    let invSubTotal = 0;
    let invTaxTotal = 0;
    items.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        const discountAmount = item.discPercentage ? itemTotal * item.discPercentage / 100 : 0;
        const subTotal = itemTotal - discountAmount;
        const tax1Amount = item.tax1Percentage ? subTotal * item.tax1Percentage / 100 : 0;
        const tax2Amount = item.tax2Percentage ? subTotal * item.tax2Percentage / 100 : 0;
        const tax3Amount = item.tax3Percentage ? subTotal * item.tax3Percentage / 100 : 0;
        const taxTotal = tax1Amount + tax2Amount + tax3Amount;
        const grandTotal = subTotal + taxTotal;
        itemsTemp.push({...item, itemTotal, discountAmount, subTotal, tax1Amount, tax2Amount, tax3Amount, taxTotal, grandTotal});
        invItemTotal += itemTotal;
        invDiscountTotal += discountAmount;
        invSubTotal += subTotal;
        invTaxTotal += taxTotal;
    })
    const grandTotal = invSubTotal + invTaxTotal + (invoice.roundOff ?? 0);
    return { ...invoice, items: itemsTemp, itemTotal: invItemTotal, discountTotal: invDiscountTotal, subTotal: invSubTotal, taxTotal: invTaxTotal, grandTotal };
}