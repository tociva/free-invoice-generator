import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { combineLatest, filter, firstValueFrom, Subject, take, takeUntil } from 'rxjs';
import { loadTemplates } from '../../templates/store/actions/template.actions';
import { TemplateItem } from '../../templates/store/model/template.model';
import { selectSelectedTemplateItem, selectTemplatesLoaded } from '../../templates/store/selectors/template.selector';
import { TemplateState } from '../../templates/store/state/template.state';
import { TemplateUtil } from '../../util/template.util';
import { Invoice } from '../store/model/invoice.model';
import { selectInvoice } from '../store/selectors/invoice.selectors';

@Component({
  selector: 'app-preview-invoice',
  imports: [CommonModule,
    MatIcon,
    MatTooltipModule
  ],
  templateUrl: './preview-invoice.component.html',
  styleUrl: './preview-invoice.component.scss',
  standalone: true
})
export class PreviewInvoiceComponent implements OnInit {

  @ViewChild('invoiceFrame') invoiceFrame!: ElementRef<HTMLIFrameElement>;

  private invoice!: Invoice;
  private destroy$ = new Subject<void>();
  selectedTemplate: TemplateItem | null = null;
  isDragging = false;
  downloadTemplateAsHTML = TemplateUtil.downloadTemplateAsHTML;


  constructor(
    private store: Store<TemplateState>,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {
  }

  ngOnInit(): void {
    this.store.select(selectTemplatesLoaded).pipe(
      take(1),
      filter((loaded) => !loaded)
    ).subscribe(() => {
      this.store.dispatch(loadTemplates());
    });
    combineLatest([
      this.store.select(selectInvoice),
      this.store.select(selectSelectedTemplateItem)
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe(async ([invoice, item]) => {
      this.invoice = invoice;
  
      if (item) {
        try {
          const template = await firstValueFrom(
            this.http.get(item.path, { responseType: 'text' })
          );
          const html = TemplateUtil.fillTemplate(template, invoice);
          const safeHTML = this.sanitizer.bypassSecurityTrustHtml(html);
          this.selectedTemplate = { ...item, template, html, safeHTML };
        } catch (err) {
          console.error('Template fetch failed:', err);
          this.selectedTemplate = null;
        }
      } else {
        this.selectedTemplate = null;
      }
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
 
downloadJSON(): void {
  const fileName = 'invoice.json';
  const json = JSON.stringify(this.invoice, null, 2);
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

onTemplateUpload(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    this.processFile(file);
  }
}

onDragOver(event: DragEvent): void {
  event.preventDefault();
  this.isDragging = true;
}

onDragLeave(event: DragEvent): void {
  event.preventDefault();
  this.isDragging = false;
}

onDrop(event: DragEvent): void {
  event.preventDefault();
  this.isDragging = false;
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    this.processFile(file);
  }
}

processFile(file: File): void {

  const name = file.name;
  const extension = name.split('.').pop();
  if (!['html', 'htm'].includes(extension || '')) {
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const template = e.target?.result as string;
    
    const html = TemplateUtil.fillTemplate(template, this.invoice);
    const safeHTML = this.sanitizer.bypassSecurityTrustHtml(html);
    this.selectedTemplate = {
      name: file.name,
      path: '',
      tags: [],
      html,
      safeHTML,
      template,
      color: 'Blue',
    };
  };
  reader.readAsText(file);
  
}


}