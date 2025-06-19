import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterModule } from '@angular/router';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Item, PdfService } from './pdf.service';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MaintenanceComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'invoice-app';

  maintenanceMode = environment.maintenanceMode;

  private breakpointObserver = inject(BreakpointObserver);
  public now = new Date();
  public year = this.now.getFullYear();

  isSmallScreen$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Handset, Breakpoints.Tablet])
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  private pdf = new PdfService();

  // constructor(private breakpointObserver: BreakpointObserver) {}

  generate() {
    const items: Item[] = [
      { title: 'Pose carrelage', description: 'Salle de bains', quantity: 1, price: 500 },
    ];
    const doc = this.pdf.generate(items);
    doc.save('devis.pdf');
  }
}
