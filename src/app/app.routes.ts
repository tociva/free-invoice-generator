import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { SimpleInvoice } from './components/invoice/simple-invoice/simple-invoice';
import { Invoice } from './components/invoice/invoice';

export const routes: Routes = [

    {
        path:'home',
        pathMatch :'full',
        loadComponent:()=>
            import('./components/home/home').then(m=>m.Home)

    },
    {
        path:'simple-invoice',
        pathMatch :'full',
        loadComponent:()=>
            import('./components/invoice/simple-invoice/simple-invoice').then(m=>SimpleInvoice)
    },
    {
        path:"invoice",
        pathMatch :'full',
        loadComponent:()=>
            import('./components/invoice/invoice').then(m=>Invoice)
    },
    {
        path:'',
        redirectTo:'simple-invoice',
        pathMatch:'full'
    }
];
