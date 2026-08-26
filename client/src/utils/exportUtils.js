import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportToPDF = ({
  data,
  columns,
  title,
  filename = 'export.pdf',
  orientation = 'landscape',
  fontSize = 8,
  margins = { top: 20, right: 10, bottom: 20, left: 10 },
  styles = {},
  columnStyles = {},
  didDrawPage = null
}) => {
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text(title, margins.left, 14);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, margins.left, 20);
  doc.text(`Total registros: ${data.length}`, pageWidth - margins.right - 30, 20, { align: 'right' });

  const body = data.map((row) =>
    columns.map((col) => {
      const value = row[col.key];
      if (value === null || value === undefined) return '';
      if (col.format) return col.format(value);
      return String(value);
    })
  );

  const head = [columns.map((col) => col.header)];

  autoTable(doc, {
    head,
    body,
    startY: 26,
    margin: margins,
    styles: {
      fontSize,
      cellPadding: 2,
      overflow: 'linebreak',
      halign: 'center',
      ...styles
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold',
      fontSize,
      halign: 'center'
    },
    columnStyles,
    didDrawPage: (data) => {
      const str = `Página ${doc.internal.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.text(str, pageWidth - margins.right - 10, pageHeight - 5, { align: 'right' });
      if (didDrawPage) didDrawPage(doc, data);
    }
  });

  doc.save(filename);
};

export const exportToExcel = ({
  data,
  columns,
  title = 'Export',
  filename = 'export.xlsx',
  sheetName = 'Datos'
}) => {
  const wsData = [
    [title],
    [`Generado: ${new Date().toLocaleString('es-ES')}`, '', `Total: ${data.length}`],
    columns.map((col) => col.header),
    ...data.map((row) =>
      columns.map((col) => {
        const value = row[col.key];
        if (value === null || value === undefined) return '';
        if (col.format) return col.format(value);
        return value;
      })
    )
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  const colWidths = columns.map((col) => ({
    wch: Math.max(col.header.length, 12)
  }));
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  XLSX.writeFile(wb, filename);
};

export const createExportButtons = ({
  data,
  columns,
  title,
  baseFilename
}) => {
  const handleExportPDF = () => {
    exportToPDF({
      data,
      columns,
      title,
      filename: `${baseFilename}_${new Date().toISOString().split('T')[0]}.pdf`
    });
  };

  const handleExportExcel = () => {
    exportToExcel({
      data,
      columns,
      title,
      filename: `${baseFilename}_${new Date().toISOString().split('T')[0]}.xlsx`
    });
  };

  return { handleExportPDF, handleExportExcel };
};