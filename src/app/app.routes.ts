import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    pathMatch: 'full',
    title: 'Free Invoice Generator - Daybook.Cloud',
    data: {
      description:
        'Create professional invoices instantly. Free, open source, and no signup required.',
    },
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
    path: 'docs/index.html',
    redirectTo: 'docs',
    pathMatch: 'full',
  },
  {
    path: 'docs/create-unlimited-free-invoices.html',
    redirectTo: 'docs/create-invoices',
    pathMatch: 'full',
  },
  {
    path: 'docs/customize-invoice-template.html',
    redirectTo: 'docs/customize-templates',
    pathMatch: 'full',
  },
  {
    path: 'docs/free-opensource-invoice-templates',
    redirectTo: 'docs/template-library',
    pathMatch: 'full',
  },
  {
    path: 'docs/free-opensource-invoice-templates/**',
    redirectTo: 'docs/template-library',
  },
  {
    path: 'docs',
    loadComponent: () => import('./components/docs/docs').then((m) => m.Docs),
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Invoice Generator Help & Documentation - Daybook.Cloud',
        data: {
          description:
            'Guides for creating invoices, exporting data, and customizing invoice templates with Daybook.Cloud.',
        },
        loadComponent: () =>
          import('./components/docs/docs-overview/docs-overview').then((m) => m.DocsOverview),
      },
      {
        path: 'create-invoices',
        title: 'Create Unlimited Free Invoices - Daybook.Cloud',
        data: {
          description:
            'Create unlimited professional invoices for free. No ads, watermarks, or signup required.',
        },
        loadComponent: () =>
          import('./components/docs/docs-create-invoices/docs-create-invoices').then(
            (m) => m.DocsCreateInvoices,
          ),
      },
      {
        path: 'customize-templates',
        title: 'Customizing Invoice Templates - Daybook.Cloud',
        data: {
          description:
            'Customize invoice templates with HTML, CSS, and placeholders for invoice numbers, items, taxes, and totals.',
        },
        loadComponent: () =>
          import('./components/docs/docs-customize-templates/docs-customize-templates').then(
            (m) => m.DocsCustomizeTemplates,
          ),
      },
      {
        path: 'template-library',
        title: 'Free Open Source Invoice Templates - Daybook.Cloud',
        data: {
          description:
            'Browse free, open-source invoice templates you can use and customize in the Daybook.Cloud invoice generator.',
        },
        loadComponent: () =>
          import('./components/docs/docs-template-library/docs-template-library').then(
            (m) => m.DocsTemplateLibrary,
          ),
      },
      {
        path: 'template-library/:slug',
        title: 'Invoice Template Details - Daybook.Cloud',
        data: {
          description: 'Details for a free, open-source invoice template from Daybook.Cloud.',
        },
        loadComponent: () =>
          import('./components/docs/docs-template-library/docs-template-library').then(
            (m) => m.DocsTemplateLibrary,
          ),
      },
    ],
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'templates',
    pathMatch: 'full',
    loadComponent: () =>
      import('./components/list-templates/list-templates').then((m) => m.ListTemplates),
  },
];
