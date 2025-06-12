import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss'
})
export class InvoiceComponent {
  generate(): void {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Facture', 10, 20);
    doc.save('facture.pdf');
  }
}
