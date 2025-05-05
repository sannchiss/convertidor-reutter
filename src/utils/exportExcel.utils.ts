import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface DatosPorPestana {
  [nombrePestana: string]: (string | number | boolean | null)[][];
}

export function generarExcelConPestanas(
  dataPorPestana: DatosPorPestana,
  //genera nombre de archivo con la fecha actual
  nombreArchivo: string = `archivo_${new Date().toISOString().slice(0, 10)}.xls`,
): void {
  const workbook: XLSX.WorkBook = XLSX.utils.book_new();

  for (const nombrePestana in dataPorPestana) {
    if (Object.prototype.hasOwnProperty.call(dataPorPestana, nombrePestana)) {
      const datos: (string | number | boolean | null)[][] = dataPorPestana[nombrePestana] || [];
      const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(datos);
      XLSX.utils.book_append_sheet(workbook, worksheet, nombrePestana);
    }
  }

  const wbout: ArrayBuffer = XLSX.write(workbook, { bookType: 'xls', type: 'array' });
  const blob: Blob = new Blob([new Uint8Array(wbout)], { type: 'application/octet-stream' });

  saveAs(blob, nombreArchivo);
}

export function generarExcelConUnaPestana(
  data: (string | number | boolean | null)[][],
  nombreArchivo: string = `archivo_${new Date().toISOString().slice(0, 10)}.xls`,
): void {
  const workbook: XLSX.WorkBook = XLSX.utils.book_new();
  const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hoja1');

  const wbout: ArrayBuffer = XLSX.write(workbook, { bookType: 'xls', type: 'array' });
  const blob: Blob = new Blob([new Uint8Array(wbout)], { type: 'application/octet-stream' });

  saveAs(blob, nombreArchivo);
}
