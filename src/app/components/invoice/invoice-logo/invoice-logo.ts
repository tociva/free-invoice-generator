import { ChangeDetectionStrategy, Component, effect, input, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TngButtonComponent } from '@tailng-ui/components';
import {
  TngFileUploadDirective,
  type TngFileUploadRejectedEvent,
  type TngFileUploadSelectedEvent,
} from '@tailng-ui/primitives';
import { InvoiceForm } from '../store/models/invoice-form.model';

@Component({
  selector: 'app-invoice-logo',
  standalone: true,
  imports: [TngButtonComponent, TngFileUploadDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './invoice-logo.html',
  styleUrl: './invoice-logo.css',
})
export class InvoiceLogoComponent {
  uploadedImageUrl = signal<string | null>(null);
  loadingImage = signal(false);
  InvoiceLogo = input.required<FormGroup<InvoiceForm>>();
  logoField = input<'smallLogo' | 'largeLogo'>('smallLogo');

  advanced = input<boolean>(false);

  eff = effect(() => {
    const value = this.InvoiceLogo()?.get(this.logoField())?.value;
    this.uploadedImageUrl.set(value || null);
  });

  ngOnInit(): void {
    const controlUrl = this.InvoiceLogo().get(this.logoField())?.value;
    if (controlUrl) {
      this.uploadedImageUrl.set(controlUrl);
    }
  }

  public onFilesSelected(event: TngFileUploadSelectedEvent) {
    const file = event.files[0];
    if (file) {
      this.onFilesReceived(file);
    }
  }

  public onFilesRejected(event: TngFileUploadRejectedEvent) {
    const rejected = event.rejected[0];
    if (rejected) {
      console.warn(rejected.message);
    }
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
    if (!file.type.startsWith('image/')) {
      console.warn('Unsupported file type:', file.type);
      return;
    }

    this.loadingImage.set(true);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (result && typeof result === 'string') {
        this.uploadedImageUrl.set(result);
        this.InvoiceLogo()?.get(this.logoField())?.setValue(result);
      }
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.uploadedImageUrl.set(null);
    this.InvoiceLogo().get(this.logoField())?.setValue('');
  }
}
