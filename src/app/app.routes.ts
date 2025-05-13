import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InvoiceComponent } from './components/invoice/invoice.component';
import { TemplatesComponent } from './components/templates/templates.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'invoice', component: InvoiceComponent },
  { path: 'templates', component: TemplatesComponent }
];
