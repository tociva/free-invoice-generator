import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TngDatepickerComponent } from '@tailng-ui/components';

@Component({
  selector: 'app-tailng-date',
  imports: [TngDatepickerComponent],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TailngDate), multi: true },
  ],
  template: `<tng-datepicker
    [value]="value()"
    [disabled]="disabled()"
    [inputAriaLabel]="label()"
    [id]="inputId()"
    [required]="true"
    [fullWidth]="true"
    (valueChange)="select($event)"
    (closed)="touched()"
    (focusout)="touched()"
  />`,
})
export class TailngDate implements ControlValueAccessor {
  label = input('Invoice date');
  inputId = input<string>('');
  value = signal<Date | null>(null);
  disabled = signal(false);
  private changed: (value: Date | null) => void = () => {};
  touched: () => void = () => {};
  select(value: unknown) {
    const date = value instanceof Date && Number.isFinite(value.getTime()) ? value : null;
    this.value.set(date);
    this.changed(date);
  }
  writeValue(value: unknown) {
    const date = value instanceof Date ? value : typeof value === 'string' ? new Date(value) : null;
    this.value.set(date && Number.isFinite(date.getTime()) ? date : null);
  }
  registerOnChange(fn: (value: Date | null) => void) {
    this.changed = fn;
  }
  registerOnTouched(fn: () => void) {
    this.touched = fn;
  }
  setDisabledState(disabled: boolean) {
    this.disabled.set(disabled);
  }
}
