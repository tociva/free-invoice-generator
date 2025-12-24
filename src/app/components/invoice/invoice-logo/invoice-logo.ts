import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoice-logo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-logo.html',
  styleUrls: ['./invoice-logo.css'],
})
export class InvoiceLogoComponent {
  logoUrl: string | null = null;

  onLogoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoUrl = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
}
