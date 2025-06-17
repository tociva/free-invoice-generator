import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { TemplateItem } from '../../templates/store/model/template.model';
import { selectSelectedTemplateItem } from '../../templates/store/selectors/template.selector';
import { TemplateState } from '../../templates/store/state/template.state';
import { TemplateUtil } from '../../util/template.util';
import { selectInvoice } from '../store/selectors/invoice.selectors';

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
  private destroy$ = new Subject<void>();
  selectedTemplate: TemplateItem | null = null;
  downloadTemplateAsHTML = TemplateUtil.downloadTemplateAsHTML;


  constructor(
    private store: Store<TemplateState>,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {
  }

  ngOnInit(): void {

    this.store.select(selectInvoice).pipe(takeUntil(this.destroy$)).subscribe((invoice) => {  
    this.store.select(selectSelectedTemplateItem).pipe(takeUntil(this.destroy$)).subscribe(async (item) => {
      if (item) {
        const template = await firstValueFrom(
          this.http.get(item.path, { responseType: 'text' })
        );
        const html = TemplateUtil.fillTemplate(template, invoice);
        const safeHTML = this.sanitizer.bypassSecurityTrustHtml(html);
        this.selectedTemplate = { ...item, template, html, safeHTML };
      }
      else {
        this.selectedTemplate = null;
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
  const blob = new Blob([template?.html || ''], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${template?.name || 'template'}.html`;
  a.click();

  window.URL.revokeObjectURL(url);
}




}