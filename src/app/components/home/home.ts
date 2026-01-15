import { Component, HostListener, inject, signal } from '@angular/core';
import { provideAppIcon } from '../../provider/icon-provider';
import { NgIcon } from '@ng-icons/core';
import { Router } from '@angular/router';
import { FileUpload } from '../shared/file-upload/file-upload';
import { invoiceStore } from '../invoice/store/invoice.store';
import { Invoice } from '../invoice/store/models/invoice-model';

@Component({
  selector: 'app-home',
  imports: [NgIcon, FileUpload],
  templateUrl: './home.html',
  styleUrl: './home.css',
  providers: [],
})
export class Home {
  router = inject(Router);
  jsonFile= signal<string>('');
  store = inject(invoiceStore);
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
      this.successMessage.set('Upload JSON File Successfully!')
      this.clearMessageAfterDelay();
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
          const invoice: Invoice = JSON.parse(reader.result as string) as any;
          this.store.setInvoice(invoice);
          this.router.navigate(['/simple-invoice']);
        } catch (err) {
          console.error('Invalid JSON File', err);
        }
      };
      reader.readAsText(file);
    } else {
      console.error('Only JSON files are allowed.');
    }
  }
  private clearMessageAfterDelay(){
    setTimeout(()=>{
      this.errorMessage.set('');
      this.successMessage.set('');
    },3000);
  }
}
