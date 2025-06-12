import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { TemplateItem } from '../../templates/store/model/template.model';
import { TemplateState } from '../../templates/store/state/template.state';
import { selectSelectedTemplate } from '../../templates/store/selectors/template.selector';
import { CommonModule } from '@angular/common';
import { TemplateUtil } from '../../util/template.util';

@Component({
  selector: 'app-preview-invoice',
  imports: [CommonModule],
  templateUrl: './preview-invoice.component.html',
  styleUrl: './preview-invoice.component.scss',
  standalone: true
})
export class PreviewInvoiceComponent {
  selectedTemplate$: Observable<TemplateItem | null>;

  constructor(
    private store: Store<TemplateState>,
    private sanitizer: DomSanitizer
  ) {
    this.selectedTemplate$ = this.store.select(selectSelectedTemplate);
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