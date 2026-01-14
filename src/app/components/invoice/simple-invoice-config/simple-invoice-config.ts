import { Component, signal, HostListener, ElementRef, inject, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InvoiceForm } from '../store/models/invoice-form.model';
import { currencyStore } from '../store/currency/currency.store';
import { NgIcon } from '@ng-icons/core';
import { dateFormatStore } from '../store/date-format/date-format.store';
import { Currency } from '../store/currency/currency.model';
import { DateFormat } from '../store/date-format/date-format.model';

@Component({
  selector: 'app-simple-invoice-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIcon],
  templateUrl: './simple-invoice-config.html',
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

  setDateFormat(dateFormat : DateFormat){
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
