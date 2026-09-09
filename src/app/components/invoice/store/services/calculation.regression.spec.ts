import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { InvoiceItemsMobileComponent } from '../../invoice-items-mobile/invoice-items-mobile';
import { InvoiceItemsComponent } from '../../invoice-items/invoice-items';
import { initialInvoiceState } from '../invoice.states';
import { createInvoice } from '../models/invoice-form.factory';
import { InvoiceCalculationService } from './calculation.services';

for (const component of [InvoiceItemsComponent, InvoiceItemsMobileComponent]) {
  describe(`${component.name} calculation regression`, () => {
    function setup(discount = true) {
      const fixture = TestBed.createComponent<InvoiceItemsComponent | InvoiceItemsMobileComponent>(
        component,
      );
      const form = createInvoice(new FormBuilder(), initialInvoiceState.invoice);
      form.controls.items.clear();
      fixture.componentRef.setInput('InvoiceItemForm', form.controls.items);
      fixture.componentRef.setInput('hasItemDiscount', discount);
      fixture.componentInstance.addItem();
      const calc = TestBed.inject(InvoiceCalculationService);
      calc.initFormSubscriptions(form);
      return { fixture, form, calc, item: form.controls.items.at(0) };
    }

    it('applies discount on a newly added item, before its first subtotal', () => {
      const { fixture, item } = setup();
      item.patchValue({
        quantity: 2,
        price: 100,
        discPercentage: 10,
        tax1Percentage: 9,
        tax2Percentage: 9,
      });
      fixture.componentInstance.updateItemTotal(0);
      expect(item.getRawValue()).toMatchObject({
        itemTotal: 200,
        discountAmount: 20,
        subTotal: 180,
        tax1Amount: 16.2,
        tax2Amount: 16.2,
        taxTotal: 32.4,
        grandTotal: 212.4,
      });
    });

    it.each([
      [0, 0, 0, 0],
      [9, 9, 0, 36],
      [0, 0, 18, 36],
      [5, 7, 3, 30],
    ])(
      'preserves tax rates %s/%s/%s',
      (tax1Percentage, tax2Percentage, tax3Percentage, taxTotal) => {
        const { fixture, item, form } = setup(false);
        item.patchValue({
          quantity: 2,
          price: 100,
          tax1Percentage,
          tax2Percentage,
          tax3Percentage,
        });
        fixture.componentInstance.updateItemTotal(0);
        expect(item.controls.taxTotal.value).toBe(taxTotal);
        expect(form.controls.grandTotal.value).toBe(200 + taxTotal);
      },
    );

    it('handles decimal quantities/prices and zero-value items', () => {
      const { fixture, item } = setup(false);
      item.patchValue({ quantity: 1.5, price: 10.25 });
      fixture.componentInstance.updateItemTotal(0);
      expect(item.controls.subTotal.value).toBe(15.375);
      item.controls.price.setValue(0);
      fixture.componentInstance.updateItemTotal(0);
      expect(item.controls.grandTotal.value).toBe(0);
    });

    it('updates totals after deletion, including deleting the final item', () => {
      const { fixture, item, form } = setup(false);
      item.patchValue({ quantity: 1, price: 100 });
      fixture.componentInstance.updateItemTotal(0);
      fixture.componentInstance.addItem();
      form.controls.items.at(1).patchValue({ quantity: 2, price: 50 });
      fixture.componentInstance.updateItemTotal(1);
      expect(form.controls.grandTotal.value).toBe(200);
      fixture.componentInstance.removeItem(0);
      expect(form.controls.grandTotal.value).toBe(100);
      fixture.componentInstance.removeItem(0);
      expect(form.controls.grandTotal.value).toBe(0);
    });

    it('preserves round-off, currency and amount in words, including zero decimal places', () => {
      const { fixture, item, form, calc } = setup(false);
      item.patchValue({ quantity: 1, price: 30000 });
      fixture.componentInstance.updateItemTotal(0);
      form.controls.roundOff.setValue(1);
      form.controls.decimalPlaces.setValue(0);
      expect(form.controls.grandTotal.value).toBe(30001);
      expect(calc.grandTotalInWords()).toContain('Thirty Thousand One');
      expect(calc.decimalPlaces()).toBe(0);
      expect(calc.code()).toBe(form.controls.currency.value?.code);
    });

    it('does not install duplicate calculation subscriptions', () => {
      const { form, calc } = setup();
      calc.initFormSubscriptions(form);
      const spy = vi.spyOn(calc, 'calculateTotals');
      form.controls.items.at(0).controls.price.setValue(2);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
}
