import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
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
export class PreviewInvoiceComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedTemplate = input<TemplateItem | null>(null);
  invoiceForm = input<FormGroup<InvoiceForm> | null>(null);
  previewHtml = signal<SafeHtml | null>(null);
  previewScale = signal(1);

  readonly baseWidth = 794;
  readonly baseHeight = 1123;

  scaledWidth = computed(() => Math.round(this.baseWidth * this.previewScale()));
  scaledHeight = computed(() => Math.round(this.baseHeight * this.previewScale()));

  private templateService = inject(InvoiceTemplateService);
  private sanitizer = inject(DomSanitizer);
  private resizeObserver?: ResizeObserver;
  private previewViewportRef?: ElementRef<HTMLDivElement>;

  @ViewChild('previewViewport')
  set previewViewport(element: ElementRef<HTMLDivElement> | undefined) {
    if (!element) {
      this.resizeObserver?.disconnect();
      this.previewViewportRef = undefined;
      return;
    }

    this.previewViewportRef = element;
    this.startResizeObserver();
  }

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

  ngAfterViewInit(): void {
    this.startResizeObserver();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  updatePreview(): void {
    const template = this.selectedTemplate();
    const form = this.invoiceForm();
    
    if (template?.html && form) {
      // Generate invoice HTML by replacing placeholders with actual values
      let generatedHtml = this.templateService.generateInvoiceHtml(template.html, form);
      
      // Inject CSS to hide scrollbars and ensure proper display
      let htmlWithStyles = generatedHtml;
      const noScrollStyle = '<style>html, body { margin: 0; padding: 0; } body { overflow: auto; }</style>';
      
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
      const noScrollStyle = '<style>html, body { margin: 0; padding: 0; } body { overflow: auto; }</style>';
      
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
        ? this.templateService.generateInvoiceHtml(template.html, form)
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

  private startResizeObserver(): void {
    if (!this.previewViewportRef) return;

    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(() => this.updatePreviewScale());
    this.resizeObserver.observe(this.previewViewportRef.nativeElement);
    this.updatePreviewScale();
  }

  private updatePreviewScale(): void {
    const viewport = this.previewViewportRef?.nativeElement;
    if (!viewport) return;

    const { width, height } = viewport.getBoundingClientRect();
    if (width <= 0 || height <= 0) return;

    const scale = Math.min(1, width / this.baseWidth, height / this.baseHeight);
    this.previewScale.set(Number.isFinite(scale) && scale > 0 ? scale : 1);
  }

  private async downloadAsPdf(): Promise<void> {
    const template = this.selectedTemplate();
    const form = this.invoiceForm();
    if (!template?.html) return;

    // Generate filled HTML if form exists, otherwise use raw template HTML.
    const html = form ? this.templateService.generateInvoiceHtml(template.html, form) : template.html;

    // Dynamically import to keep initial bundle smaller.
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    const container = document.createElement('div');
    container.innerHTML = html;

    // Render off-screen like your old `TemplateUtil`.
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '800px';
    container.style.padding = '20px';
    container.style.background = 'white';
    container.style.zIndex = '-1';

    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 1) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${template.name}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      document.body.removeChild(container);
    }
  }
}
