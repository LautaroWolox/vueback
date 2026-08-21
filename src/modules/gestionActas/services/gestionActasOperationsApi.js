import { useGestionActasStore } from '@/store/gestionActas'

/**
 * Fachada temporal de compatibilidad para el workspace actual.
 * Las URLs y las llamadas HTTP viven únicamente en useGestionActasStore.
 */
const store = () => useGestionActasStore()

export const loadActaExportRows = (...args) => store().loadActaExportRows(...args)
export const validateOtRules = (...args) => store().validateOtRules(...args)
export const executeDomicileRules = (...args) => store().executeDomicileRules(...args)
export const loadMotivos = (...args) => store().loadMotivos(...args)
export const excludeOts = (...args) => store().excludeOts(...args)
export const includeOt = (...args) => store().includeOt(...args)
export const validateTransfer = (...args) => store().validateTransfer(...args)
export const loadTransferOptions = (...args) => store().loadTransferOptions(...args)
export const loadSubregions = (...args) => store().loadSubregions(...args)
export const checkEventosContract = (...args) => store().checkEventosContract(...args)
export const executeTransfer = (...args) => store().executeTransfer(...args)
export const rateActa = (...args) => store().rateActa(...args)
export const checkFailedOts = (...args) => store().checkFailedOts(...args)
export const certifyActa = (...args) => store().certifyActa(...args)
export const saveResultingActivities = (...args) => store().saveResultingActivities(...args)
export const modifyRedActivities = (...args) => store().modifyRedActivities(...args)
export const createActivity = (...args) => store().createActivity(...args)
export const deleteActivity = (...args) => store().deleteActivity(...args)
export const searchActivityCodes = (...args) => store().searchActivityCodes(...args)
