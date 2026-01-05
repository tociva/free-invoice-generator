import { Component, effect, output, signal, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

type InvoiceConfig = {
  currency: string;
  dateFormat: string;
};

type CurrencyOption = {
  code: string;
  name: string;
  symbol: string;
};

type DateFormatOption = {
  value: string;
  label: string;
};

@Component({
  selector: 'app-simple-invoice-config',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simple-invoice-config.html',
  styleUrls: ['./simple-invoice-config.css'],
})
export class SimpleInvoiceConfig {
  private elementRef = inject(ElementRef);

  config = signal<InvoiceConfig>({
    currency: 'INR',
    dateFormat: 'DD-MM-YYYY',
  });

  valueChange = output<InvoiceConfig>();

  // Dropdown states
  currencyDropdownOpen = signal(false);
  dateFormatDropdownOpen = signal(false);

  // Currency options
  currencies: CurrencyOption[] = [
    { code: 'USD', name: 'United States Dollar', symbol: '$' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'GBP', name: 'British Pound Sterling', symbol: '£' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  ];

  // Date format options
  dateFormats: DateFormatOption[] = [
    { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' },
    { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  ];

  constructor() {
    effect(() => {
      this.valueChange.emit(this.config());
    });
  }

  setCurrency(code: string) {
    this.config.update(c => ({ ...c, currency: code }));
    this.currencyDropdownOpen.set(false);
  }

  setDateFormat(fmt: string) {
    this.config.update(c => ({ ...c, dateFormat: fmt }));
    this.dateFormatDropdownOpen.set(false);
  }

  getSelectedCurrency(): CurrencyOption {
    return this.currencies.find(c => c.code === this.config().currency) || this.currencies[1];
  }

  getSelectedDateFormat(): DateFormatOption {
    return this.dateFormats.find(d => d.value === this.config().dateFormat) || this.dateFormats[0];
  }

  toggleCurrencyDropdown() {
    this.currencyDropdownOpen.update(v => !v);
    if (this.currencyDropdownOpen()) {
      this.dateFormatDropdownOpen.set(false);
    }
  }

  toggleDateFormatDropdown() {
    this.dateFormatDropdownOpen.update(v => !v);
    if (this.dateFormatDropdownOpen()) {
      this.currencyDropdownOpen.set(false);
    }
  }

  closeDropdowns() {
    this.currencyDropdownOpen.set(false);
    this.dateFormatDropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdowns();
    }
  }
}
