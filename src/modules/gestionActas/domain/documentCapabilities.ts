import { DOCUMENT_TYPES } from '@/store/gestionActas'

export interface DocumentCapabilities {
  canCreateActivity: boolean
  canEditActivity: boolean
  canDeleteActivity: boolean
  canValidateRules: boolean
  canExcludeOt: boolean
  canIncludeOt: boolean
  canTransferOt: boolean
  canRate: boolean
  canExport: boolean
  canClose: boolean
  canCertify: boolean
  canPersistClaims: boolean
}

const NONE: DocumentCapabilities = Object.freeze({
  canCreateActivity: false,
  canEditActivity: false,
  canDeleteActivity: false,
  canValidateRules: false,
  canExcludeOt: false,
  canIncludeOt: false,
  canTransferOt: false,
  canRate: false,
  canExport: true,
  canClose: false,
  canCertify: false,
  canPersistClaims: false,
})

/**
 * Capacidades funcionales según los contratos vigentes relevados en:
 * FM-VUE-0.4.1 / CT-VUE-0.1.0 / GM-2.7.0-4.
 *
 * Estas capacidades expresan disponibilidad del flujo. El backend sigue
 * siendo la autoridad final de permisos/estado para cada documento concreto.
 */
const CAPABILITIES: Record<string, DocumentCapabilities> = {
  [DOCUMENT_TYPES.ACTA]: {
    canCreateActivity: true,
    canEditActivity: true,
    canDeleteActivity: true,
    canValidateRules: true,
    canExcludeOt: true,
    canIncludeOt: true,
    canTransferOt: true,
    canRate: true,
    canExport: true,
    canClose: false,
    canCertify: true,
    canPersistClaims: false,
  },

  [DOCUMENT_TYPES.NOTA_DEBITO]: {
    canCreateActivity: true,
    canEditActivity: true,
    canDeleteActivity: true,
    canValidateRules: true,
    canExcludeOt: true,
    // FM-VUE-0.4.1 expone incluirOrdenTrabajo, pero el controller retorna null (TODO).
    canIncludeOt: false,
    canTransferOt: false,
    canRate: false,
    canExport: true,
    canClose: true,
    canCertify: false,
    canPersistClaims: true,
  },

  [DOCUMENT_TYPES.NOTA_CREDITO]: {
    // El flujo legacy de NC no habilita alta como ND/Acta.
    canCreateActivity: false,
    canEditActivity: true,
    canDeleteActivity: true,
    canValidateRules: true,
    // El controller de FM conserva exclusión con TODO explícito de eliminarla.
    canExcludeOt: false,
    canIncludeOt: false,
    canTransferOt: false,
    canRate: false,
    canExport: true,
    canClose: true,
    canCertify: false,
    canPersistClaims: true,
  },

  [DOCUMENT_TYPES.OT_SIN_ACTA]: NONE,
}

export const getDocumentCapabilities = (type: string): DocumentCapabilities =>
  CAPABILITIES[type] || NONE
