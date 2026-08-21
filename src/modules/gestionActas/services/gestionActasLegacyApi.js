import { useGestionActasStore } from '@/store/gestionActas'

/**
 * Fachada de compatibilidad.
 *
 * Los componentes del spike todavía importan estas funciones. La conexión
 * HTTP real vive exclusivamente en el store Pinia de Gestión de Actas.
 */
const store = () => useGestionActasStore()

export const loadActasCatalogs = (...args) => store().loadActasCatalogs(...args)
export const searchActas = (...args) => store().searchActas(...args)
export const loadActaDetail = (...args) => store().loadActaDetail(...args)
export const loadOtDetail = (...args) => store().loadOtDetail(...args)
export const loadOtMaterials = (...args) => store().loadOtMaterials(...args)

// Contratos ya preparados para completar el resto de Gestión de Actas.
export const searchDebitNotes = (filters, options) => store().searchNotes('NODE', filters, options)
export const searchCreditNotes = (filters, options) => store().searchNotes('NOCR', filters, options)
export const loadDebitNoteDetail = (nroNota) => store().loadNoteDetail('NODE', nroNota)
export const loadCreditNoteDetail = (nroNota) => store().loadNoteDetail('NOCR', nroNota)
export const searchOtsSinActa = (...args) => store().searchOtsSinActa(...args)
