import { SafeHtml } from '@angular/platform-browser';

export interface TemplateItem {
  name: string;
  path: string;
  taxType?: 'IGST' | 'CGST & SGST' | 'Non-Taxable';
  color: 'Red' | 'Blue'| 'Green'| 'Yellow';
  html: string;
  safeHTML: SafeHtml;
  template: string;
}

export interface Template {
  theme: string;
  name: string;
  description: string;
  items: TemplateItem[];
}
