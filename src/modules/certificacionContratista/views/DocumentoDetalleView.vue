<template>
  <div class="fm-screen certificacion-contratista-page certificacion-contratista-detail-page">
    <DocumentoHeader :title="store.title" :header="store.header" @back="goBack" />

    <Accordion v-model:value="activePanels" multiple class="fm-accordion certificacion-contratista-detail-accordion">
      <AccordionPanel value="filters">
        <AccordionHeader>FILTROS Y ACCIONES</AccordionHeader>
        <AccordionContent>
          <div class="certificacion-contratista-detail-controls">
            <div class="certificacion-contratista-detail-filters">
              <div class="fm-field"><label for="detail-ot">N.º OT</label><InputText id="detail-ot" v-model.trim="store.filters.nroOt" /></div>
              <div class="fm-field"><label for="detail-flow">Flujo de reglas</label><Select id="detail-flow" v-model="store.filters.flujoReglas" :options="FLOW_OPTIONS" optionLabel="label" optionValue="value" class="fm-select" /></div>
              <div class="fm-field"><label for="detail-excluded">Estado de inclusión</label><Select id="detail-excluded" v-model="store.filters.excluida" :options="EXCLUDED_OPTIONS" optionLabel="label" optionValue="value" class="fm-select" /></div>
              <div class="fm-actions certificacion-contratista-detail-filters__actions">
                <FmButton label="LIMPIAR" variant="outline" @click="store.clearFilters" />
                <FmButton label="BUSCAR" :loading="store.loading" @click="store.filter" />
              </div>
            </div>

            <div class="certificacion-contratista-detail-actions">
              <FmButton v-if="store.config.canInclude" label="INCLUIR OT" icon="pi-plus" variant="outline" @click="openInclude()" />
              <FmButton label="EXCLUIR OTS" icon="pi-minus-circle" variant="outline" :disabled="!store.selectedRows.length" @click="excludeVisible = true" />
              <FmButton label="VALIDAR REGLAS" icon="pi-check-square" variant="outline" :disabled="!store.selectedRows.length" @click="confirmAction = 'validate-rules'" />
              <FmButton v-if="store.config.documentType !== 'ACTA'" label="VALIDAR ACTIVIDADES" icon="pi-list-check" variant="outline" :disabled="!store.selectedRows.length" @click="confirmAction = 'validate-activities'" />
              <FmButton v-if="store.config.canTransfer" label="TRASPASAR" icon="pi-arrow-right-arrow-left" variant="outline" :disabled="!store.selectedRows.length" :loading="transferValidationLoading" @click="openTransfer" />
              <FmButton v-if="store.config.canQualify" label="CALIFICAR" icon="pi-star" variant="outline" @click="qualifyVisible = true" />
              <FmButton v-if="store.config.canCertify" label="CERTIFICAR" icon="pi-verified" @click="confirmAction = 'certify'" />
              <FmButton v-if="store.config.canClose" label="CERRAR DOCUMENTO" icon="pi-lock" @click="confirmAction = 'close'" />
              <FmButton label="EXPORTAR" icon="pi-file-excel" variant="outline" :disabled="!store.rows.length" @click="exportDetail" />
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="rows">
        <AccordionHeader>ÓRDENES DE TRABAJO DEL DOCUMENTO</AccordionHeader>
        <AccordionContent>
          <OtsDetalleGrid
            v-model:selected="store.selectedRows"
            :rows="store.rows"
            :columns="OT_DETAIL_COLUMNS"
            :loading="store.loading"
            :detailByOt="store.detailByOt"
            :detailLoading="store.detailLoadingByOt"
            @expand="store.loadOtDetail"
            @open-detail="openOtDetail"
            @open-note="openNote"
            @include="openInclude"
          />
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <FmTypingLoader v-if="store.loading && !store.header" title="Cargando documento" message="Recuperando acta, OTs y actividades" />

    <ActividadDialog
      v-model:visible="activityVisible"
      :row="activeOt"
      :detail="activeOtDetail"
      :documentNumber="store.number"
      :documentType="store.config.documentType"
      :editable="isDocumentEditable"
      :loading="activityLoading"
      :actionLoading="store.actionLoading"
      @save-activities="saveActivities"
      @add-activity="addActivity"
      @reload="reloadActiveOt"
      @save-incident="saveIncident"
      @validate-rules="validateActiveOtRules"
      @validate-activities="validateActiveOtActivities"
      @verify-network="verifyActiveOtNetwork"
      @error="showError"
    />

    <ExcluirOtsDialog v-model:visible="excludeVisible" :selectedNumbers="store.selectedOtNumbers" :reasons="store.reasons" :loading="store.actionLoading" @submit="excludeOts" />
    <IncluirOtDialog v-model:visible="includeVisible" :initialOt="includeInitialOt" :reasons="store.reasons" :loading="store.actionLoading" @submit="includeOt" />
    <CalificarActaDialog v-model:visible="qualifyVisible" :currentValue="store.header?.calificacion" :loading="store.actionLoading" @submit="qualify" />
    <TransferirOtDialog v-model:visible="transferVisible" :selectedNumbers="store.selectedOtNumbers" :documentNumber="store.number" :loading="store.actionLoading" @submit="transfer" @error="showError" />
    <NotaDetalleDialog v-model:visible="noteVisible" :title="noteTitle" :note="noteText" />

    <ConfirmActionDialog
      v-model:visible="confirmVisible"
      :title="confirmConfig.title"
      :message="confirmConfig.message"
      :detail="confirmConfig.detail"
      :confirmLabel="confirmConfig.label"
      :severity="confirmConfig.severity"
      :loading="store.actionLoading"
      @confirm="executeConfirmedAction"
    />

    <FmAlertDialog v-model:visible="alertVisible" title="Certificación Contratista" :message="alertMessage" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import DocumentoHeader from '../components/DocumentoHeader.vue'
import OtsDetalleGrid from '../components/OtsDetalleGrid.vue'
import ActividadDialog from '../dialogs/ActividadDialog.vue'
import ExcluirOtsDialog from '../dialogs/ExcluirOtsDialog.vue'
import IncluirOtDialog from '../dialogs/IncluirOtDialog.vue'
import CalificarActaDialog from '../dialogs/CalificarActaDialog.vue'
import TransferirOtDialog from '../dialogs/TransferirOtDialog.vue'
import NotaDetalleDialog from '../dialogs/NotaDetalleDialog.vue'
import ConfirmActionDialog from '../dialogs/ConfirmActionDialog.vue'
import { EXCLUDED_OPTIONS, FLOW_OPTIONS, OT_DETAIL_COLUMNS } from '../config/documentos'
import { useDetalleDocumentoStore } from '../stores/detalleDocumentoStore'
import { useExcelExport } from '@/composables/useExportExcel'
import { validarTraspaso } from '../api/certificacionApi'

const props = defineProps({ tipo: { type: String, default: '' }, numero: { type: String, default: '' } })
const route = useRoute()
const router = useRouter()
const store = useDetalleDocumentoStore()
const activePanels = ref(['filters', 'rows'])
const activityVisible = ref(false)
const activityLoading = ref(false)
const activeOt = ref(null)
const excludeVisible = ref(false)
const includeVisible = ref(false)
const includeInitialOt = ref('')
const qualifyVisible = ref(false)
const transferVisible = ref(false)
const transferValidationLoading = ref(false)
const noteVisible = ref(false)
const noteText = ref('')
const noteTitle = ref('Detalle de nota')
const confirmAction = ref('')
const alertMessage = ref('')
const alertVisible = computed({ get: () => Boolean(alertMessage.value || store.error || store.message), set: (value) => { if (!value) { alertMessage.value = ''; store.error = ''; store.message = '' } } })
const activeOtDetail = computed(() => activeOt.value ? store.detailByOt[activeOt.value.numeroOT ?? activeOt.value.nroOT] ?? null : null)
const isDocumentEditable = computed(() => {
  if (store.config.documentType === 'NOTA_CREDITO') return false
  const status = String(store.header?.estado ?? store.header?.estadoActa ?? store.header?.estadoNota ?? '').toLowerCase()
  return !status.includes('cerrad') && !status.includes('certific')
})
const confirmVisible = computed({ get: () => Boolean(confirmAction.value), set: (value) => { if (!value) confirmAction.value = '' } })
const confirmConfig = computed(() => ({
  'validate-rules': { title: 'Validar reglas', message: `¿Ejecutar la validación para ${store.selectedOtNumbers.length} OT(s)?`, detail: store.selectedOtNumbers.join(', '), label: 'VALIDAR', severity: 'warning' },
  'validate-activities': { title: 'Validar actividades', message: `¿Validar actividades de ${store.selectedOtNumbers.length} OT(s)?`, detail: store.selectedOtNumbers.join(', '), label: 'VALIDAR', severity: 'warning' },
  certify: { title: 'Certificar acta', message: `¿Confirmás la certificación del acta ${store.number}?`, detail: 'Esta acción verifica previamente que no existan OTs fallidas pendientes.', label: 'CERTIFICAR', severity: 'warning' },
  'transfer-related-notes': { title: 'OTs relacionadas con notas', message: 'El acta está certificada y existen OTs relacionadas con notas de débito o crédito en curso.', detail: '¿Deseás continuar igualmente con el traspaso?', label: 'CONTINUAR', severity: 'warning' },
  close: { title: `Cerrar ${store.config.label}`, message: `¿Confirmás el cierre definitivo del documento ${store.number}?`, detail: 'El documento dejará de admitir modificaciones.', label: 'CERRAR', severity: 'danger' }
}[confirmAction.value] ?? { title: '', message: '', detail: '', label: 'CONFIRMAR', severity: 'warning' }))

const initialize = async () => {
  const type = props.tipo || route.params.tipo
  const number = props.numero || route.params.numero
  store.configure(type, number)
  await store.load()
}
onMounted(initialize)
watch(() => [props.tipo, props.numero, route.params.tipo, route.params.numero], initialize)

const goBack = () => router.back()
const showError = (message) => { alertMessage.value = message }
const openOtDetail = async (row) => {
  activeOt.value = row
  activityLoading.value = true
  activityVisible.value = true
  try { await store.loadOtDetail(row) } catch (cause) { showError(cause instanceof Error ? cause.message : 'No fue posible cargar el detalle de la OT.') } finally { activityLoading.value = false }
}
const reloadActiveOt = async () => { if (activeOt.value) await store.loadOtDetail(activeOt.value, { force: true }) }
const openNote = (row) => {
  const number = row?.numeroOT ?? row?.nroOT ?? ''
  noteTitle.value = number ? `Nota de la OT ${number}` : 'Detalle de nota'
  noteText.value = String(row?.notaTraspasoTexto ?? row?.nota ?? '').slice(0, 200)
  noteVisible.value = true
}
const openTransfer = async () => {
  if (!store.selectedOtNumbers.length) return
  transferValidationLoading.value = true
  try {
    const result = await validarTraspaso({ nroActa: store.number, nroOts: store.selectedOtNumbers })
    const hasRelatedNotes = String(result?.hayNotas ?? '').toLowerCase() === 'true'
    const status = String(store.header?.estado ?? store.header?.estadoActa ?? '').toLowerCase()
    if (status.includes('certific') && hasRelatedNotes) {
      confirmAction.value = 'transfer-related-notes'
      return
    }
    transferVisible.value = true
  } catch (cause) {
    showError(cause instanceof Error ? cause.message : 'No fue posible validar el traspaso.')
  } finally {
    transferValidationLoading.value = false
  }
}
const openInclude = (row) => { includeInitialOt.value = row?.numeroOT ?? row?.nroOT ?? ''; includeVisible.value = true }
const excludeOts = async (payload) => { try { await store.exclude(payload); excludeVisible.value = false } catch {} }
const includeOt = async (payload) => { try { await store.include(payload); includeVisible.value = false } catch {} }
const qualify = async (value) => { try { await store.qualify(value); qualifyVisible.value = false } catch {} }
const saveActivities = async (activities) => { try { await store.saveActivities(activeOt.value, activities) } catch {} }
const addActivity = async (payload) => { try { await store.createActivity(activeOt.value, payload) } catch {} }
const saveIncident = async ({ nroOI, nroEHS }) => { try { await store.saveIncident(activeOt.value, nroOI, nroEHS) } catch {} }
const activeOtNumber = () => activeOt.value?.numeroOT ?? activeOt.value?.nroOT
const validateActiveOtRules = async () => {
  try { await store.validateRuleNumbers([activeOtNumber()]); await reloadActiveOt() } catch {}
}
const validateActiveOtActivities = async () => {
  try { await store.validateActivityNumbers([activeOtNumber()]); await reloadActiveOt() } catch {}
}
const verifyActiveOtNetwork = async () => {
  try { await store.verifyNetwork(activeOt.value); await reloadActiveOt() } catch {}
}
const transfer = async ({ validation, transfer: transferPayload }) => { try { await store.runAction(async () => { const { validarTraspaso, ejecutarTraspaso } = await import('../api/certificacionApi'); await validarTraspaso(validation); await ejecutarTraspaso(transferPayload); await store.load() }, 'El traspaso fue procesado correctamente.'); transferVisible.value = false } catch {} }
const executeConfirmedAction = async () => {
  try {
    if (confirmAction.value === 'validate-rules') await store.validateRules()
    if (confirmAction.value === 'validate-activities') await store.validateActivities()
    if (confirmAction.value === 'certify') await store.certify()
    if (confirmAction.value === 'close') await store.closeDocument()
    if (confirmAction.value === 'transfer-related-notes') transferVisible.value = true
    confirmAction.value = ''
  } catch {}
}
const exportDetail = async () => {
  try {
    const rows = await store.exportRows(String(store.header?.estado ?? '').toLowerCase().includes('certific'))
    const data = Array.isArray(rows) ? rows : []
    const fields = Object.keys(data[0] ?? {}).filter((field) => !field.startsWith('__'))
    const { exportToExcel } = useExcelExport()
    await exportToExcel({ rows: data, fields, columns: fields.map((field) => ({ field, header: field.replace(/([A-Z])/g, ' $1').toUpperCase() })), filename: `${store.config.label.replace(/\s+/g, '_')}_${store.number}.xlsx` })
  } catch (cause) { showError(cause instanceof Error ? cause.message : 'No fue posible exportar el documento.') }
}
</script>
