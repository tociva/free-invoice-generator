import { setInvoiceLargeLogo, setInvoiceSmallLogo } from '../store/actions/invoice.action';
import { CreateInvoiceItemsComponent } from './create-invoice-items.component';


export class CreateInvoiceLogoComponent extends CreateInvoiceItemsComponent {

  smallLogoPreviewUrl: string | null = null;
  largeLogoPreviewUrl: string | null = null;
  isLargeLogoDragOver = false;
  isSmallLogoDragOver = false;
  


  private handleSmallLogo(file: File): void {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.smallLogoPreviewUrl = reader.result as string;
        this.store.dispatch(setInvoiceSmallLogo({ smallLogo: this.smallLogoPreviewUrl }));
      };
      reader.readAsDataURL(file);
    } else {
      console.warn('Unsupported small logo type:', file.type);
    }
  }

  private handleLargeLogo(file: File): void {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.largeLogoPreviewUrl = reader.result as string;
        this.store.dispatch(setInvoiceLargeLogo({ largeLogo: this.largeLogoPreviewUrl }));
      };
      reader.readAsDataURL(file);
    } else {
      console.warn('Unsupported large logo type:', file.type);
    }
  }
  onSmallLogoDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isSmallLogoDragOver = true;
  }

  onSmallLogoDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isSmallLogoDragOver = false;
  }

  onSmallLogoDrop(event: DragEvent): void {
    event.preventDefault();
    this.isSmallLogoDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleSmallLogo(files[0]);
    }
  }

  onSmallLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.handleSmallLogo(files[0]);
      input.value = '';
    }
  }


  onLargeLogoDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isLargeLogoDragOver = true;
  }
  onLargeLogoDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isLargeLogoDragOver = false;
  }

  onLargeLogoDrop(event: DragEvent): void {
    event.preventDefault();
    this.isLargeLogoDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleLargeLogo(files[0]);
    }
  }

  onLargeLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.handleLargeLogo(files[0]);
      input.value = '';
    }
  }
  clearSmallLogo(): void {
    this.smallLogoPreviewUrl = null;
    this.store.dispatch(setInvoiceSmallLogo({ smallLogo: '' }));
  }

  clearLargeLogo(): void {
    this.largeLogoPreviewUrl = null;
    this.store.dispatch(setInvoiceLargeLogo({ largeLogo: '' }));
  }

}