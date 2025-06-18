import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';

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

  constructor(private router: Router) {}

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
        // You can optionally parse and store JSON here if needed
        // const invoiceData = JSON.parse(reader.result as string);
        void this.router.navigate(['/invoice'], { queryParams: { step: 3 } });
      };
      reader.readAsText(file);
    } else {
      // eslint-disable-next-line no-alert
      alert('Only JSON files are allowed.');
    }
  }

  clearJsonFile(): void {
    this.jsonFileName = null;
  }
}
