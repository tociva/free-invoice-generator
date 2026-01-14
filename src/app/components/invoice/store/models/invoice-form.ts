import { inject, Injectable } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { invoiceStore } from "../invoice.store";
import { createInvoice } from "./invoice-form.factory";

@Injectable({ providedIn: 'root' })

export class InvoiceFormService  {
    private fb = inject(FormBuilder);
    private store = inject(invoiceStore);

    readonly form =createInvoice(this.fb,this.store.invoice());


}