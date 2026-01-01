import { Component, EventEmitter, HostListener, Output, signal } from '@angular/core';
import { FileUpload } from '../../shared/file-upload/file-upload';

@Component({
  selector: 'app-invoice-logo',
  standalone: true,
  imports: [FileUpload],
  templateUrl: './invoice-logo.html',
})
export class InvoiceLogoComponent {

   isMobile = signal(window.innerWidth <= 768);
  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth <= 768);
  }

  logoUrl: string | null = null;

  @Output() logoChange = new EventEmitter<string | null>();

  onLogoUpload(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const reader = new FileReader();

      reader.onload = () => {
        this.logoUrl = reader.result as string;

        // 🔹 Log the loaded image data
        console.log('Child: logo loaded', this.logoUrl);

        // 🔹 Emit to parent
        this.logoChange.emit(this.logoUrl);

        // 🔹 Log after emit
        console.log('Child: logoChange emitted');
      };

      reader.readAsDataURL(input.files[0]);
    } else {
      console.log('Child: no file selected');
    }
  }

  removeLogo() {
    this.logoUrl = null;
    this.logoChange.emit(null);
  }
}
