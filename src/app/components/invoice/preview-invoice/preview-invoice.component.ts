import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { TemplateItem } from '../../templates/store/model/template.model';
import { TemplateState } from '../../templates/store/state/template.state';
import { TemplateUtil } from '../../util/template.util';
import { selectInvoice } from '../store/selectors/invoice.selectors';
import { selectSelectedTemplate } from '../../templates/store/selectors/template.selector';

@Component({
  selector: 'app-preview-invoice',
  imports: [CommonModule],
  templateUrl: './preview-invoice.component.html',
  styleUrl: './preview-invoice.component.scss',
  standalone: true
})
export class PreviewInvoiceComponent implements OnInit {
  selectedTemplate!: TemplateItem;

  constructor(
    private store: Store<TemplateState>,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit(): void {
   this.store.select(selectInvoice).subscribe((invoice) => {
    this.store.select(selectSelectedTemplate).subscribe((template) => {
      if(template) {
      const html = TemplateUtil.fillTemplate(template.template, invoice);
      const safeHtml = this.sanitizer.bypassSecurityTrustHtml(html);
      this.selectedTemplate = {
          ...template,
          html,
          safeHTML: safeHtml
        };
      }
    });
   });
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }


  // eslint-disable-next-line class-methods-use-this
 downloadPDF(template: TemplateItem): void {
  TemplateUtil.downloadTemplateAsPDF(template);
}

// eslint-disable-next-line class-methods-use-this
downloadHTML(template: TemplateItem): void {
  TemplateUtil.downloadTemplateAsHTML(template);
}


}