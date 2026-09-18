import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { initialInvoiceState } from './invoice.states';
import { Invoice } from './models/invoice-model';

export const INVOICE_STORAGE_KEY = 'daybook-invoice';

function browserWindow(): Window | null {
  const document = inject(DOCUMENT);
  return isPlatformBrowser(inject(PLATFORM_ID)) ? document.defaultView : null;
}

function restoreDate(value: unknown): Date | null | undefined {
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function readInvoice(window: Window | null): Invoice {
  try {
    const stored = window?.localStorage.getItem(INVOICE_STORAGE_KEY);
    if (stored === null || stored === undefined) return initialInvoiceState.invoice;

    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return initialInvoiceState.invoice;
    }

    const savedInvoice = parsed as Record<string, unknown>;
    const invoiceDate = restoreDate(savedInvoice['invoiceDate']);
    const invoiceDueDate = restoreDate(savedInvoice['invoiceDueDate']);
    if (invoiceDate === undefined || invoiceDueDate === undefined) {
      return initialInvoiceState.invoice;
    }

    return {
      ...initialInvoiceState.invoice,
      ...savedInvoice,
      invoiceDate,
      invoiceDueDate,
    } as Invoice;
  } catch {
    return initialInvoiceState.invoice;
  }
}

export const invoiceStore = signalStore(
  { providedIn: 'root' },
  withState(() => ({
    ...initialInvoiceState,
    invoice: readInvoice(browserWindow()),
  })),
  withMethods((store, window = browserWindow()) => ({
    setInvoice(invoice: Partial<Invoice>) {
      const updatedInvoice = {
        ...store.invoice(),
        ...invoice,
      };

      patchState(store, {
        invoice: updatedInvoice,
        isloading: false,
        error: null,
      });

      try {
        window?.localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(store.invoice()));
      } catch {
        // A denied or full storage must not block in-memory invoice editing.
      }
    },
    resetInvoice() {
      patchState(store, initialInvoiceState);
      try {
        window?.localStorage.removeItem(INVOICE_STORAGE_KEY);
      } catch {
        // Storage removal failure must not block the in-memory reset.
      }
    },
  })),
);
