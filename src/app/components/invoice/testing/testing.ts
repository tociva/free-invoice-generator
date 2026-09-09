import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { invoiceStore } from '../store/invoice.store';

@Component({
  selector: 'app-testing',
  standalone: true,
  imports: [JsonPipe],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './testing.html',
})
export class Testing {
  store = inject(invoiceStore);

  invoice = this.store.invoice;
}
