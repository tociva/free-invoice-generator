import { TngButtonComponent, TngCardComponent } from '@tailng-ui/components';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
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
import { SafeHtml } from '@angular/platform-browser';
import { TngIcon } from '@tailng-ui/icons';
import { invoiceStore } from '../store/invoice.store';
import { Invoice } from '../store/models/invoice-model';
import { TemplateService } from '../store/services/template.services';
import { TemplateItem } from '../store/template/template.model';
import { templateStore } from '../store/template/template.store';
import { TemplateUtil } from '../utils/templates.utils';

@Component({
  selector: 'app-preview-invoice',
  standalone: true,
  imports: [TngCardComponent, TngButtonComponent, TngIcon],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './preview-invoice.html',
  styleUrl: './preview-invoice.css',
})
export class PreviewInvoiceComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedTemplate = input<TemplateItem | null>(null);
  previewHtml = signal<SafeHtml | null>(null);
  previewScale = signal(1);
  readonly baseWidth = 794;
  readonly baseHeight = 1123;

  scaledWidth = computed(() => Math.round(this.baseWidth * this.previewScale()));
  scaledHeight = computed(() => Math.round(this.baseHeight * this.previewScale()));

  private templateService = inject(TemplateService);
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
  ngOnInit(): void {}
  constructor() {
    effect(() => {
      this.updatePreview();
      // this.updateTemplateView();
    });
  }

  ngAfterViewInit(): void {
    this.startResizeObserver();
    // this.updatePreview();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  templateStore = inject(templateStore);
  invoiceStore = inject(invoiceStore);

  updatePreview(): void {
    const template = this.selectedTemplate();
    const form = this.invoiceStore.invoice();
    if (template?.html && form) {
      this.renderPreviewHtml(template.html, form);
    }
  }
  private renderPreviewHtml(templateHtml: string, data: Invoice): void {
    const filledHtml = TemplateUtil.fillTemplate(templateHtml, data);
    const safeHTML = this.templateService.createWrappedSafeHtml(filledHtml);
    this.previewHtml.set(safeHTML);
  }

  handlePrint(): void {
    const iframe = this.previewViewportRef?.nativeElement.querySelector(
      'iframe',
    ) as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  }

  handleDownloadPDF(item: TemplateItem | null): void {
    if (!item?.safeHTML) return;
    TemplateUtil.downloadTemplateAsPDF({
      ...item,
      html: TemplateUtil.fillTemplate(item.html ?? '', this.invoiceStore.invoice()),
    });
  }

  handleDownloadJSON(): void {
    const invoiceData = this.invoiceStore.invoice();
    if (!invoiceData) return;
    const blob = new Blob([JSON.stringify(invoiceData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'invoice.json';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  handleDownloadHTML(item: TemplateItem | null): void {
    if (!item?.safeHTML) return;
    TemplateUtil.downloadTemplateAsHTML({
      ...item,
      html: TemplateUtil.fillTemplate(item.html ?? '', this.invoiceStore.invoice()),
    });
  }

  handleViewCode(): void {
    const template = this.selectedTemplate();
    const blob = new Blob([template?.html || ''], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${template?.name || 'template'}.html`;
    a.click();

    window.URL.revokeObjectURL(url);
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
}
