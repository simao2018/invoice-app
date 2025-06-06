import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Item, PdfService } from './pdf.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'invoice-app';

  private pdf = new PdfService();

  generate() {
    const items: Item[] = [
      { title: 'Pose carrelage', description: 'Salle de bains', quantity: 1, price: 500 },
    ];
    const doc = this.pdf.generate(items);
    doc.save('devis.pdf');
  }
}
