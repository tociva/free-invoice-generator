import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    pathMatch: 'full',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'invoice',
    pathMatch: 'full',
    loadComponent: () =>
      import('./components/invoice/invoice.component').then((m) => m.InvoiceComponent)
  },
  {
    path: 'simple-invoice',
    pathMatch: 'full',
    loadComponent: () =>
      import('./components/invoice/simple-invoice/simple-invoice.component').then((m) => m.SimpleInvoiceComponent)
  },
  {
    path: 'templates',
    pathMatch: 'full',
    loadComponent: () =>
      import('./components/templates/list-templates/list-templates.component').then((m) => m.ListTemplatesComponent)
  },
  {
    path: 'preview',
    pathMatch: 'full',
    loadComponent: () =>
      import('./components/invoice/preview-invoice/preview-invoice.component').then((m) => m.PreviewInvoiceComponent)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  }
];
