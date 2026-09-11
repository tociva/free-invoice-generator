import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TngIcon } from '@tailng-ui/icons';
import {
  TngFileUploadDirective,
  type TngFileUploadRejectedEvent,
  type TngFileUploadSelectedEvent,
} from '@tailng-ui/primitives';
import { invoiceStore } from '../invoice/store/invoice.store';
import { InvoiceFormService } from '../invoice/store/models/invoice-form';
import { parseInvoiceJson } from '../invoice/store/models/invoice-import';

@Component({
  selector: 'app-home',
  imports: [TngIcon, TngFileUploadDirective],
  templateUrl: './home.html',
  styleUrl: './home.css',
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

  public onFilesSelected(event: TngFileUploadSelectedEvent) {
    const file = event.files[0];
    if (file) {
      this.onFilesReceived(file);
    }
  }

  public onFilesRejected(event: TngFileUploadRejectedEvent) {
    const rejected = event.rejected[0];
    this.successMessage.set('');
    this.errorMessage.set(rejected?.message ?? 'Invalid JSON File!');
    this.clearMessageAfterDelay();
  }

  public onFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.onFilesReceived(file);
    }
    input.value = '';
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
