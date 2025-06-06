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
        phone: [''],
        email: ['', Validators.email],
      }),
      items: this.fb.array([]),
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

    // En-tête artisan (gauche)
    doc.setFontSize(12);
    const left = 10;
    doc.text('LOGO', left, 10);
    doc.text("WELL'S PLOMBERIE", left, 20);
    doc.text('2 rue Pierre Guys - 13012 Marseille', left, 26);
    doc.text('T\u00E9l\u00E9phone : 06 66 62 16 19', left, 32);
    doc.text('Email : wellsplomberie@gmail.com', left, 38);
    doc.text('n\u00B0Siret : 8441185600017', left, 44);
    doc.text('n\u00B0APE : 4322A', left, 50);

    // En-tête droite : infos devis
    const right = 200; // A4 width ~210mm, keep margin
    doc.text('DEVIS n\u00B02', right, 20, { align: 'right' });
    doc.text(`Date : ${new Date().toLocaleDateString()}`, right, 26, {
      align: 'right',
    });
    doc.text('Objet : R\u00E9novation', right, 32, { align: 'right' });
    doc.text('Lieu : Adresse chantier', right, 38, { align: 'right' });

    // Infos client
    const client = this.form.get('client')!.value;
    let cursorY = 60;
    doc.text('Client :', left, cursorY);
    doc.text(client.name || '', left + 20, cursorY);
    cursorY += 6;
    doc.text(client.address || '', left + 20, cursorY);

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
          data.cell.text = [val.title, val.desc];
        }
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 0) {
          const val = data.cell.raw as { title: string; desc: string };
          const pos = (data.cell as any).getTextPos();
          const x = pos.x;
          const y = pos.y;
          doc.setFont('helvetica', 'bold');
          doc.text(val.title, x, y);
          doc.setFont('helvetica', 'normal');
          doc.text(val.desc, x, y + 4);
        }
      },
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
