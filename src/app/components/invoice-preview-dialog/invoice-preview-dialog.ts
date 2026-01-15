import { Component, input, output, model, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgIcon } from '@ng-icons/core';

export interface InvoicePreviewDialogData {
  invoiceHtml?: string;
  invoiceTitle?: string;
  templateName?: string;
}

@Component({
  selector: 'app-invoice-preview-dialog',
  standalone: true,
  imports: [CommonModule,NgIcon],
  templateUrl: './invoice-preview-dialog.html',
  styleUrls: ['./invoice-preview-dialog.css'],
})
export class InvoicePreviewDialogComponent {
  // Two-way binding for dialog open state
  isOpen = model<boolean>(false);

  // Inputs
  invoiceHtml = input<string | null>(null);
  invoiceTitle = input<string>('Invoice Preview');
  templateName = input<string>('');

  // Outputs
  download = output<void>();
  print = output<void>();

  // Internal signals
  safeHtml = signal<SafeHtml | null>(null);

  constructor(private sanitizer: DomSanitizer) {
    // Update safe HTML when invoiceHtml changes
    effect(() => {
      const html = this.invoiceHtml();
      if (html) {
        this.safeHtml.set(this.sanitizer.bypassSecurityTrustHtml(html));
      } else {
        this.safeHtml.set(null);
      }
    });
  }

  onClose(): void {
    this.isOpen.set(false);
  }

  onDownload(): void {
    this.download.emit();
  }

  onPrint(): void {
    this.print.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    // Close if clicking on backdrop (not the dialog content)
    if ((event.target as HTMLElement).classList.contains('dialog-backdrop')) {
      this.onClose();
    }
  }
}

