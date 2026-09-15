import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  TngButtonComponent,
  TngCardComponent,
  TngInputFieldComponent,
  TngTableCellTemplate,
  TngTableHeaderTemplate,
  TngTableComponent,
  type TngTableColumn,
} from '@tailng-ui/components';
import { TngIcon } from '@tailng-ui/icons';
import { TngInput } from '@tailng-ui/primitives';
import { InvoiceItemForm } from '../store/models/invoice-form.model';
import { InvoiceCalculationService } from '../store/services/calculation.services';

type InvoiceItemRow = FormGroup<InvoiceItemForm>;

@Component({
  selector: 'app-invoice-items',
  standalone: true,
  imports: [
    TngButtonComponent,
    TngCardComponent,
    TngInputFieldComponent,
    TngTableComponent,
    TngTableCellTemplate,
    TngTableHeaderTemplate,
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
  public invoiceService = inject(InvoiceCalculationService);

  tableColumns = computed<readonly TngTableColumn<InvoiceItemRow>[]>(() => {
    const isAdv = this.advanced();
    const isDiscount = isAdv && !!this.hasItemDiscount();
    const taxOption = isAdv ? this.selectedTaxOption() : 'Non Taxable';

    if (taxOption === 'CGST & SGST') {
      if (isDiscount) {
        return [
          { id: 'index', label: '#', width: '3.5%', align: 'center' },
          { id: 'item', label: 'Item', width: '20.5%' },
          { id: 'price', label: 'Price', align: 'end', width: '8.5%' },
          { id: 'quantity', label: 'Quantity', align: 'end', width: '11%' },
          { id: 'discount', label: 'Discount', align: 'end', width: '10.5%' },
          { id: 'subTotal', label: 'Taxable Amount', align: 'end', width: '10%' },
          { id: 'cgst', label: 'CGST', align: 'end', width: '9.5%' },
          { id: 'sgst', label: 'SGST', align: 'end', width: '9.5%' },
          { id: 'grandTotal', label: 'Grand Total', align: 'end', width: '11%' },
          { id: 'action', label: 'Action', width: '6%', align: 'center' },
        ];
      } else {
        return [
          { id: 'index', label: '#', width: '3.5%', align: 'center' },
          { id: 'item', label: 'Item', width: '26%' },
          { id: 'price', label: 'Price', align: 'end', width: '9%' },
          { id: 'quantity', label: 'Quantity', align: 'end', width: '13%' },
          { id: 'subTotal', label: 'Taxable Amount', align: 'end', width: '11%' },
          { id: 'cgst', label: 'CGST', align: 'end', width: '10.5%' },
          { id: 'sgst', label: 'SGST', align: 'end', width: '10.5%' },
          { id: 'grandTotal', label: 'Grand Total', align: 'end', width: '10.5%' },
          { id: 'action', label: 'Action', width: '6%', align: 'center' },
        ];
      }
    }

    if (taxOption === 'IGST') {
      if (isDiscount) {
        return [
          { id: 'index', label: '#', width: '3.5%', align: 'center' },
          { id: 'item', label: 'Item', width: '21%' },
          { id: 'price', label: 'Price', align: 'end', width: '8.5%' },
          { id: 'quantity', label: 'Quantity', align: 'end', width: '11.5%' },
          { id: 'discount', label: 'Discount', align: 'end', width: '11%' },
          { id: 'subTotal', label: 'Taxable Amount', align: 'end', width: '11.5%' },
          { id: 'igst', label: 'IGST', align: 'end', width: '13.5%' },
          { id: 'grandTotal', label: 'Grand Total', align: 'end', width: '13.5%' },
          { id: 'action', label: 'Action', width: '6%', align: 'center' },
        ];
      } else {
        return [
          { id: 'index', label: '#', width: '3.5%', align: 'center' },
          { id: 'item', label: 'Item', width: '27%' },
          { id: 'price', label: 'Price', align: 'end', width: '9.5%' },
          { id: 'quantity', label: 'Quantity', align: 'end', width: '14%' },
          { id: 'subTotal', label: 'Taxable Amount', align: 'end', width: '13%' },
          { id: 'igst', label: 'IGST', align: 'end', width: '13.5%' },
          { id: 'grandTotal', label: 'Grand Total', align: 'end', width: '13.5%' },
          { id: 'action', label: 'Action', width: '6%', align: 'center' },
        ];
      }
    }

    // Non Taxable (Simple invoice or Advanced with Non Taxable)
    if (isDiscount) {
      return [
        { id: 'index', label: '#', width: '4%', align: 'center' },
        { id: 'item', label: 'Item', width: '34%' },
        { id: 'price', label: 'Price', align: 'end', width: '12%' },
        { id: 'quantity', label: 'Quantity', align: 'end', width: '15%' },
        { id: 'discount', label: 'Discount', align: 'end', width: '15%' },
        { id: 'subTotal', label: 'Total', align: 'end', width: '14%' },
        { id: 'action', label: 'Action', width: '6%', align: 'center' },
      ];
    }

    return [
      { id: 'index', label: '#', width: '4%', align: 'center' },
      { id: 'item', label: 'Item', width: '44%' },
      { id: 'price', label: 'Price', align: 'end', width: '15%' },
      { id: 'quantity', label: 'Quantity', align: 'end', width: '15%' },
      { id: 'subTotal', label: 'Total', align: 'end', width: '16%' },
      { id: 'action', label: 'Action', width: '6%', align: 'center' },
    ];
  });

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(window.innerWidth <= 768);
  }

  addItem(): void {
    const item = new FormGroup<InvoiceItemForm>({
      name: new FormControl<string>('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      description: new FormControl<string>(''),
      quantity: new FormControl<number>(1, {
        validators: [Validators.required, Validators.min(1)],
        nonNullable: true,
      }),
      price: new FormControl<number>(0, {
        validators: [Validators.required, Validators.min(0)],
        nonNullable: true,
      }),
      itemTotal: new FormControl<number>(0, { nonNullable: true }),
      subTotal: new FormControl<number>(0, { nonNullable: true }),
      taxTotal: new FormControl<number>(0, { nonNullable: true }),
      grandTotal: new FormControl<number>(0, { nonNullable: true }),
      discPercentage: new FormControl<number>(0, {
        validators: [Validators.min(0), Validators.max(100)],
        nonNullable: true,
      }),
      discountAmount: new FormControl<number>(0, {
        validators: [Validators.min(0)],
        nonNullable: true,
      }),
      tax1Percentage: new FormControl<number>(0, {
        validators: [Validators.min(0), Validators.max(100)],
        nonNullable: true,
      }),
      tax1Amount: new FormControl<number>(0, {
        validators: [Validators.min(0)],
        nonNullable: true,
      }),
      tax2Percentage: new FormControl<number>(0, {
        validators: [Validators.min(0), Validators.max(100)],
        nonNullable: true,
      }),
      tax2Amount: new FormControl<number>(0, {
        validators: [Validators.min(0)],
        nonNullable: true,
      }),
      tax3Percentage: new FormControl<number>(0, {
        validators: [Validators.min(0), Validators.max(100)],
        nonNullable: true,
      }),
      tax3Amount: new FormControl<number>(0, {
        validators: [Validators.min(0)],
        nonNullable: true,
      }),
    });
    this.InvoiceItemForm().push(item);
  }

  removeItem(index: number): void {
    this.InvoiceItemForm().removeAt(index);
  }

  updateItemTotal(index: number): void {
    const item = this.InvoiceItemForm().at(index);
    if (!item) {
      return;
    }

    const price = Number(item.controls.price.value) || 0;
    const quantity = Number(item.controls.quantity.value) || 0;
    const discPercentage = Number(item.controls.discPercentage.value) || 0;
    const tax1Percentage = Number(item.controls.tax1Percentage.value) || 0;
    const tax2Percentage = Number(item.controls.tax2Percentage.value) || 0;
    const tax3Percentage = Number(item.controls.tax3Percentage.value) || 0;

    const itemTotal = price * quantity;
    const discountAmount = itemTotal * (discPercentage / 100);
    const subTotal = itemTotal - discountAmount;

    let tax1Amount = 0;
    let tax2Amount = 0;
    let tax3Amount = 0;
    let taxTotal = 0;

    if (this.selectedTaxOption() === 'CGST & SGST') {
      tax1Amount = subTotal * (tax1Percentage / 100);
      tax2Amount = subTotal * (tax2Percentage / 100);
      taxTotal = tax1Amount + tax2Amount;
    } else if (this.selectedTaxOption() === 'IGST') {
      tax3Amount = subTotal * (tax3Percentage / 100);
      taxTotal = tax3Amount;
    }

    const grandTotal = subTotal + taxTotal;

    item.patchValue(
      {
        itemTotal: Number(itemTotal.toFixed(2)),
        discountAmount: Number(discountAmount.toFixed(2)),
        subTotal: Number(subTotal.toFixed(2)),
        tax1Amount: Number(tax1Amount.toFixed(2)),
        tax2Amount: Number(tax2Amount.toFixed(2)),
        tax3Amount: Number(tax3Amount.toFixed(2)),
        taxTotal: Number(taxTotal.toFixed(2)),
        grandTotal: Number(grandTotal.toFixed(2)),
      },
      { emitEvent: true },
    );
  }
}
