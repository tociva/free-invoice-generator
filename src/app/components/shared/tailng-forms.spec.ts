import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TngDatepickerComponent } from '@tailng-ui/components';
import { TailngDate } from './tailng-date';
import { TailngSelect } from './tailng-select';

@Component({
  imports: [ReactiveFormsModule, TailngSelect, TailngDate],
  template: `<app-tailng-select
      [formControl]="currency"
      [options]="options"
      labelId="currency-label"
    />
    <app-tailng-date [formControl]="date" label="Invoice date" />`,
})
class FormHost {
  options = [
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'USD', name: 'US Dollar' },
  ];
  currency = new FormControl({ ...this.options[0] });
  date = new FormControl<Date | null>(new Date(2026, 8, 9));
}

describe('TailNG Reactive Forms adapters', () => {
  it('preserves object values, propagates changes/touch and supports disabled controls', () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const adapter = fixture.debugElement.query(By.directive(TailngSelect))
      .componentInstance as TailngSelect;
    expect(adapter.key(adapter.value())).toBe('INR');
    adapter.select('USD');
    adapter.touched();
    expect(fixture.componentInstance.currency.value).toBe(fixture.componentInstance.options[1]);
    expect(fixture.componentInstance.currency.touched).toBe(true);
    fixture.componentInstance.currency.disable();
    expect(adapter.disabled()).toBe(true);
    fixture.componentInstance.currency.enable();
    expect(adapter.disabled()).toBe(false);
  });
  it('keeps Date values in the invoice form and forwards datepicker selection and disabled state', () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const adapter = fixture.debugElement.query(By.directive(TailngDate))
      .componentInstance as TailngDate;
    const picker = fixture.debugElement.query(By.directive(TngDatepickerComponent))
      .componentInstance as TngDatepickerComponent;
    const next = new Date(2026, 9, 10);
    picker.value.set(next);
    expect(fixture.componentInstance.date.value).toEqual(next);
    adapter.touched();
    expect(fixture.componentInstance.date.touched).toBe(true);
    fixture.componentInstance.date.disable();
    expect(adapter.disabled()).toBe(true);
    fixture.componentInstance.date.setValue(null);
    expect(adapter.value()).toBeNull();
  });
});
