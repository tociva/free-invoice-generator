import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { TngButtonComponent } from '@tailng-ui/components';
import { invoiceStore } from '../invoice/store/invoice.store';
import { InvoiceFormService } from '../invoice/store/models/invoice-form';
import { parseInvoiceJson } from '../invoice/store/models/invoice-import';
import { FileUpload } from '../shared/file-upload/file-upload';

@Component({
  selector: 'app-home',
  imports: [TngButtonComponent, NgIcon, FileUpload],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [],
})
export class Home {
  router = inject(Router);
  jsonFile = signal<string>('');
  store = inject(invoiceStore);
  private readonly invoiceForm = inject(InvoiceFormService);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  goToInvoiceCreator = () => {
    this.router.navigate(['/simple-invoice']);
  };
  isMobile = signal(window.innerWidth <= 768);
  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth <= 768);
  }
  public onFilesReceived(file: File) {
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      this.handleJsonFile(file);
    } else {
      this.errorMessage.set('Invalid JSON File!');
      this.clearMessageAfterDelay();
    }
  }
  handleJsonFile(file: File): void {
    if (file.type == 'application/json' || file.name.endsWith('.json')) {
      this.jsonFile.set(file.name);

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const invoice = parseInvoiceJson(String(reader.result ?? ''));
          this.invoiceForm.replaceInvoice(invoice);
          this.store.setInvoice(invoice);
          this.errorMessage.set('');
          this.successMessage.set('Invoice imported successfully.');
          this.router.navigate(['/simple-invoice']);
        } catch (err) {
          this.successMessage.set('');
          this.errorMessage.set(
            err instanceof Error ? err.message : 'Could not import this invoice.',
          );
        }
      };
      reader.onerror = () => this.errorMessage.set('Could not read the selected file.');
      reader.readAsText(file);
    } else {
      console.error('Only JSON files are allowed.');
    }
  }
  private clearMessageAfterDelay() {
    setTimeout(() => {
      this.errorMessage.set('');
      this.successMessage.set('');
    }, 3000);
  }
}
