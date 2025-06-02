import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'invoice',
    pathMatch: 'full',
    loadComponent: () =>
      import('./components/invoice/invoice.component').then(m => m.InvoiceComponent)
  },
  {
    path: 'templates',
    pathMatch: 'full',
    loadComponent: () =>
      import('./components/templates/list-templates/templates.component').then(m => m.TemplatesComponent)
  }
];
