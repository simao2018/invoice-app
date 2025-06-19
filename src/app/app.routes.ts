import { Routes } from '@angular/router';
import { CreateQuoteComponent } from './create-quote/create-quote.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { environment } from '../environments/environment';

export const routes: Routes = environment.maintenanceMode
  ? [
      { path: '**', component: MaintenanceComponent }
    ]
  : [
      { path: '', redirectTo: 'devis', pathMatch: 'full' },
      { path: 'devis', component: CreateQuoteComponent },
      { path: 'facture', component: InvoiceComponent },
      { path: '**', redirectTo: 'devis' }
    ];
