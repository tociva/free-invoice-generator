import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  input,
  signal,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  TngButtonComponent,
  TngInputFieldComponent,
  TngTableCellTemplate,
  TngTableComponent,
  type TngTableColumn,
} from '@tailng-ui/components';
import { TngIcon } from '@tailng-ui/icons';
import { TngInput } from '@tailng-ui/primitives';
import { InvoiceItemForm } from '../store/models/invoice-form.model';

type InvoiceItemRow = FormGroup<InvoiceItemForm>;

@Component({
  selector: 'app-invoice-items',
  standalone: true,
  imports: [
    TngButtonComponent,
    TngInputFieldComponent,
    TngTableComponent,
    TngTableCellTemplate,
    TngInput,
    ReactiveFormsModule,
    TngIcon,
  ],
  templateUrl: './invoice-items.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./invoice-items.css'],
})
export class InvoiceItemsComponent {
  public InvoiceItemForm = input.required<FormArray<FormGroup<InvoiceItemForm>>>();
  advanced = input<boolean>(false);

  hasItemDescription = input<boolean>();
  hasItemDiscount = input<boolean>();
  selectedTaxOption = input<string>('');

  isMobile = signal(window.innerWidth <= 768);

  tableColumns = computed<readonly TngTableColumn<InvoiceItemRow>[]>(() => {
    const columns: TngTableColumn<InvoiceItemRow>[] = [
      { id: 'name', label: 'Item Name', width: '12rem' },
    ];

    if (this.advanced() && this.hasItemDescription()) {
      columns.push({ id: 'description', label: 'Description', width: '14rem' });
    }

    columns.push(
      { id: 'price', label: 'Price', align: 'end', width: '8rem' },
      { id: 'quantity', label: 'Qty', align: 'end', width: '7rem' },
      { id: 'itemTotal', label: 'Total', align: 'end', width: '8rem' },
    );

    if (this.advanced() && this.hasItemDiscount()) {
      columns.push(
        {
          id: 'discount',
          label: 'Discount',
          headerAlign: 'center',
          children: [
            { id: 'discPercentage', label: '%', align: 'end', width: '7rem' },
            { id: 'discountAmount', label: 'Value', align: 'end', width: '8rem' },
          ],
        },
        { id: 'subTotal', label: 'SubTotal', align: 'end', width: '8rem' },
      );
    }

    if (this.advanced()) {
      if (this.selectedTaxOption() === 'CGST & SGST') {
        columns.push(
          {
            id: 'cgst',
            label: 'CGST',
            headerAlign: 'center',
            children: [
              { id: 'tax1Percentage', label: '%', align: 'end', width: '7rem' },
              { id: 'tax1Amount', label: 'Value', align: 'end', width: '8rem' },
            ],
          },
          {
            id: 'sgst',
            label: 'SGST',
            headerAlign: 'center',
            children: [
              { id: 'tax2Percentage', label: '%', align: 'end', width: '7rem' },
              { id: 'tax2Amount', label: 'Value', align: 'end', width: '8rem' },
            ],
          },
        );
      }

      if (this.selectedTaxOption() === 'IGST') {
        columns.push({
          id: 'igst',
          label: 'IGST',
          headerAlign: 'center',
          children: [
            { id: 'tax3Percentage', label: '%', align: 'end', width: '7rem' },
            { id: 'tax3Amount', label: 'Value', align: 'end', width: '8rem' },
          ],
        });
      }

      if (this.selectedTaxOption() === 'IGST' || this.selectedTaxOption() === 'CGST & SGST') {
        columns.push({ id: 'taxTotal', label: 'Tax Total', align: 'end', width: '8rem' });
      }
    }

    if (this.advanced() && this.selectedTaxOption() !== 'Non Taxable') {
      columns.push({ id: 'grandTotal', label: 'Grand Total', align: 'end', width: '9rem' });
    }

    columns.push({ id: 'action', label: 'Action', align: 'center', width: '6rem' });

    return columns;
  });

  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth <= 768);
  }

  updateItemTotal(index: number) {
    const item = this.InvoiceItemForm().at(index);

    const price = item.get('price')?.value || 0;
    const qty = item.get('quantity')?.value || 0;
    const discPer = item.get('discPercentage')?.value || 0;

    const tax1Per = item.get('tax1Percentage')?.value || 0;
    const tax2Per = item.get('tax2Percentage')?.value || 0;
    const tax3Per = item.get('tax3Percentage')?.value || 0;

    const baseTotal = this.calculateBaseTotal(price, qty);
    const discountAmount = this.calculateDiscount(baseTotal, discPer);
    const itemTotal = this.calculateItemTotal(baseTotal, discountAmount);

    const taxes = this.calculateTaxTotal(itemTotal, tax1Per, tax2Per, tax3Per);
    const grandTotal = itemTotal + taxes.taxTotal;

    item.patchValue(
      {
        itemTotal: baseTotal,
        discountAmount,
        subTotal: itemTotal,
        tax1Amount: taxes.tax1Amount,
        tax2Amount: taxes.tax2Amount,
        tax3Amount: taxes.tax3Amount,
        taxTotal: taxes.taxTotal,
        grandTotal,
      },
      { emitEvent: true },
    );
  }
  private calculateBaseTotal(price: number, qty: number): number {
    return price * qty;
  }

  private calculateDiscount(amount: number, discPer: number): number {
    return (amount * discPer) / 100;
  }
  private calculateItemTotal(baseTotal: number, discountAmount: number): number {
    return this.hasItemDiscount() ? baseTotal - discountAmount : baseTotal;
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
