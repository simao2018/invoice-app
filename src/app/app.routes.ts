import { Routes } from '@angular/router';
import { CreateQuoteComponent } from './create-quote/create-quote.component';
import { InvoiceComponent } from './invoice/invoice.component';

export const routes: Routes = [
  { path: '', redirectTo: 'devis', pathMatch: 'full' },
  { path: 'devis', component: CreateQuoteComponent },
  { path: 'facture', component: InvoiceComponent },
  { path: '**', redirectTo: 'devis' }
];
