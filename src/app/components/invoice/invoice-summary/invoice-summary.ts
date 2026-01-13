import { Component, effect, input, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InvoiceForm } from '../store/models/invoice-form.model';

@Component({
  selector: 'app-invoice-summary',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './invoice-summary.html',
  styleUrls: ['./invoice-summary.css'],
})
export class InvoiceSummaryComponent implements OnInit {

  InvoiceSummary = input.required<FormGroup<InvoiceForm>>();

  advanced = input<boolean>(false);
  hasItemDiscount = input<boolean>();
  selectedTaxOption = input<string>('');
 
  


  @Input() totalAmount: number = 300000;
  internationalNumbering: boolean = true;
  roundOff: number = 0;
  currency: string = '₹';
  currencyCode: string = 'INR';

  internationalNumberingSig: WritableSignal<boolean> = signal(this.internationalNumbering);
  roundOffSig: WritableSignal<number> = signal(this.roundOff);

  constructor() {
   
  }

  ngOnInit(): void {
    
  }

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
