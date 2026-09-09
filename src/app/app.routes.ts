import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    pathMatch: 'full',
    loadComponent: () => import('./components/home/home').then((m) => m.Home),
  },
  {
    path: 'Testing',
    pathMatch: 'full',
    loadComponent: () => import('./components/invoice/testing/testing').then((m) => m.Testing),
  },
  {
    path: 'simple-invoice',
    pathMatch: 'full',
    loadComponent: () =>
      import('./components/invoice/simple-invoice/simple-invoice').then((m) => m.SimpleInvoice),
  },
  {
    path: 'invoice',
    pathMatch: 'full',
    loadComponent: () => import('./components/invoice/invoice').then((m) => m.Invoice),
  },
  {
    path: '',
    redirectTo: 'simple-invoice',
    pathMatch: 'full',
  },
  {
    path: 'templates',
    pathMatch: 'full',
    loadComponent: () =>
      import('./components/list-templates/list-templates').then((m) => m.ListTemplates),
  },
];
