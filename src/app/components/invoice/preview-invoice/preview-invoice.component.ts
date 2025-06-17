import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { TemplateItem } from '../../templates/store/model/template.model';
import { TemplateState } from '../../templates/store/state/template.state';
import { TemplateUtil } from '../../util/template.util';
import { selectInvoice } from '../store/selectors/invoice.selectors';
import { selectPaginatedTemplateItemsAllConditions, selectSelectedTemplate } from '../../templates/store/selectors/template.selector';
import { MatIcon } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, take } from 'rxjs';
import { setSelectedTemplate } from '../../templates/store/actions/template.actions';

@Component({
  selector: 'app-preview-invoice',
  imports: [CommonModule,
    MatIcon
  ],
  templateUrl: './preview-invoice.component.html',
  styleUrl: './preview-invoice.component.scss',
  standalone: true
})
export class PreviewInvoiceComponent implements OnInit {
  @ViewChild('invoiceFrame') invoiceFrame!: ElementRef<HTMLIFrameElement>;

  selectedTemplate!: TemplateItem;
  downloadTemplateAsHTML = TemplateUtil.downloadTemplateAsHTML;


  constructor(
    private store: Store<TemplateState>,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {
  }

  ngOnInit(): void {
  this.store.select(selectInvoice).pipe(take(1)).subscribe((invoice) => {
    this.store.select(selectSelectedTemplate).pipe(take(1)).subscribe(async (template) => {
      if (!template) {
        // fallback: fetch list and pick first
        const templates = await firstValueFrom(this.store.select(selectPaginatedTemplateItemsAllConditions));
        if (templates.length > 0) {
          template = templates[0];
          this.store.dispatch(setSelectedTemplate({ selectedTemplate: template }));
        }
      }

      if (template) {
        let templateHtml = template.template;
        if (!templateHtml) {
          // fetch from template.path if not preloaded
          templateHtml = await firstValueFrom(this.http.get(template.path, { responseType: 'text' }));
        }

        const filledHtml = TemplateUtil.fillTemplate(templateHtml, invoice);
        const safeHtml = this.sanitizer.bypassSecurityTrustHtml(filledHtml);

        this.selectedTemplate = {
          ...template,
          template: templateHtml,
          html: filledHtml,
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
printTemplate(): void {
    const iframe = this.invoiceFrame?.nativeElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  }
// eslint-disable-next-line class-methods-use-this
downloadJSON(template: TemplateItem): void {
  const fileName = `${template.name || 'template'}.json`;
  const json = JSON.stringify(template, null, 2); // pretty-printed
  const blob = new Blob([json], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  window.URL.revokeObjectURL(url);
}
// in TemplateUtil.ts
downloadTemplate(): void {
  const template = this.selectedTemplate;
  const blob = new Blob([template.html], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${template.name || 'template'}.html`;
  a.click();

  window.URL.revokeObjectURL(url);
}




}