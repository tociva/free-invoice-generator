import { Injectable, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { InvoiceForm } from '../models/invoice-form.model';
import { InvoiceCalculationService } from './calculation.services';
import { CurrencyUtil } from '../currency/currency.util';
import { InvoiceFormService } from '../models/invoice-form';
import { invoiceStore } from '../invoice.store';
import dayjs from 'dayjs';

@Injectable({ providedIn: 'root' })
export class InvoiceTemplateService {
  private calcService = inject(InvoiceCalculationService);
  public store = inject(invoiceStore);


  /**
   * Generates invoice HTML by replacing placeholders in template with actual invoice data
   * @param templateHtml - The HTML template with placeholders like [[org_name]], [[customer_name]], etc.
   * @param invoiceForm - The invoice form containing all the data
   * @returns HTML string with all placeholders replaced with actual values
   */
  generateInvoiceHtml(templateHtml: string): string {
    let html = templateHtml;

    // Get form values
    const formValue = this.store.invoice;
    
    // Replace organization placeholders
    html = this.replaceOrganizationPlaceholders(html, formValue.organization);
    
    // Replace customer placeholders
    html = this.replaceCustomerPlaceholders(html, formValue.customer);
    
    // Replace invoice details placeholders
    html = this.replaceInvoiceDetailsPlaceholders(html, formValue);
    
    // Replace items placeholders (this handles the loop)
    html = this.replaceItemsPlaceholders(html, formValue.items());
    
    // // Replace summary/totals placeholders
    html = this.replaceSummaryPlaceholders(html, formValue);
    
    // // Replace logo placeholders
    html = this.replaceLogoPlaceholders(html, formValue.smallLogo(), formValue.largeLogo());
    
    // // Replace terms and notes
    html = this.replaceTermsPlaceholders(html, formValue.terms(), formValue.notes());
    
    // Replace bank/account placeholders
    html = this.replaceBankPlaceholders(html, formValue);

    return html;
  }

  /**
   * Replace organization-related placeholders
   */
  private replaceOrganizationPlaceholders(html: string, org: any): string {
    if (!org) return html;

    const replacements: Record<string, string> = {
      '[[org_name]]': org.name || '',
      '[[org_address]]': org.address || '',
      '[[org_email]]': org.email || '',
      '[[org_phone]]': org.phone || '',
      '[[org_gstin]]': org.gstin || '',
      '[[org_authority_name]]': org.authorityName || '',
      '[[org_authority_designation]]': org.authorityDesignation || '',
    };

    // Add country if available
    if (org.country) {
      replacements['[[org_country]]'] = org.country.name || '';
    }

    return this.replaceAll(html, replacements);
  }

  /**
   * Replace customer-related placeholders
   */
  private replaceCustomerPlaceholders(html: string, customer: any): string {
    if (!customer) return html;

    const replacements: Record<string, string> = {
      '[[customer_name]]': customer.name || '',
      '[[customer_address]]': customer.address || '',
      '[[customer_email]]': customer.email || '',
      '[[customer_phone]]': customer.phone || '',
      '[[customer_gstin]]': customer.gstin || '',
    };

    // Add country if available
    if (customer.country) {
      replacements['[[customer_country]]'] = customer.country.name || '';
    }

    return this.replaceAll(html, replacements);
  }

  /**
   * Replace invoice details placeholders
   */
  // dateFormatValue = this.store.invoice.dateFormat()?.value;

  private replaceInvoiceDetailsPlaceholders(
    html: string,
    formValue: any,
  ): string {
    const replacements: Record<string, string> = {
      '[[invoice_number]]': formValue.invoiceNo || '',
      '[[invoice_date]]': this.formatDate(formValue.invoiceDate()),
      '[[payment_due_date]]': this.formatDate(formValue.invoiceDueDate()),
      '[[delivery_state]]': formValue.deliveryState || '',
    };

    // Add currency symbol if available
    if (formValue.currency) {
      replacements['[[currency_symbol]]'] = formValue.currency.symbol || '';
      replacements['[[currency_code]]'] = formValue.currency.code || '';
      replacements['[[currency_name]]'] = formValue.currency.name || '';
    }

    return this.replaceAll(html, replacements);
  }

  /**
   * Replace items placeholders - handles the loop between [[items_start]] and [[items_end]]
   */
  private replaceItemsPlaceholders(html: string, items: any[]): string {
    if (!items || items.length === 0) {
      // Remove the items section if no items
      return html.replace(/\[\[items_start\]\][\s\S]*?\[\[items_end\]\]/g, '');
    }

    // Find the items template section
    const itemsRegex = /\[\[items_start\]\]([\s\S]*?)\[\[items_end\]\]/;
    const match = html.match(itemsRegex);
    
    if (!match) return html;

    const itemTemplate = match[1];
    let itemsHtml = '';

    // Generate HTML for each item
    items.forEach((item) => {
      let itemHtml = itemTemplate;
      
      const itemReplacements: Record<string, string> = {
        '[[item_name]]': item.name || '',
        '[[item_description]]': item.description || '',
        '[[item_quantity]]': this.formatNumber(item.quantity),
        '[[item_price]]': this.formatNumber(item.price),
        '[[item_amount]]': this.formatNumber(item.itemTotal),
        '[[item_total]]': this.formatNumber(item.itemTotal),
        '[[item_discount]]': this.formatNumber(item.discountAmount),
        '[[item_discount_percentage]]': this.formatNumber(item.discPercentage),
        '[[item_subtotal]]': this.formatNumber(item.subTotal),
        '[[item_tax]]': this.formatNumber(item.taxTotal),
        '[[item_tax_total]]': this.formatNumber(item.taxTotal),
        '[[item_grand_total]]': this.formatNumber(item.grandTotal),
      };

      // Handle CGST & SGST if available
      if (item.tax1Amount !== undefined) {
        itemReplacements['[[item_cgst]]'] = this.formatNumber(item.tax1Amount);
        itemReplacements['[[item_cgst_percentage]]'] = this.formatNumber(item.tax1Percentage);
      }
      if (item.tax2Amount !== undefined) {
        itemReplacements['[[item_sgst]]'] = this.formatNumber(item.tax2Amount);
        itemReplacements['[[item_sgst_percentage]]'] = this.formatNumber(item.tax2Percentage);
      }
      if (item.tax3Amount !== undefined) {
        itemReplacements['[[item_igst]]'] = this.formatNumber(item.tax3Amount);
        itemReplacements['[[item_igst_percentage]]'] = this.formatNumber(item.tax3Percentage);
      }

      itemHtml = this.replaceAll(itemHtml, itemReplacements);
      itemsHtml += itemHtml;
    });

    // Replace the entire items section with generated items
    return html.replace(itemsRegex, itemsHtml);
  }

  /**
   * Replace summary/totals placeholders
   */
  private replaceSummaryPlaceholders(
    html: string,
    formValue: any,
  ): string {
    const replacements: Record<string, string> = {
      '[[itemtotal]]': formValue.itemTotal || 0,
      '[[item_total]]': formValue.itemTotal || 0,
      '[[discount]]': formValue.discountTotal || 0,
      '[[discount_total]]': formValue.discountTotal || 0,
      '[[subtotal]]': formValue.subTotal || 0,
      '[[sub_total]]': formValue.subTotal || 0,
      '[[tax_amount]]': formValue.taxTotal || 0,
      '[[tax_total]]': formValue.taxTotal || 0,
      '[[roundoff]]': formValue.roundOff || 0,
      '[[round_off]]': formValue.roundOff || 0,
      '[[grand_total]]': formValue.grandTotal || 0,
      '[[grand_total_inwords]]': formValue.grandTotalInWords() || '',
      '[[grand_total_in_words]]': formValue.grandTotalInWords() || '',
    };

    return this.replaceAll(html, replacements);
  }

  /**
   * Replace logo placeholders
   */
  private replaceLogoPlaceholders(html: string, smallLogo: string | null, largeLogo: string | null): string {
    const replacements: Record<string, string> = {
      '[[logo_small_src]]': smallLogo || '',
      '[[logo_large_src]]': largeLogo || '',
      '[[logo_src]]': smallLogo || largeLogo || '',
    };

    return this.replaceAll(html, replacements);
  }

  /**
   * Replace terms and notes placeholders
   */
  private replaceTermsPlaceholders(html: string, terms: string, notes: string): string {
    const replacements: Record<string, string> = {
      '[[terms_and_conditions]]': terms || '',
      '[[terms]]': terms || '',
      '[[notes]]': notes || '',
    };

    return this.replaceAll(html, replacements);
  }

  /**
   * Replace bank/account placeholders
   */
  private replaceBankPlaceholders(html: string, formValue: any): string {
    const replacements: Record<string, string> = {
      '[[account_number]]': formValue.accountNumber || '',
      '[[account_name]]': formValue.accountName || '',
      '[[bank_name]]': formValue.bankName || '',
    };

    return this.replaceAll(html, replacements);
  }

  /**
   * Format date according to date format
   */
private formatDate(date?: Date | string): string {
  const dateFormatValue = this.store.invoice.dateFormat()?.value || 'DD-MM-YYYY';

  if (!date) return '';

  return dayjs(date).isValid()
    ? dayjs(date).format(dateFormatValue)
    : '';
}



  private formatDate22(date: Date | null, dateFormat: any): string {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    // If dateFormat is provided, use it
    if (dateFormat?.format) {
      // Simple date formatting - you can enhance this
      return this.formatDateByFormat(d, dateFormat.format);
    }

    // Default format: DD/MM/YYYY
    return d.toLocaleDateString('en-GB');
  }

  /**
   * Format date by format string
   */
  private formatDateByFormat(date: Date, format: string): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return format
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', year.toString())
      .replace('YY', year.toString().slice(-2));
  }

  /**
   * Format number with proper decimal places
   */
  private formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined) return '0';
    return value.toFixed(2);
  }

  /**
   * Replace all occurrences of placeholders in HTML
   */
  private replaceAll(html: string, replacements: Record<string, string>): string {
    let result = html;
    for (const [placeholder, value] of Object.entries(replacements)) {
      // Use global regex to replace all occurrences
      const regex = new RegExp(this.escapeRegex(placeholder), 'g');
      result = result.replace(regex, value);
    }
    return result;
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
