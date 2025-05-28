import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, HttpClientModule]
})
export class TemplatesComponent {
  @ViewChild('iframe', { static: false }) iframeRef!: ElementRef<HTMLIFrameElement>;

  templates = [
    { 
      name: 'Scarlet Invoice', 
      path: '../templates/red/scarlet/scarlet-invoice.html',
      thumbnail: '../templates/red/scarlet/scarlet-invoice.html' 
    },
  ];

  selectedTemplate: any = null;
  rawTemplateHtml: string = '';
  filledTemplateHtml: string = '';

  invoiceData = {
    customerName: 'John Doe',
    invoiceNumber: 'INV-1234',
    invoiceDate: '2025-05-22',
    totalAmount: '₹10,000'
  };

  constructor(private http: HttpClient) { }

  onTemplateSelect(template: { name: string; path: string; thumbnail: string }): void {
    this.selectedTemplate = template;
    this.loadTemplateHtml(template.path);
  }

  loadTemplateHtml(templatePath: string) {
    this.http.get(templatePath, { responseType: 'text' })
      .subscribe(html => {
        this.rawTemplateHtml = html;
        this.fillTemplateData();
      });
  }

  fillTemplateData() {
    let resultHtml = this.rawTemplateHtml;
    for (const key in this.invoiceData) {
      const typedKey = key as keyof typeof this.invoiceData;
      const regex = new RegExp(`{{\\s*${typedKey}\\s*}}`, 'g');
      resultHtml = resultHtml.replace(regex, this.invoiceData[typedKey]);
    }

    this.filledTemplateHtml = resultHtml;
    if (this.iframeRef) {
      const iframeDoc = this.iframeRef.nativeElement.contentDocument || this.iframeRef.nativeElement.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(this.filledTemplateHtml);
        iframeDoc.close();
      }
    }
  }

  onBack(): void {
    this.selectedTemplate = null;
    this.filledTemplateHtml = '';
  }
}
