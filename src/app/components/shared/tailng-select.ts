import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TngSelectComponent } from '@tailng-ui/components';

/** Bridges TailNG's value API to existing object-valued Reactive Forms. */
@Component({
  selector: 'app-tailng-select',
  imports: [TngSelectComponent],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TailngSelect), multi: true },
  ],
  template: `<tng-select
    [options]="options()"
    [value]="key(value())"
    [getOptionValue]="key"
    [getOptionLabel]="label"
    [labelId]="labelId()"
    [disabled]="disabled()"
    (valueChange)="select($event)"
    (openChange)="!$event && touched()"
  />`,
})
export class TailngSelect implements ControlValueAccessor {
  options = input<readonly unknown[]>([]);
  labelId = input<string>('');
  value = signal<unknown>(null);
  disabled = signal(false);
  private changed: (value: unknown) => void = () => {};
  touched: () => void = () => {};
  key = (option: unknown): unknown => {
    if (option && typeof option === 'object') {
      const record = option as Record<string, unknown>;
      return record['code'] ?? record['value'] ?? option;
    }
    return option;
  };
  label = (option: unknown): string => {
    if (option && typeof option === 'object') {
      const record = option as Record<string, unknown>;
      return [record['symbol'], record['name'] ?? record['value']].filter(Boolean).join(' ');
    }
    return String(option ?? '');
  };
  select(key: unknown) {
    const value = this.options().find((option) => this.key(option) === key) ?? null;
    this.value.set(value);
    this.changed(value);
  }
  writeValue(value: unknown) {
    this.value.set(value);
  }
  registerOnChange(fn: (value: unknown) => void) {
    this.changed = fn;
  }
  registerOnTouched(fn: () => void) {
    this.touched = fn;
  }
  setDisabledState(disabled: boolean) {
    this.disabled.set(disabled);
  }
}
