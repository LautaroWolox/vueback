import { useGestionActasStore } from '@/store/gestionActas'

/**
 * Fachada de compatibilidad.
 *
 * Los componentes que todavía importan estas funciones no conocen URLs.
 * La conexión HTTP real vive exclusivamente en el store Pinia de Gestión
 * de Actas.
 */
const store = () => useGestionActasStore()

export const loadActasCatalogs = (...args) => store().loadActasCatalogs(...args)
export const searchActas = (...args) => store().searchActas(...args)
export const loadActaDetail = (...args) => store().loadActaDetail(...args)
export const loadOtDetail = (...args) => store().loadOtDetail(...args)
export const loadOtMaterials = (...args) => store().loadOtMaterials(...args)

export const searchDebitNotes = (filters, options) => store().searchNotes('NODE', filters, options)
export const searchCreditNotes = (filters, options) => store().searchNotes('NOCR', filters, options)
export const loadDebitNoteOts = (note) => store().loadNoteOts('NODE', note)
export const loadCreditNoteOts = (note) => store().loadNoteOts('NOCR', note)
export const loadNoteOtDetail = (...args) => store().loadNoteOtDetail(...args)
export const searchOtsSinActa = (...args) => store().searchOtsSinActa(...args)
