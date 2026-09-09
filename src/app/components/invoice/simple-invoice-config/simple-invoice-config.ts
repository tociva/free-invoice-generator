import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TailngSelect } from '../../shared/tailng-select';
import { Currency } from '../store/currency/currency.model';
import { currencyStore } from '../store/currency/currency.store';
import { DateFormat } from '../store/date-format/date-format.model';
import { dateFormatStore } from '../store/date-format/date-format.store';
import { InvoiceForm } from '../store/models/invoice-form.model';

@Component({
  selector: 'app-simple-invoice-config',
  standalone: true,
  imports: [TailngSelect, ReactiveFormsModule],
  templateUrl: './simple-invoice-config.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./simple-invoice-config.css'],
})
export class SimpleInvoiceConfig implements OnInit {
  private elementRef = inject(ElementRef);
  public currencyStore = inject(currencyStore);
  public dateFormatStore = inject(dateFormatStore);

  InvoiceConfiq = input.required<FormGroup<InvoiceForm>>();
  ngOnInit() {
    this.currencyStore.loadCurrency();
    this.dateFormatStore.loadDateFormat();
  }

  currencyDropdownOpen = signal(false);
  dateFormatDropdownOpen = signal(false);

  setCurrency(currency: Currency) {
    const currencyCtrl = this.InvoiceConfiq().get('currency') as FormGroup;
    if (!currencyCtrl) return;
    currencyCtrl.setValue(currency);
    this.currencyDropdownOpen.set(false);
  }

  setDateFormat(dateFormat: DateFormat) {
    this.InvoiceConfiq().get('dateFormat')?.setValue(dateFormat);
    this.dateFormatDropdownOpen.set(false);
  }

  toggleCurrencyDropdown() {
    this.currencyDropdownOpen.update((v) => !v);
    if (this.currencyDropdownOpen()) {
      this.dateFormatDropdownOpen.set(false);
    }
  }

  toggleDateFormatDropdown() {
    this.dateFormatDropdownOpen.update((v) => !v);
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
