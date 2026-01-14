import { Component, computed, inject } from '@angular/core';
import { invoiceStore } from '../store/invoice.store';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-testing',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './testing.html',
})
export class Testing {
  store = inject(invoiceStore);

  invoice =this.store.invoice
}
