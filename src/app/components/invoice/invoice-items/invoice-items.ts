import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface InvoiceItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

@Component({
  selector: 'app-invoice-items',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-items.html',
  styleUrls: ['./invoice-items.css'],
})
export class InvoiceItemsComponent implements OnInit {
  items: InvoiceItem[] = [
    { id: '1', name: 'Web Development', price: 100000, qty: 1 },
    { id: '2', name: 'Android App Development', price: 200000, qty: 1 },
  ];

  ngOnInit(): void {}

  addItem(): void {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      qty: 1,
    };
    this.items.push(newItem);
  }

  removeItem(id: string): void {
    this.items = this.items.filter((item) => item.id !== id);
  }

  getItemTotal(item: InvoiceItem): number {
    return item.price * item.qty;
  }

  getTotalAmount(): number {
    return this.items.reduce((sum, item) => sum + this.getItemTotal(item), 0);
  }
}
