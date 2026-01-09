import { Component, HostListener, input, signal, OnInit } from '@angular/core';
import { FileUpload } from '../../shared/file-upload/file-upload';
import { FormGroup } from '@angular/forms';
import { InvoiceForm } from '../store/models/invoice-form.model';

@Component({
  selector: 'app-invoice-logo',
  standalone: true,
  imports: [FileUpload],
  templateUrl: './invoice-logo.html',
})
export class InvoiceLogoComponent {
  isMobile = signal(window.innerWidth <= 768);
  uploadedImageUrl = signal<string | null>(null);
  loadingImage = signal(false);
  InvoiceLogo = input.required<FormGroup<InvoiceForm>>();

  advanced = input<boolean>(false);


  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth <= 768);
  }

  // ngOnInit(): void {
  //   const controlUrl = this.InvoiceLogo().get('smallLogo')?.value;
  //   if (controlUrl) {
  //     this.uploadedImageUrl.set(controlUrl);
  //   }
  // }

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
        // console.log('Uploaded image URL:', this.uploadedImageUrl());

        this.loadingImage.set(false);
        //  this.InvoiceLogo().get('smallLogo')?.setValue(result);
      }
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.uploadedImageUrl.set(null);

    // this.InvoiceLogo().get('smallLogo')?.setValue('');
  }
}

