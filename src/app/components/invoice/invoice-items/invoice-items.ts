import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { provideAppIcon } from '../../../provider/icon-provider';

interface InvoiceItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

@Component({
  selector: 'app-invoice-items',
  standalone: true,
  imports: [CommonModule,NgIcon],
  templateUrl: './invoice-items.html',
  styleUrls: ['./invoice-items.css'],
  providers:[provideAppIcon()],
})
export class InvoiceItemsComponent implements OnInit {
  items: WritableSignal<InvoiceItem[]> = signal([
    { id: '1', name: 'Web Development', price: 100000, qty: 1 },
    { id: '2', name: 'Android App Development', price: 200000, qty: 1 },
  ]);

  ngOnInit(): void {}

  addItem(): void {
    const newItem: InvoiceItem = { id: Date.now().toString(), name: '', price: 0, qty: 1 };
    this.items.update((arr) => [...arr, newItem]);
  }

  removeItem(id: string): void {
    this.items.update((arr) => arr.filter((item) => item.id !== id));
  }

  getItemTotal(item: InvoiceItem): number {
    return item.price * item.qty;
  }

  getTotalAmount(): number {
    return this.items().reduce((sum, item) => sum + this.getItemTotal(item), 0);
  }

  updateItemField(id: string, field: keyof InvoiceItem, value: any) {
    this.items.update((arr) => arr.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  }
}
