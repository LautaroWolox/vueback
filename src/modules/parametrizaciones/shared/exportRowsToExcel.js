import ExcelJS from 'exceljs/dist/exceljs.min.js'

const XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

const normalizeSheetName = (value) => String(value || 'Datos')
  .replace(/[\\/?*\[\]:]/g, ' ')
  .trim()
  .slice(0, 31) || 'Datos'

const resolveColumnWidth = (column, rows) => {
  const headerLength = String(column.header ?? '').length
  const contentLength = rows.reduce((maximum, row) => {
    const valueLength = String(row[column.field] ?? '').length
    return Math.max(maximum, valueLength)
  }, 0)

  return Math.min(Math.max(headerLength, contentLength, 10) + 2, 42)
}

export async function exportRowsToExcel({ filename, sheetName, columns, rows }) {
  if (!Array.isArray(columns) || columns.length === 0) return false
  if (!Array.isArray(rows) || rows.length === 0) return false

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Field Manager'
  workbook.created = new Date()

  const worksheet = workbook.addWorksheet(normalizeSheetName(sheetName))
  worksheet.columns = columns.map((column) => ({
    header: column.header,
    key: column.field,
    width: resolveColumnWidth(column, rows)
  }))

  rows.forEach((row) => {
    worksheet.addRow(
      Object.fromEntries(columns.map(({ field }) => [field, row[field] ?? '']))
    )
  })

  const headerRow = worksheet.getRow(1)
  headerRow.height = 22
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF00A9BD' }
  }
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

  worksheet.views = [{ state: 'frozen', ySplit: 1 }]
  worksheet.eachRow((row) => {
    row.alignment = { ...row.alignment, vertical: 'middle' }
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD9E1E4' } },
        left: { style: 'thin', color: { argb: 'FFD9E1E4' } },
        bottom: { style: 'thin', color: { argb: 'FFD9E1E4' } },
        right: { style: 'thin', color: { argb: 'FFD9E1E4' } }
      }
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: XLSX_MIME_TYPE })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)

  return true
}
