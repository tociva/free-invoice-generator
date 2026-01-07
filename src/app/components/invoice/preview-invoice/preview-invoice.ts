import { Component, OnInit, input, signal, effect } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

type TemplateItem = {
  id: string;
  name: string;
  description: string;
  path: string;
  html: string;
  safeHTML?: SafeHtml;
  tags?: string[];
  thumbnail?: string;
  isSelected: boolean;
};

@Component({
  selector: 'app-preview-invoice',
  standalone: true,
  imports: [],
  templateUrl: './preview-invoice.html',
})
export class PreviewInvoiceComponent implements OnInit {
  selectedTemplate = input<TemplateItem | null>(null);
  previewHtml = signal<SafeHtml | null>(null);

  constructor(private sanitizer: DomSanitizer) {
    effect(() => {
      // Track the input signal
      const template = this.selectedTemplate();
      this.updatePreview();
    });
  }

  ngOnInit(): void {
    this.updatePreview();
  }

  updatePreview(): void {
    const template = this.selectedTemplate();
    if (template?.html) {
      // Inject CSS to hide scrollbars and ensure proper display
      let htmlWithStyles = template.html;
      const noScrollStyle = '<style>body { overflow: hidden !important; margin: 0; padding: 0; } html { overflow: hidden !important; margin: 0; padding: 0; }</style>';
      
      if (htmlWithStyles.includes('</head>')) {
        htmlWithStyles = htmlWithStyles.replace('</head>', noScrollStyle + '</head>');
      } else if (htmlWithStyles.includes('<head>')) {
        htmlWithStyles = htmlWithStyles.replace('<head>', '<head>' + noScrollStyle);
      } else {
        htmlWithStyles = noScrollStyle + htmlWithStyles;
      }
      
      this.previewHtml.set(this.sanitizer.bypassSecurityTrustHtml(htmlWithStyles));
    } else {
      this.previewHtml.set(null);
    }
  }

  handlePrint(): void {
    window.print();
  }

  handleDownloadPDF(): void {
    // TODO: Implement PDF download
    console.log('Download PDF');
  }

  handleDownloadJSON(): void {
    // TODO: Implement JSON download
    console.log('Download JSON');
  }

  handleDownloadHTML(): void {
    const template = this.selectedTemplate();
    if (template?.html) {
      const blob = new Blob([template.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  handleViewCode(): void {
    // TODO: Implement code view
    console.log('View Code');
  }
}
