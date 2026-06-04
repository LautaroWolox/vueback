export function exportarCSV(datos: any[], nombreArchivo: string = 'datos.csv') {
  const encabezado = Object.keys(datos[0]).join(',')
  const filas = datos.map(fila => Object.values(fila).join(',')).join('\n')
  const csvContent = `${encabezado}\n${filas}`

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', nombreArchivo)
  link.click()
}