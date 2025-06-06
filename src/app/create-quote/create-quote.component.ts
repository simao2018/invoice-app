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
    const body = this.items.controls.map((ctrl) => [
      ctrl.get('designation')!.value,
      ctrl.get('quantity')!.value,
      ctrl.get('unitPrice')!.value,
      this.rowTotal(ctrl as FormGroup).toFixed(2),
    ]);
    autoTable(doc, {
      head: [['Désignation', 'Qté', 'Prix U.', 'Total HT']],
      body,
    });
    let finalY = (doc as any).lastAutoTable.finalY || 10;
    doc.text(`Total HT: ${this.totalHT.toFixed(2)} €`, 10, finalY + 10);
    doc.text(`TVA (10%): ${this.tva.toFixed(2)} €`, 10, finalY + 20);
    doc.text(`Total TTC: ${this.totalTTC.toFixed(2)} €`, 10, finalY + 30);
    doc.save('devis.pdf');
  }
}
