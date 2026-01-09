import { Component, effect, input, OnDestroy } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { provideAppIcon } from '../../../provider/icon-provider';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InvoiceItemForm } from '../store/models/invoice-form.model';
import { combineLatest, startWith, Subscription } from 'rxjs';

@Component({
  selector: 'app-invoice-items',
  standalone: true,
  imports: [ReactiveFormsModule, NgIcon],
  templateUrl: './invoice-items.html',
  styleUrls: ['./invoice-items.css'],
  providers: [provideAppIcon()],
})
export class InvoiceItemsComponent implements OnDestroy {

  public InvoiceItemForm = input.required<FormArray<FormGroup<InvoiceItemForm>>>();

  advanced = input<boolean>(false);
  
  
  constructor() {
  effect(() => {
    const items = this.InvoiceItemForm();
    items.controls.forEach(item => {
      if (!this.itemSubscriptions.has(item)) {
        this.subscribeToItem(item);
      }
    });
  });
}
  

  addItem() {
    const newItem = this.createItemForm();
    this.InvoiceItemForm().push(newItem);
    this.subscribeToItem(newItem);
  }

  removeItem(index: number) {
    const item = this.InvoiceItemForm().at(index);
    this.unsubscribeItem(item);
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
private itemSubscriptions = new Map<FormGroup<InvoiceItemForm>, Subscription>();


 private subscribeToItem(item: FormGroup<InvoiceItemForm>) {
  const sub = combineLatest([
    item.controls.quantity.valueChanges.pipe(startWith(item.controls.quantity.value)),
    item.controls.price.valueChanges.pipe(startWith(item.controls.price.value)),
  ]).subscribe(([qty, price]) => {
    item.controls.itemTotal.setValue(qty * price, { emitEvent: false });
  });
  this.itemSubscriptions.set(item, sub);
}


 private unsubscribeItem(item: FormGroup<InvoiceItemForm>) {
  this.itemSubscriptions.get(item)?.unsubscribe();
  this.itemSubscriptions.delete(item);
}


ngOnDestroy() {
  this.itemSubscriptions.forEach(sub => sub.unsubscribe());
}

}
