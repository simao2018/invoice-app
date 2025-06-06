import { Routes } from '@angular/router';
import { CreateQuoteComponent } from './create-quote/create-quote.component';

export const routes: Routes = [
  { path: '', redirectTo: 'devis', pathMatch: 'full' },
  { path: 'devis', component: CreateQuoteComponent },
  { path: '**', redirectTo: 'devis' }
];
