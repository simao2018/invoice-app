import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-create-quote',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
  ],
  templateUrl: './create-quote.component.html',
  styleUrls: ['./create-quote.component.scss'],
})
export class CreateQuoteComponent {
  form: FormGroup;
  displayedColumns = ['designation', 'quantity', 'unitPrice', 'total', 'actions'];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      client: this.fb.group({
        name: ['', Validators.required],
        address: [''],
        phone: [''],
        email: ['', Validators.email],
      }),
      items: this.fb.array([]),
    });
    this.addItem();
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  addItem(): void {
    const group = this.fb.group({
      designation: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
    });
    this.items.push(group);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  rowTotal(row: FormGroup): number {
    return (row.get('quantity')!.value || 0) * (row.get('unitPrice')!.value || 0);
  }

  get totalHT(): number {
    return this.items.controls.reduce((acc, ctrl) => acc + this.rowTotal(ctrl as FormGroup), 0);
  }

  get tva(): number {
    return this.totalHT * 0.1;
  }

  get totalTTC(): number {
    return this.totalHT + this.tva;
  }

  exportPDF(): void {
    const doc = new jsPDF();

    // En-tête artisan
    doc.setFontSize(12);
    const leftStart = 10;
    doc.text('WELL\'S PLOMBERIE', leftStart, 10);
    doc.text('2 rue Pierre Guys, 13012 Marseille', leftStart, 16);
    doc.text('T\u00E9l\u00E9phone : 06 66 62 16 19', leftStart, 22);
    doc.text('Email : wellsplomberie@gmail.com', leftStart, 28);
    doc.text('SIRET : 844 118 560 00017', leftStart, 34);
    doc.text('Code APE : 4322A', leftStart, 40);

    // En-t\u00EAte droite
    const rightStart = 140;
    doc.text('DEVIS n\u00B02', rightStart, 10);
    doc.text(`Date : ${new Date().toLocaleDateString()}`, rightStart, 16);
    doc.text('Objet : ', rightStart, 22);

    // Infos client
    const client = this.form.get('client')!.value;
    let cursorY = 50;
    doc.text('Client :', leftStart, cursorY);
    doc.text(client.name || '', leftStart + 20, cursorY);
    cursorY += 6;
    doc.text(client.address || '', leftStart + 20, cursorY);

    // Tableau des prestations
    const body = this.items.controls.map((ctrl) => [
      ctrl.get('designation')!.value,
      ctrl.get('quantity')!.value,
      ctrl.get('unitPrice')!.value,
      this.rowTotal(ctrl as FormGroup).toFixed(2),
    ]);
    autoTable(doc, {
      startY: cursorY + 10,
      head: [['D\u00E9signation', 'Quantit\u00E9', 'Prix unitaire HT (\u20AC)', 'Montant HT (\u20AC)']],
      body,
      theme: 'grid',
      styles: { fontSize: 11 },
    });

    let finalY = (doc as any).lastAutoTable.finalY || cursorY + 20;
    const totalX = 130;
    doc.text(`Total HT : ${this.totalHT.toFixed(2)} \u20AC`, totalX, finalY + 10);
    doc.text(`TVA (10%) : ${this.tva.toFixed(2)} \u20AC`, totalX, finalY + 16);
    doc.text(`Total TTC : ${this.totalTTC.toFixed(2)} \u20AC`, totalX, finalY + 22);

    doc.text('Acompte de 50% \u00E0 la signature, solde \u00E0 la r\u00E9ception de la facture', leftStart, finalY + 40);

    doc.save('devis.pdf');
  }
}
