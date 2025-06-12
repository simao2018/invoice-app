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
import { Item, PdfService } from '../pdf.service';

@Component({
  selector: 'app-invoice',
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
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss'
})
export class InvoiceComponent {
  form: FormGroup;
  @ViewChild(MatTable) table!: MatTable<FormGroup>;
  displayedColumns = ['designation', 'quantity', 'unitPrice', 'total', 'actions'];
  private pdf = new PdfService();
  private storageKey = 'invoiceForm';

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
      deposit: [0],
    });
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      this.loadForm(JSON.parse(saved));
    } else {
      this.addItem();
    }

    this.form.valueChanges.subscribe((val) => {
      localStorage.setItem(this.storageKey, JSON.stringify(val));
    });
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

  private loadForm(data: any): void {
    this.form.patchValue({
      client: data.client || {},
      manualHT: data.manualHT,
      manualTotalHT: data.manualTotalHT,
      deposit: data.deposit,
    });

    if (Array.isArray(data.items) && data.items.length) {
      this.items.clear();
      data.items.forEach((it: any) => {
        const group = this.fb.group({
          designation: it.designation,
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
        });
        this.items.push(group);
      });
    } else {
      this.addItem();
    }
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
    if (this.table) {
      this.table.renderRows();
    }
  }

  rowTotal(row: FormGroup): number {
    return (row.get('quantity')!.value || 0) * (row.get('unitPrice')!.value || 0);
  }

  get totalHT(): number {
    if (this.form.get('manualHT')!.value) {
      return Number(this.form.get('manualTotalHT')!.value) || 0;
    }
    return this.items.controls.reduce(
      (acc, ctrl) => acc + this.rowTotal(ctrl as FormGroup),
      0
    );
  }

  get tva(): number {
    return this.totalHT * 0.1;
  }

  get totalTTC(): number {
    return this.totalHT + this.tva;
  }

  get deposit(): number {
    return Number(this.form.get('deposit')!.value) || 0;
  }

  generate(): void {
    const items: Item[] = this.items.controls.map((ctrl) => ({
      title: ctrl.get('designation')!.value,
      description: ctrl.get('description')!.value,
      quantity: ctrl.get('quantity')!.value,
      price: ctrl.get('unitPrice')!.value,
    }));
    const doc = this.pdf.generate(items);
    doc.setFontSize(18);
    doc.text('Facture', 10, 10);
    const finalY = (doc as any).lastAutoTable?.finalY || 20;
    doc.setFontSize(12);
    doc.text(`Total HT : ${this.totalHT.toFixed(2)} €`, 10, finalY + 10);
    doc.text(`TVA (10%) : ${this.tva.toFixed(2)} €`, 10, finalY + 16);
    doc.text(`Total TTC : ${this.totalTTC.toFixed(2)} €`, 10, finalY + 22);
    doc.text(`Acompte : ${this.deposit.toFixed(2)} €`, 10, finalY + 28);
    doc.save('facture.pdf');
  }
}
