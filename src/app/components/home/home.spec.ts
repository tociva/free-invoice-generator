import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { testProviders } from '../../testing/test-providers';
import { invoiceStore } from '../invoice/store/invoice.store';
import {
  createInvoiceJsonEnvelope,
  type InvoiceType,
} from '../invoice/store/models/invoice-import';
import { initialInvoiceState } from '../invoice/store/invoice.states';
import { templateStore } from '../invoice/store/template/template.store';

import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: testProviders,
      imports: [Home],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it.each<[InvoiceType, string, number]>([
    ['simple', '/simple-invoice', 3],
    ['advanced', '/invoice', 6],
  ])('restores a %s JSON file and routes to its preview', async (invoiceType, route, step) => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const invoice = structuredClone(initialInvoiceState.invoice);
    invoice.invoiceNo = `${invoiceType.toUpperCase()}-IMPORTED`;
    const templatePath = `invoice-templates/${invoiceType}.html`;
    const file = new File(
      [JSON.stringify(createInvoiceJsonEnvelope(invoiceType, invoice, templatePath))],
      `${invoiceType}.json`,
      { type: 'application/json' },
    );

    component.handleJsonFile(file);

    await vi.waitFor(() =>
      expect(navigate).toHaveBeenCalledWith([route], { queryParams: { step } }),
    );
    expect(TestBed.inject(invoiceStore).invoice().invoiceNo).toBe(
      `${invoiceType.toUpperCase()}-IMPORTED`,
    );
    expect(TestBed.inject(templateStore).selectedTemplatePath()).toBe(templatePath);
    expect(component.successMessage()).toBe('Invoice imported successfully.');
  });
});
