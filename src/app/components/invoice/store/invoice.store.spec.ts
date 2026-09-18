import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { initialInvoiceState } from './invoice.states';
import { INVOICE_STORAGE_KEY, invoiceStore } from './invoice.store';
import { Invoice } from './models/invoice-model';

describe('invoiceStore', () => {
  beforeEach(() => {
    localStorage.removeItem(INVOICE_STORAGE_KEY);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    localStorage.removeItem(INVOICE_STORAGE_KEY);
  });

  function savedInvoice(overrides: Partial<Invoice> = {}): Invoice {
    return {
      ...initialInvoiceState.invoice,
      organization: initialInvoiceState.invoice.organization
        ? { ...initialInvoiceState.invoice.organization }
        : null,
      customer: initialInvoiceState.invoice.customer
        ? { ...initialInvoiceState.invoice.customer }
        : null,
      items: initialInvoiceState.invoice.items.map((item) => ({ ...item })),
      ...overrides,
    };
  }

  it('starts with initialInvoiceState when storage is empty', () => {
    const store = TestBed.inject(invoiceStore);

    expect(store.invoice()).toEqual(initialInvoiceState.invoice);
    expect(store.isloading()).toBe(initialInvoiceState.isloading);
    expect(store.error()).toBe(initialInvoiceState.error);
  });

  it('restores the complete saved invoice, including dates and nested data', () => {
    const invoice = savedInvoice({
      invoiceNo: 'SAVED-42',
      invoiceDate: new Date('2026-09-01T00:00:00.000Z'),
      invoiceDueDate: new Date('2026-10-01T00:00:00.000Z'),
      organization: {
        ...initialInvoiceState.invoice.organization!,
        name: 'Saved Organization',
      },
      customer: {
        ...initialInvoiceState.invoice.customer!,
        name: 'Saved Customer',
      },
      items: [{ ...initialInvoiceState.invoice.items[0], name: 'Saved Item' }],
      smallLogo: '',
      largeLogo: '',
    });
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(invoice));

    const restored = TestBed.inject(invoiceStore).invoice();

    expect(restored).toEqual(invoice);
    expect(restored.invoiceDate).toBeInstanceOf(Date);
    expect(restored.invoiceDueDate).toBeInstanceOf(Date);
    expect(restored.organization?.name).toBe('Saved Organization');
    expect(restored.customer?.name).toBe('Saved Customer');
    expect(restored.items[0].name).toBe('Saved Item');
    expect(restored.smallLogo).toBe('');
    expect(restored.largeLogo).toBe('');
  });

  it('preserves null invoice dates when restoring', () => {
    localStorage.setItem(
      INVOICE_STORAGE_KEY,
      JSON.stringify(savedInvoice({ invoiceDate: null, invoiceDueDate: null })),
    );

    const restored = TestBed.inject(invoiceStore).invoice();

    expect(restored.invoiceDate).toBeNull();
    expect(restored.invoiceDueDate).toBeNull();
  });

  it('persists the complete updated invoice after setInvoice', () => {
    const store = TestBed.inject(invoiceStore);
    const setItem = vi.spyOn(Storage.prototype, 'setItem');

    store.setInvoice({ invoiceNo: 'UPDATED-7', notes: 'Persist me', smallLogo: '' });

    const updatedInvoice = {
      ...initialInvoiceState.invoice,
      invoiceNo: 'UPDATED-7',
      notes: 'Persist me',
      smallLogo: '',
    };
    expect(store.invoice()).toEqual(updatedInvoice);
    expect(setItem).toHaveBeenCalledOnce();
    expect(setItem).toHaveBeenCalledWith(INVOICE_STORAGE_KEY, JSON.stringify(updatedInvoice));
    expect(JSON.parse(localStorage.getItem(INVOICE_STORAGE_KEY)!)).toEqual(
      JSON.parse(JSON.stringify(updatedInvoice)),
    );
  });

  it('resets in-memory state and removes the persisted invoice', () => {
    const store = TestBed.inject(invoiceStore);
    store.setInvoice({ invoiceNo: 'TO-BE-RESET' });

    store.resetInvoice();

    expect(store.invoice()).toEqual(initialInvoiceState.invoice);
    expect(localStorage.getItem(INVOICE_STORAGE_KEY)).toBeNull();
  });

  it('falls back safely when storage contains invalid JSON', () => {
    localStorage.setItem(INVOICE_STORAGE_KEY, '{invalid');

    expect(TestBed.inject(invoiceStore).invoice()).toEqual(initialInvoiceState.invoice);
  });

  it('falls back safely when reading storage fails', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Denied', 'SecurityError');
    });

    expect(TestBed.inject(invoiceStore).invoice()).toEqual(initialInvoiceState.invoice);
  });

  it('keeps setInvoice working when writing storage fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError');
    });
    const store = TestBed.inject(invoiceStore);

    expect(() => store.setInvoice({ invoiceNo: 'IN-MEMORY' })).not.toThrow();
    expect(store.invoice().invoiceNo).toBe('IN-MEMORY');
  });

  it('keeps resetInvoice working when removing storage fails', () => {
    const store = TestBed.inject(invoiceStore);
    store.setInvoice({ invoiceNo: 'TO-BE-RESET' });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('Denied', 'SecurityError');
    });

    expect(() => store.resetInvoice()).not.toThrow();
    expect(store.invoice()).toEqual(initialInvoiceState.invoice);
  });

  it('does not access browser storage on the server', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const storage = vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('Browser storage accessed on the server');
    });

    const store = TestBed.inject(invoiceStore);
    store.setInvoice({ invoiceNo: 'SERVER' });
    store.resetInvoice();

    expect(storage).not.toHaveBeenCalled();
    expect(store.invoice()).toEqual(initialInvoiceState.invoice);
  });
});
