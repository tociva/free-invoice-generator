import { Component, effect, output, signal } from '@angular/core';

type InvoiceConfig = {
  currency: string;
  dateFormat: string;
};

@Component({
  selector: 'app-simple-invoice-config',
  standalone: true,
  templateUrl: './simple-invoice-config.html',
  styleUrls: ['./simple-invoice-config.css'],
})
export class SimpleInvoiceConfig {
  config = signal<InvoiceConfig>({
    currency: 'INR',
    dateFormat: 'DD-MM-YYYY',
  });

  valueChange = output<InvoiceConfig>();

  constructor() {
    effect(() => {
      this.valueChange.emit(this.config());
    });
  }

  setCurrency(code: string) {
    this.config.update(c => ({ ...c, currency: code }));
  }

  setDateFormat(fmt: string) {
    this.config.update(c => ({ ...c, dateFormat: fmt }));
  }
}
