import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-invoice-summary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-summary.html',
  styleUrls: ['./invoice-summary.css'],
})
export class InvoiceSummaryComponent implements OnInit {
  @Input() totalAmount: number = 300000;

  internationalNumbering: boolean = true;
  roundOff: number = 0;
  currency: string = '₹';
  currencyCode: string = 'INR';

  ngOnInit(): void {}

  getGrandTotal(): number {
    return this.totalAmount + this.roundOff;
  }

  getAmountInWords(amount: number): string {
    // Simple conversion - can be enhanced
    const words: { [key: number]: string } = {
      100000: 'One Hundred Thousand',
      200000: 'Two Hundred Thousand',
      300000: 'Three Hundred Thousand',
      500000: 'Five Hundred Thousand',
      1000000: 'One Million',
    };
    return words[amount] || amount.toString();
  }
}
