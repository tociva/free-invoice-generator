import { setInvoiceLargeLogo, setInvoiceSmallLogo } from '../store/actions/invoice.action';
import { CreateInvoiceItemsComponent } from './create-invoice-items.component';


export class CreateInvoiceLogoComponent extends CreateInvoiceItemsComponent {

  smallLogoPreviewUrl: string | null = null;
  largeLogoPreviewUrl: string | null = null;

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
  // eslint-disable-next-line class-methods-use-this
  onSmallLogoDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onSmallLogoDrop(event: DragEvent): void {
    event.preventDefault();
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

  // eslint-disable-next-line class-methods-use-this
  onLargeLogoDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onLargeLogoDrop(event: DragEvent): void {
    event.preventDefault();
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
}