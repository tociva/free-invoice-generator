import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  SecurityContext,
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
import { NgIcon } from '@ng-icons/core';
import { invoiceStore } from '../store/invoice.store';
import { TemplateUtil } from '../utils/templates.utils';
import { TemplateService } from '../store/services/template.services';
import { TemplateItem } from '../store/template/template.model';
import { templateStore } from '../store/template/template.store';
import { firstValueFrom, sample } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { sampleInvoice } from '../../list-templates/template.utils';

@Component({
  selector: 'app-preview-invoice',
  standalone: true,
  imports: [NgIcon],
  templateUrl: './preview-invoice.html',
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
  http = inject(HttpClient);

  updatePreview(): void {
    const template = this.selectedTemplate();
    const form = this.invoiceStore.invoice();
    if (template?.html && form) {
      this.renderPreviewHtml(template.html, form);
    }
  }
  // private async fetchTemplateHtml(path: string): Promise<string | null> {
  //   try {
  //     const templateHtml = await firstValueFrom(
  //       this.http.get(path, { responseType: 'text' })
  //     );
  //           console.log(templateHtml);

  //     return templateHtml || null;
      
  //   } catch (err) {
  //     console.error('Failed to fetch template:', err);
  //     return null;
  //   }
  // }

  // async updateTemplateView(){
  //   const path = this.templateStore.selectedTemplatePath();
  //     if (!path) return;
  //     console.log(path);
      

  //     const templateHtml = await this.fetchTemplateHtml(path);
  //     if (!templateHtml) return;

  //     this.renderPreviewHtml(templateHtml, sampleInvoice);

  // }
  private renderPreviewHtml(templateHtml: string, data: any): void {
    const filledHtml = TemplateUtil.fillTemplate(templateHtml, data);
    const safeHTML = this.templateService.createWrappedSafeHtml(filledHtml);
    this.previewHtml.set(safeHTML);
  }

  handlePrint(): void {
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  }

  handleDownloadPDF(): void {
    TemplateUtil.downloadTemplateAsPDF;
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

  handleDownloadHTML(): void {}

  handleViewCode(): void {
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
}
