import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { initialInvoiceState } from './invoice.states';
import { Invoice } from './models/invoice-model';

export const invoiceStore = signalStore(
  { providedIn: 'root' },
  withState(initialInvoiceState),
  withMethods((store)=>({
    // method to call the basic invoice details
    addBasicDetail(invoiceNo:string,invoiceDate:Date,invoiceDueDate:Date){
      patchState(store, (state)=>({
        invoice : {
          ...state.invoice,
          invoiceNo,
          invoiceDate,
          invoiceDueDate
        },
      }));
    },

  }))
 
);
