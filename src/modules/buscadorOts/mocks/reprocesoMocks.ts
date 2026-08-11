import type { BuscadorOtRow } from '../store/types'

/**
 * ============================================================================
 * MOCK TEMPORAL - BUSCADOR DE OTs / REPROCESO
 * ============================================================================
 * ESTE ARCHIVO CONTIENE DATOS SIMULADOS SOLO PARA PRUEBAS LOCALES.
 *
 * Cuando el backend real quede conectado:
 * 1. eliminar el uso de buildMockSearchRows() desde buscadorOtsStore.ts;
 * 2. reemplazar findMockTechnician() por la llamada real de búsqueda de técnico;
 * 3. eliminar este archivo completo si ya no queda ninguna dependencia.
 *
 * Los mocks se usan únicamente cuando import.meta.env.DEV === true.
 * NO deben considerarse datos productivos ni contrato definitivo de backend.
 * ============================================================================
 */

export interface MockTechnician {
  techId: string
  nombre: string
  empresaContratista: string
  baseTecnica: string
  provincia: string
}

const MOCK_GRID_SIZE = 625

const knownRows: Record<string, BuscadorOtRow> = {
  AA00070643: {
    id: 'AA00070643',
    nroOt: 'AA00070643',
    nroOtSfs: 'AAW003000',
    statusOt: 'OT Cerrada',
    statusOtWfx: '',
    fechaUltimaModificacion: '2026-07-11 15:17:31.0',
    nroTech: '11CP0217',
    nombreTech: 'SANCHEZ CRISTIAN',
    codigoSolucion: '461YA - OT se...',
    empresaContratista: '',
    baseTecnica: '',
    pais: 'ARG',
    actividades: 'SI',
    ubicacionOt: 'GM-OK',
    origenOt: 'MXM'
  },
  '00066231': {
    id: '00066231',
    nroOt: '00066231',
    nroOtSfs: 'CWO003000C',
    statusOt: 'OT En Ejecución',
    statusOtWfx: '',
    fechaUltimaModificacion: '2026-07-11 12:40:00.0',
    nroTech: '11CP0201',
    nombreTech: 'MARIANO VECCI',
    codigoSolucion: '',
    empresaContratista: 'BARAC ALFR',
    baseTecnica: 'MUNRO',
    pais: 'ARG',
    actividades: 'NO',
    ubicacionOt: 'GM-OK',
    origenOt: 'FAN'
  },
  '00080764': {
    id: '00080764',
    nroOt: '00080764',
    nroOtSfs: '0WO030000',
    statusOt: 'OT Cerrada',
    statusOtWfx: '',
    fechaUltimaModificacion: '2026-07-24 10:18:00.0',
    nroTech: '',
    nombreTech: '',
    codigoSolucion: '',
    empresaContratista: '',
    baseTecnica: '',
    pais: 'ARG',
    actividades: 'SI',
    ubicacionOt: 'GM-Fallida',
    origenOt: 'SFS'
  },
  '00080766': {
    id: '00080766',
    nroOt: '00080766',
    nroOtSfs: '0WO030000',
    statusOt: 'OT Cerrada',
    statusOtWfx: '',
    fechaUltimaModificacion: '2026-07-24 10:19:00.0',
    nroTech: '',
    nombreTech: '',
    codigoSolucion: '',
    empresaContratista: '',
    baseTecnica: '',
    pais: 'ARG',
    actividades: 'NO',
    ubicacionOt: 'GM-OK',
    origenOt: 'SFS'
  }
}

const technicians: Record<string, MockTechnician> = {
  '21SAD041': {
    techId: '21SAD041',
    nombre: 'TECNICO PRUEBA',
    empresaContratista: 'DUNAKEL',
    baseTecnica: 'RECOLETA',
    provincia: 'CAPITAL FEDERAL'
  },
  '11CP0217': {
    techId: '11CP0217',
    nombre: 'SANCHEZ CRISTIAN',
    empresaContratista: 'CONTRERAS',
    baseTecnica: 'SANTA ROSA',
    provincia: 'BUENOS AIRES'
  }
}

const createGeneratedRow = (ot: string, index: number): BuscadorOtRow => {
  const mode = index % 4
  const valid = mode === 0

  return {
    id: ot,
    nroOt: ot,
    nroOtSfs: `SFS-${ot}`,
    statusOt: mode === 1 ? 'OT En Ejecución' : 'OT Cerrada',
    statusOtWfx: '',
    fechaUltimaModificacion: `2026-08-${String((index % 28) + 1).padStart(2, '0')} ${String((index % 12) + 8).padStart(2, '0')}:${String(index % 60).padStart(2, '0')}:00.0`,
    nroTech: valid ? '11CP0217' : `TECH${String(index % 90).padStart(2, '0')}`,
    nombreTech: valid ? 'SANCHEZ CRISTIAN' : `TECNICO MOCK ${index + 1}`,
    codigoSolucion: valid ? '461YA - OT se...' : '',
    empresaContratista: valid ? 'CONTRERAS' : 'CONTRATISTA MOCK',
    baseTecnica: valid ? 'SANTA ROSA' : `BASE ${String((index % 20) + 1).padStart(2, '0')}`,
    pais: 'ARG',
    actividades: mode === 3 ? 'NO' : 'SI',
    ubicacionOt: mode === 2 ? 'GM-Fallida' : 'GM-OK',
    origenOt: valid ? 'MXM' : 'SFS'
  }
}

export const buildMockSearchRows = (otNumbers: string[]): BuscadorOtRow[] => {
  const requestedRows = otNumbers.map((rawOt, index) => {
    const ot = rawOt.trim().toUpperCase()
    return { ...(knownRows[ot] ?? createGeneratedRow(ot, index)) }
  })

  if (requestedRows.length >= MOCK_GRID_SIZE) {
    return requestedRows
  }

  const generatedRows = Array.from(
    { length: MOCK_GRID_SIZE - requestedRows.length },
    (_, offset) => {
      const index = requestedRows.length + offset
      const ot = `MOCK${String(index + 1).padStart(6, '0')}`
      return createGeneratedRow(ot, index)
    }
  )

  return [...requestedRows, ...generatedRows]
}

export const findMockTechnician = (techId: string): MockTechnician | null => {
  const normalized = techId.trim().toUpperCase()
  return technicians[normalized] ? { ...technicians[normalized] } : null
}
