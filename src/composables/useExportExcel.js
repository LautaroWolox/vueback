import ExcelJS from "exceljs";

export function useExcelExport() {

  async function exportToExcel({ rows, fields, columns, filename = "datos.xlsx", columnTypes = {}, groupField }) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Datos");
    // encabezado con nombre de columna    
    const headerRow = worksheet.addRow(
      fields.map(field => {
        const colDef = columns.find(c => c.field === field);
        return colDef ? colDef.header : field;
      })
    );
    // estilo encabezado
    headerRow.eachCell(cell => {
      cell.font = { bold: true };
    });
    // datos
    if (!groupField || !fields.includes(groupField)) {
      rows.forEach(row => addRowToWorksheet(worksheet, row, fields, columnTypes));
    } else {
      const grouped = {};
      rows.forEach(row => {
        const key = row[groupField] ?? 'undefined';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(row);
      });
      Object.keys(grouped).forEach(key => {
        const columnDef = columns.find(c => c.field === groupField);
        const groupHeaderLabel = columnDef?.header || groupField;
        const headerRow = worksheet.addRow([`${groupHeaderLabel}: ${key}`]);
        worksheet.mergeCells(headerRow.number, 1, headerRow.number, fields.length);
        headerRow.getCell(1).font = { bold: true };
        headerRow.getCell(1).alignment = { horizontal: 'left' };
        grouped[key].forEach(row => addRowToWorksheet(worksheet, row, fields, columnTypes));
      });
    }
    // escribir a un archivo y descargar
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function groupBy(rows, fields, groupField) {
    if (!groupField) return rows;
    const idx = fields.indexOf(groupField);
    if (idx === -1) return rows;
    const grouped = {};
    rows.forEach(row => {
      const key = row[idx] ?? 'undefined';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    });
    const finalRows = [];
    Object.keys(grouped).forEach(key => {
      finalRows.push([{ __group: `${groupField}: ${key}` }]);
      finalRows.push(...grouped[key]);
    });

    return finalRows;
  }

  function sortRows(rows, column, order = 'asc', type = 'string') {
    const sorted = [...rows].sort((a, b) => {
      let valA = a[column];
      let valB = b[column];
      switch (type) {
        case 'number':
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
          break;
        case 'date':
          valA = parseCustomDate(valA);
          valB = parseCustomDate(valB);
          if (isNaN(valA)) valA = order === 'asc' ? Infinity : -Infinity;
          if (isNaN(valB)) valB = order === 'asc' ? Infinity : -Infinity;
          break;
        case 'string':
        default:
          valA = String(valA ?? '').toLowerCase();
          valB = String(valB ?? '').toLowerCase();
          break;
      }
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
	  });
    return sorted;
  }

  function parseDataFromTable(dtRef) {
    if (!dtRef.value) return { rows: [], fields: [] };
    const exportableColumns = dtRef.value.columns.filter(
        c => c.props.exportable !== false
    );
    const fields = exportableColumns.map(c => c.props.field);
    const rows = dtRef.value.filteredValue ?? dtRef.value.value; 
    return { rows, fields };
  }

  function parseCustomDate(str) {
    if (!str) return NaN;
    const [datePart, timePart] = str.split(' ');
    if (!datePart) return NaN;
    const [day, month, year] = datePart.split('/').map(Number);
    let hour = 0, minute = 0, second = 0;
    if (timePart) [hour, minute, second] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute, second).getTime();
  }

  function addRowToWorksheet(worksheet, row, fields, columnTypes) {
    const newRow = worksheet.addRow(fields.map(f => row[f] ?? ""));
    fields.forEach((field, colIndex) => {
      const value = row[field];
      const type = columnTypes[field] || "string";
      const cell = newRow.getCell(colIndex + 1);
      switch (type) {
        case "number":
          cell.value = isNaN(value) || value === "" ? null : Number(value);
          break;
        case "date":
          cell.value = value ? new Date(value) : null;
          break;
        default:
          cell.value = value;
      }
    });
  }  

  return { parseDataFromTable, exportToExcel, groupBy, sortRows };
}