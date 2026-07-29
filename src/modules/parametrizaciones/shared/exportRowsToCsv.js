export function exportRowsToCsv({ filename, columns, rows }) {
  if (!Array.isArray(rows) || rows.length === 0) return

  const headers = columns.map(({ header }) => header)
  const lines = rows.map((row) =>
    columns.map(({ field }) => JSON.stringify(row[field] ?? '')).join(',')
  )
  const csv = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
