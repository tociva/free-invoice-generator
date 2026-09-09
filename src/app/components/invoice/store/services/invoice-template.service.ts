import { Injectable } from '@angular/core';
import { TemplateUtil } from '../../utils/templates.utils';
import { Invoice } from '../models/invoice-model';

@Injectable({ providedIn: 'root' })
export class InvoiceTemplateService {
  generateInvoiceHtml(html: string, invoice: Invoice): string {
    return TemplateUtil.fillTemplate(html, invoice);
  }
}
