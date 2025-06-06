import jsPDF from 'jspdf';
import autoTable, { CellHookData } from 'jspdf-autotable';

export interface Item {
  title: string;
  description: string;
  quantity: number;
  price: number;
}

export class PdfService {
  generate(items: Item[]): jsPDF {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [['Désignation', 'Qté', 'Prix (€)']],
      // We put empty content for the first column and keep meta data
      body: items.map((it) => [
        { content: '', meta: { title: it.title, description: it.description } },
        it.quantity.toString(),
        it.price.toFixed(2)
      ]),
      didDrawCell: (data: CellHookData) => {
        // Draw custom title/description in the first column
        if (data.section === 'body' && data.column.index === 0) {
          const meta = (data.cell.raw as any).meta;
          if (!meta) return;
          const x = data.cell.x + data.cell.padding('left');
          const y = data.cell.y + data.cell.padding('top');
          data.doc.setFont(undefined, 'bold');
          data.doc.text(meta.title, x, y);
          data.doc.setFont(undefined, 'normal');
          data.doc.text(meta.description, x, y + 4);
        }
      },
      styles: { cellPadding: 2, minCellHeight: 8 },
    });

    return doc;
  }
}
