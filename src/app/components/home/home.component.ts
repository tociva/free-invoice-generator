import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { InvoiceState } from '../invoice/store/state/invoice.state';
import { Invoice } from '../invoice/store/model/invoice.model';
import { loadInvoice } from '../invoice/store/actions/invoice.action';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIcon],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  isJsonDragOver = false;
  jsonFileName: string | null = null;

  constructor(private router: Router, private store: Store<InvoiceState>) {}

  goToInvoiceCreator(): void {
    void this.router.navigate(['/invoice'], { queryParams: { step: 0 } });
  }

  onJsonDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isJsonDragOver = true;
  }

  onJsonDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isJsonDragOver = false;
  }

  onJsonDrop(event: DragEvent): void {
    event.preventDefault();
    this.isJsonDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        this.handleJsonFile(file);
      } else {
        // eslint-disable-next-line no-alert
        alert('Only JSON files are allowed.');
      }
    }
  }

  onJsonSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.handleJsonFile(file);
    }
  }

  handleJsonFile(file: File): void {
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      this.jsonFileName = file.name;
  
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const invoice:Invoice = JSON.parse(reader.result as string);
  
          this.store.dispatch(loadInvoice({ invoice }));
          void this.router.navigate(['/invoice'], { queryParams: { step: 3 } });
        } catch (err) {
          console.error('Invalid JSON file:', err);
        }
      };
      reader.readAsText(file);
    } else {
      console.error('Only JSON files are allowed.');
    }
  }
  

  clearJsonFile(): void {
    this.jsonFileName = null;
  }
}
