import { Component, OnInit, input, signal, effect, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormGroup } from '@angular/forms';
import { InvoiceForm } from '../store/models/invoice-form.model';
import { InvoiceTemplateService } from '../store/services/invoice-template.service';
import { NgIcon } from '@ng-icons/core';

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
  imports: [NgIcon],
  templateUrl: './preview-invoice.html',
})
export class PreviewInvoiceComponent implements OnInit {
  selectedTemplate = input<TemplateItem | null>(null);
  invoiceForm = input<FormGroup<InvoiceForm> | null>(null);
  previewHtml = signal<SafeHtml | null>(null);

  private templateService = inject(InvoiceTemplateService);
  private sanitizer = inject(DomSanitizer);

  constructor() {
    effect(() => {
      // Track the input signals
      const template = this.selectedTemplate();
      const form = this.invoiceForm();
      this.updatePreview();
    });
  }

  ngOnInit(): void {
    this.updatePreview();
  }

  updatePreview(): void {
    const template = this.selectedTemplate();
    // const form = this.invoiceForm();
    
    if (template?.html) {
      // Generate invoice HTML by replacing placeholders with actual values
      let generatedHtml = this.templateService.generateInvoiceHtml(template.html);
      
      // Inject CSS to hide scrollbars and ensure proper display
      let htmlWithStyles = generatedHtml;
      const noScrollStyle = '<style>body { overflow: hidden !important; margin: 0; padding: 0; } html { overflow: hidden !important; margin: 0; padding: 0; }</style>';
      
      if (htmlWithStyles.includes('</head>')) {
        htmlWithStyles = htmlWithStyles.replace('</head>', noScrollStyle + '</head>');
      } else if (htmlWithStyles.includes('<head>')) {
        htmlWithStyles = htmlWithStyles.replace('<head>', '<head>' + noScrollStyle);
      } else {
        htmlWithStyles = noScrollStyle + htmlWithStyles;
      }
      
      this.previewHtml.set(this.sanitizer.bypassSecurityTrustHtml(htmlWithStyles));
    } else if (template?.html) {
      // If no form provided, just show template without replacements (for template selection preview)
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
    void this.downloadAsPdf();
  }

  handleDownloadJSON(): void {
    // TODO: Implement JSON download
    console.log('Download JSON');
  }

  handleDownloadHTML(): void {
    const template = this.selectedTemplate();
    const form = this.invoiceForm();
    
    if (template?.html) {
      // Generate invoice HTML with replaced placeholders if form is available
      const html = form 
        ? this.templateService.generateInvoiceHtml(template.html)
        : template.html;
      
      const blob = new Blob([html], { type: 'text/html' });
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

  private async downloadAsPdf(): Promise<void> {
    const template = this.selectedTemplate();
    const form = this.invoiceForm();
    if (!template?.html) return;

    // Generate filled HTML if form exists, otherwise use raw template HTML.
    const html = form ? this.templateService.generateInvoiceHtml(template.html) : template.html;

    // Dynamically import to keep initial bundle smaller.
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    // Render in a hidden iframe so layout matches the preview iframe more closely
    // (fonts, viewport width, and CSS cascade are isolated).
    const A4_WIDTH_PX = 794; // ~210mm at 96dpi
    const A4_HEIGHT_PX = 1123; // ~297mm at 96dpi

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-10000px';
    iframe.style.top = '0';
    iframe.style.width = `${A4_WIDTH_PX}px`;
    iframe.style.height = `${A4_HEIGHT_PX}px`;
    iframe.style.border = '0';
    iframe.style.background = 'white';

    document.body.appendChild(iframe);

    const iframeLoaded = new Promise<void>((resolve) => {
      iframe.onload = () => resolve();
    });
    iframe.srcdoc = html;

    try {
      await iframeLoaded;

      const doc = iframe.contentDocument;
      const win = iframe.contentWindow;
      const target = doc?.body;
      if (!doc || !win || !target) return;

      // Wait for webfonts + images (prevents text reflow after capture).
      if (doc.fonts?.ready) await doc.fonts.ready;
      await Promise.all(
        Array.from(target.querySelectorAll('img'))
          .filter((img) => !img.complete)
          .map(
            (img) =>
              new Promise<void>((resolve) => {
                img.onload = () => resolve();
                img.onerror = () => resolve();
              })
          )
      );

      // Capture at an A4-like viewport size.
      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: A4_WIDTH_PX,
        windowHeight: A4_HEIGHT_PX,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidthMm = pdf.internal.pageSize.getWidth();
      const pageHeightMm = pdf.internal.pageSize.getHeight();

      // Slice the canvas into A4 pages to avoid alignment drift from "shifting" the same image.
      const pageHeightPx = Math.floor((canvas.width * pageHeightMm) / pageWidthMm);
      let renderedHeightPx = 0;

      while (renderedHeightPx < canvas.height) {
        const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedHeightPx);
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeightPx;

        const ctx = pageCanvas.getContext('2d');
        if (!ctx) break;

        ctx.drawImage(
          canvas,
          0,
          renderedHeightPx,
          canvas.width,
          sliceHeightPx,
          0,
          0,
          canvas.width,
          sliceHeightPx
        );

        const imgData = pageCanvas.toDataURL('image/jpeg', 1.0);
        const imgHeightMm = (sliceHeightPx * pageWidthMm) / canvas.width;

        if (renderedHeightPx > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, pageWidthMm, imgHeightMm);

        renderedHeightPx += sliceHeightPx;
      }

      pdf.save(`${template.name}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      document.body.removeChild(iframe);
    }
  }
}