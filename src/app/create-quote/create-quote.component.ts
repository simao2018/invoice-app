import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logoBase64 } from '../logoPath';

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
    MatSlideToggleModule,
  ],
  templateUrl: './create-quote.component.html',
  styleUrls: ['./create-quote.component.scss'],
})
export class CreateQuoteComponent {
  form: FormGroup;
  @ViewChild(MatTable) table!: MatTable<FormGroup>;
  displayedColumns = [
    'designation',
    'quantity',
    'unitPrice',
    'total',
    'actions',
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      client: this.fb.group({
        name: ['', Validators.required],
        address: [''],
        city: [''],
        phone: [''],
        email: ['', Validators.email],
      }),
      items: this.fb.array([]),
      manualHT: [false],
      manualTotalHT: [0],
    });
    this.addItem();
  }

  trackByFn(index: number, item: unknown): any {
    return item;
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  addItem(afterIndex?: number): void {
    const group = this.fb.group({
      designation: ['', Validators.required],
      description: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
    });
    if (afterIndex !== undefined) {
      this.items.insert(afterIndex + 1, group);
    } else {
      this.items.push(group);
    }
    if (this.table) {
      this.table.renderRows();
    }
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
    if (this.table) {
      this.table.renderRows();
    }
  }

  rowTotal(row: FormGroup): number {
    return (
      (row.get('quantity')!.value || 0) * (row.get('unitPrice')!.value || 0)
    );
  }

  get totalHT(): number {
    if (this.form.get('manualHT')!.value) {
      return Number(this.form.get('manualTotalHT')!.value) || 0;
    }
    return this.items.controls.reduce(
      (acc, ctrl) => acc + this.rowTotal(ctrl as FormGroup),
      0,
    );
  }

  get tva(): number {
    return this.totalHT * 0.1;
  }

  get totalTTC(): number {
    return this.totalHT + this.tva;
  }

  exportPDF(): void {
    const doc = new jsPDF('p', 'mm', 'a4');

const left = 10;
const top = 10;
const right = 200;

const client = this.form.get('client')!.value;

// Logo
doc.addImage(logoBase64, 'JPEG', left, top, 80, 70);

// Infos société
doc.setFontSize(10);
let y = top + 80;


// Encart "DEVIS n°X"
doc.setFontSize(16);
doc.setFillColor(255, 230, 0);
doc.rect(right - 90, top, 80, 12, 'F');
doc.setFont('helvetica', 'bold');
doc.text(`DEVIS n°${2}`, right - 50, top + 9, { align: 'center' });
doc.setFont('helvetica', 'normal');
doc.setFontSize(10);

// Bloc client (à droite)
let blocY = top + 20;
doc.text('A :', right - 90, blocY);
doc.setFont('helvetica', 'bold');
doc.text(client.name || '', right - 80, blocY);
doc.setFont('helvetica', 'normal');
blocY += 6;
doc.text(client.city || '', right - 80, blocY); // facultatif si tu as "city" dans ton form

// Bloc infos devis
// unique numéro de devis : type DDMMYYYYHHMM
let numDevis =  `${new Date().toLocaleDateString('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})}${new Date().toLocaleTimeString('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
})}`.replace(/\D/g, ''); // format DDMMYYYYHHMM
blocY += 10;
doc.text(`Facture n° :`, right - 90, blocY);
doc.text(numDevis, right - 60, blocY);
blocY += 6;
doc.text(`Date :`, right - 90, blocY);
doc.text(new Date().toLocaleDateString(), right - 60, blocY);
blocY += 6;
doc.text(`Objet :`, right - 90, blocY);
doc.text('Intervention- Réparation- Installation', right - 60, blocY);
blocY += 6;
doc.text(`Adresse :`, right - 90, blocY);
doc.text(client.address || 'MARSEILLE', right - 60, blocY);

// Ensuite : continue avec cursorY pour le tableau
let cursorY = y + 10;

    // Tableau des prestations
    const body = this.items.controls.map((ctrl) => [{
      title: ctrl.get('designation')!.value,
      desc: ctrl.get('description')!.value,
    },
      `${ctrl.get('quantity')!.value} U`,
      (ctrl.get('unitPrice')!.value || 0).toFixed(2),
      this.rowTotal(ctrl as FormGroup).toFixed(2),
    ]);
    autoTable(doc, {
      startY: cursorY + 10,
      head: [
        [
          'D\u00C9SIGNATION',
          'Quantit\u00E9',
          'Prix Unitaire HT (\u20AC)',
          'Montant HT (\u20AC)',
        ],
      ],
      body,
      theme: 'grid',
      headStyles: { fillColor: [255, 230, 0] },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 90 } },
      didParseCell: (data) => {
  if (data.section === 'body' && data.column.index === 0) {
    const val = data.cell.raw as { title: string; desc: string };
    data.cell.text = ['']; // ⚠️ Vide le texte pour éviter la superposition
  }
},
didDrawCell: (data) => {
  if (data.section === 'body' && data.column.index === 0) {
    const val = data.cell.raw as { title: string; desc: string };
    const x = data.cell.x + 2;
    const y = data.cell.y + 4;
    doc.setFont('helvetica', 'bold');
    doc.text(val.title, x, y);
    doc.setFont('helvetica', 'normal');
    doc.text(val.desc, x, y + 5);
  }
}
    });

    const finalY = (doc as any).lastAutoTable.finalY || cursorY + 20;
    doc.text(
      `Total H.T : ${this.totalHT.toFixed(2)} \u20AC`,
      right,
      finalY + 10,
      { align: 'right' },
    );
    doc.text(`TVA 10 % : ${this.tva.toFixed(2)} \u20AC`, right, finalY + 16, {
      align: 'right',
    });

    doc.setFillColor(255, 230, 0);
    doc.rect(right - 60, finalY + 20, 60, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Total T.T.C : ${this.totalTTC.toFixed(2)} \u20AC`,
      right - 3,
      finalY + 26,
      { align: 'right' },
    );
    doc.setFont('helvetica', 'normal');

    // Pied de page
    const footerY = finalY + 40;
    doc.text('Conditions de r\u00E8glement :', left, footerY);
    doc.text('- Acompte de 50% \u00E0 la signature', left, footerY + 6);
    doc.text(
      '- Solde \u00E0 la r\u00E9ception de la facture',
      left,
      footerY + 12,
    );
    doc.text('- Pour vous notre meilleure offre', left, footerY + 18);

    doc.text('SIGNATURE :', right, footerY, { align: 'right' });
    doc.line(right - 40, footerY + 20, right, footerY + 20);

    doc.save('devis.pdf');
  }
}
