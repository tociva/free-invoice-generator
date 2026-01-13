import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { initialInvoiceState } from './invoice.states';
import { Invoice } from './models/invoice-model';

export const invoiceStore = signalStore(
  { providedIn: 'root' },
  withState(initialInvoiceState),
  withMethods((store)=>({

    setInvoice(invoice :Partial<Invoice>){
      patchState(store,(state)=>({
        invoice:{
          ...state.invoice,
          ...invoice
        },
        isloading:false,
        error :null
      }));
    },
    resetInvoice(){

    },

  }))
 
);
