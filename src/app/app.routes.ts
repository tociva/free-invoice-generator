import { Routes } from '@angular/router';
import { InvoiceComponent } from './components/invoice/invoice.component';
import { TemplatesComponent } from './components/templates/templates.component';

export const routes: Routes = [
  { path: '', component: InvoiceComponent },
  { path: 'templates', component: TemplatesComponent }
];
