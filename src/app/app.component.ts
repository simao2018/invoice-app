import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Item, PdfService } from './pdf.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'invoice-app';

  isSmallScreen = false;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver
      .observe('(max-width: 768px)')
      .subscribe(result => (this.isSmallScreen = result.matches));
  }

  private pdf = new PdfService();

  generate() {
    const items: Item[] = [
      { title: 'Pose carrelage', description: 'Salle de bains', quantity: 1, price: 500 },
    ];
    const doc = this.pdf.generate(items);
    doc.save('devis.pdf');
  }
}
