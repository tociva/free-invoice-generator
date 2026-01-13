import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { provideAppIcon } from '../../../provider/icon-provider';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InvoiceItemForm } from '../store/models/invoice-form.model';
import { combineLatest, startWith, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoice-items',
  standalone: true,
  imports: [ReactiveFormsModule, NgIcon, CommonModule],
  templateUrl: './invoice-items.html',
  styleUrls: ['./invoice-items.css'],
  providers: [provideAppIcon()],
})
export class InvoiceItemsComponent implements OnInit {
  public InvoiceItemForm = input.required<FormArray<FormGroup<InvoiceItemForm>>>();
  advanced = input<boolean>(false);

  hasItemDescription = input<boolean>();
  hasItemDiscount = input<boolean>();
  selectedTaxOption = input<string>('');

  items = signal<any[]>([]);

  constructor() {}
  // Sync FormArray → signal
  ngOnInit(): void {
    this.items.set(this.InvoiceItemForm().getRawValue());

    this.InvoiceItemForm().valueChanges.subscribe(() => {
      this.items.set(this.InvoiceItemForm().getRawValue());
    });
  }

  updateItemTotal(index: number) {
    const item = this.InvoiceItemForm().at(index);

    const price = item.get('price')?.value || 0;
    const qty = item.get('quantity')?.value || 0;
    const discPer = item.get('discPercentage')?.value || 0;
    const subTotal = item.get('subTotal')?.value || 0;
    const tax1Per = item.get('tax1Percentage')?.value || 0;
    const tax2Per = item.get('tax2Percentage')?.value || 0;
    const tax3Per = item.get('tax3Percentage')?.value || 0;

    const baseTotal = this.calculateBaseTotal(price, qty);
    const discountAmount = this.calculateDiscount(baseTotal, discPer);
    const itemTotal = this.calculateItemTotal(baseTotal, discountAmount, subTotal);

    const taxes = this.calculateTaxTotal(itemTotal, tax1Per, tax2Per, tax3Per);
    const grandTotal = itemTotal + taxes.taxTotal;

    item.patchValue(
      {
        itemTotal : baseTotal,
        discountAmount,
        subTotal:itemTotal,
        tax1Amount: taxes.tax1Amount,
        tax2Amount: taxes.tax2Amount,
        tax3Amount: taxes.tax3Amount,
        taxTotal: taxes.taxTotal,
        grandTotal,
      },
      { emitEvent: true }
    );
  }
  private calculateBaseTotal(price: number, qty: number): number {
    return price * qty;
  }

  private calculateDiscount(amount: number, discPer: number): number {
    return (amount * discPer) / 100;
  }
  private calculateItemTotal(baseTotal: number, discountAmount: number, subTotal?: number): number {
    if (subTotal && subTotal > 0 && this.hasItemDiscount()) {
      return baseTotal - discountAmount;
    }

    return baseTotal;
  }

  private calculateTax(amount: number, taxPer: number): number {
    return (amount * taxPer) / 100;
  }

  private calculateTaxTotal(amount: number, tax1: number, tax2: number, tax3: number) {
    const tax1Amount = this.calculateTax(amount, tax1);
    const tax2Amount = this.calculateTax(amount, tax2);
    const tax3Amount = this.calculateTax(amount, tax3);

    return {
      tax1Amount,
      tax2Amount,
      tax3Amount,
      taxTotal: tax1Amount + tax2Amount + tax3Amount,
    };
  }

  addItem() {
    const newItem = this.createItemForm();
    this.InvoiceItemForm().push(newItem);
  }

  removeItem(index: number) {
    this.InvoiceItemForm().removeAt(index);
  }

  private createItemForm(): FormGroup<InvoiceItemForm> {
    return new FormGroup<InvoiceItemForm>({
      name: new FormControl('', {
        nonNullable: true,
      }),

      description: new FormControl<string | null>(null),

      quantity: new FormControl(1, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),

      price: new FormControl(0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0)],
      }),

      itemTotal: new FormControl(0, { nonNullable: true }),

      discountAmount: new FormControl(0, {
        nonNullable: true,
        validators: [Validators.min(0)],
      }),

      discPercentage: new FormControl(0, {
        nonNullable: true,
        validators: [Validators.min(0), Validators.max(100)],
      }),

      subTotal: new FormControl(0, { nonNullable: true }),

      tax1Amount: new FormControl(0, { nonNullable: true }),
      tax1Percentage: new FormControl(0, {
        nonNullable: true,
        validators: [Validators.min(0), Validators.max(100)],
      }),

      tax2Amount: new FormControl(0, { nonNullable: true }),
      tax2Percentage: new FormControl(0, {
        nonNullable: true,
        validators: [Validators.min(0), Validators.max(100)],
      }),

      tax3Amount: new FormControl(0, { nonNullable: true }),
      tax3Percentage: new FormControl(0, {
        nonNullable: true,
        validators: [Validators.min(0), Validators.max(100)],
      }),

      taxTotal: new FormControl(0, { nonNullable: true }),
      grandTotal: new FormControl(0, { nonNullable: true }),
    });
  }
}
