<template>
  <Dialog
    v-model:visible="visible"
    modal
    maximizable
    :header="`Detalle de OT ${otNumber}`"
    class="fm-dialog certificacion-contratista-dialog certificacion-contratista-activity-dialog"
    :style="{ width: 'min(1180px, calc(100vw - 24px))' }"
    @show="initialize"
  >
    <div v-if="loading" class="certificacion-contratista-dialog-loader">
      <ProgressSpinner style="width: 42px; height: 42px" strokeWidth="4" />
      <span>Cargando detalle de la orden…</span>
    </div>

    <div v-else class="certificacion-contratista-activity-layout">
      <section class="certificacion-contratista-ot-summary">
        <div><span>Tarea</span><strong>{{ detail?.tarea || row?.tarea || '-' }}</strong></div>
        <div><span>Domicilio</span><strong>{{ detail?.domicilio || row?.direccion || '-' }}</strong></div>
        <div><span>Técnico</span><strong>{{ detail?.tecnicoCierre || row?.tecnicoCierre || row?.techNum || '-' }}</strong></div>
        <div><span>Flujo</span><strong>{{ detail?.reglaFlujo || row?.validado || '-' }}</strong></div>
        <div><span>Clase OT</span><strong>{{ detail?.claseOt || row?.claseOT || '-' }}</strong></div>
      </section>

      <nav class="certificacion-contratista-tabs" aria-label="Secciones del detalle">
        <button v-for="tab in tabs" :key="tab.value" type="button" :class="{ 'is-active': activeTab === tab.value }" @click="activeTab = tab.value">
          <i :class="tab.icon" aria-hidden="true" />
          {{ tab.label }}
          <span v-if="tab.count !== undefined">{{ tab.count }}</span>
        </button>
      </nav>

      <section v-if="activeTab === 'activities'" class="certificacion-contratista-tab-panel">
        <div class="certificacion-contratista-section-toolbar">
          <div>
            <h3>Actividades resultantes</h3>
            <p>Modificá cantidades, activá o desactivá actividades y guardá todos los cambios juntos.</p>
          </div>
          <FmButton v-if="editable" label="AGREGAR ACTIVIDAD" icon="pi-plus" variant="outline" @click="showAddForm = !showAddForm" />
        </div>

        <div v-if="editable && showAddForm" class="certificacion-contratista-inline-form">
          <div class="fm-field fm-field--span-2">
            <label for="activity-code">Actividad *</label>
            <AutoComplete
              id="activity-code"
              v-model="newActivity.selected"
              :suggestions="activitySuggestions"
              optionLabel="valor"
              forceSelection
              dropdown
              @complete="searchActivitySuggestions"
            />
          </div>
          <div class="fm-field">
            <label for="activity-quantity">Cantidad</label>
            <InputNumber id="activity-quantity" v-model="newActivity.quantity" :min="0" :minFractionDigits="0" :maxFractionDigits="2" />
          </div>
          <div class="fm-field fm-field--span-2">
            <label for="activity-description">Descripción</label>
            <InputText id="activity-description" v-model="newActivity.description" />
          </div>
          <div class="fm-field fm-field--span-2">
            <label for="activity-reason">Motivo *</label>
            <InputText id="activity-reason" v-model="newActivity.reason" />
          </div>
          <label class="certificacion-contratista-checkbox-line">
            <Checkbox v-model="newActivity.modifyHistory" binary />
            <span>Modificar histórico</span>
          </label>
          <div class="fm-actions">
            <FmButton label="CANCELAR" variant="outline" @click="resetNewActivity" />
            <FmButton label="AGREGAR" :disabled="!newActivity.selected || !newActivity.reason" :loading="actionLoading" @click="addActivity" />
          </div>
        </div>

        <div class="fm-grid-shell certificacion-contratista-subgrid-shell">
          <DataTable :value="editableActivities" dataKey="idOtActiv" scrollable scrollHeight="360px" class="fm-pass-grid certificacion-contratista-subgrid">
            <template #empty><div class="fm-grid-empty">No hay actividades resultantes.</div></template>
            <Column field="codActividad" header="CÓDIGO" style="min-width: 105px" />
            <Column field="actividad" header="ACTIVIDAD" style="min-width: 220px" />
            <Column field="codCMO" header="CMO" style="min-width: 90px" />
            <Column field="cantidadOriginal" header="CANT. ORIGINAL" style="min-width: 115px" />
            <Column header="CANT. RESULTANTE" style="min-width: 145px">
              <template #body="slotProps"><InputNumber v-model="slotProps.data.cantidadResultante" :min="0" :minFractionDigits="0" :maxFractionDigits="2" :disabled="!editable" class="certificacion-contratista-quantity-input" /></template>
            </Column>
            <Column field="reglaAplicada" header="REGLA APLICADA" style="min-width: 160px" />
            <Column field="motivo" header="MOTIVO" style="min-width: 150px" />
            <Column header="ACTIVA" style="min-width: 80px">
              <template #body="slotProps"><Checkbox v-model="slotProps.data.__active" binary :disabled="!editable" /></template>
            </Column>
            <Column v-if="editable" header="ACCIONES" style="min-width: 82px">
              <template #body="slotProps">
                <button type="button" class="fm-grid-action-final" title="Eliminar actividad" aria-label="Eliminar actividad" @click="requestDelete(slotProps.data)"><i class="pi pi-trash" /></button>
              </template>
            </Column>
          </DataTable>
        </div>
        <div v-if="editable" class="certificacion-contratista-section-actions">
          <FmButton label="GUARDAR ACTIVIDADES" icon="pi-save" :disabled="!editableActivities.length" :loading="actionLoading" @click="saveActivities" />
        </div>
      </section>

      <section v-else-if="activeTab === 'originals'" class="certificacion-contratista-tab-panel">
        <h3>Actividades originales</h3>
        <div class="fm-grid-shell certificacion-contratista-subgrid-shell">
          <DataTable :value="originalActivities" scrollable scrollHeight="420px" class="fm-pass-grid certificacion-contratista-subgrid">
            <template #empty><div class="fm-grid-empty">No hay actividades originales.</div></template>
            <Column field="codActividad" header="CÓDIGO" style="min-width: 110px" />
            <Column field="actividad" header="ACTIVIDAD" style="min-width: 240px" />
            <Column field="codCMO" header="CMO" style="min-width: 110px" />
            <Column field="cantidadOriginal" header="CANTIDAD" style="min-width: 110px" />
            <Column field="activo" header="ACTIVA" style="min-width: 85px" />
            <Column field="comentario" header="COMENTARIO" style="min-width: 240px" />
          </DataTable>
        </div>
      </section>

      <section v-else-if="activeTab === 'history'" class="certificacion-contratista-tab-panel">
        <div class="certificacion-contratista-section-toolbar">
          <div>
            <h3>Historial del domicilio</h3>
            <p>Expandí cada OT para consultar sus actividades históricas.</p>
          </div>
          <FmButton label="EXPORTAR HISTORIAL" icon="pi-file-excel" variant="outline" :disabled="!completeHistoryRows.length" @click="exportHistory" />
        </div>
        <div class="fm-grid-shell certificacion-contratista-subgrid-shell">
          <DataTable
            v-model:expandedRows="expandedHistoryRows"
            :value="historyRows"
            dataKey="nroOt"
            scrollable
            scrollHeight="430px"
            class="fm-pass-grid certificacion-contratista-subgrid"
          >
            <template #empty><div class="fm-grid-empty">No hay historial disponible.</div></template>
            <Column expander style="width: 42px; min-width: 42px" />
            <Column v-for="column in historyColumns" :key="column.field" :field="column.field" :header="column.header" :style="{ minWidth: column.width }" />
            <template #expansion="slotProps">
              <div class="certificacion-contratista-history-expansion">
                <strong>Actividades de la OT {{ slotProps.data.nroOt }}</strong>
                <DataTable :value="slotProps.data.actividades ?? []" class="fm-pass-grid certificacion-contratista-nested-grid" scrollable>
                  <template #empty><div class="fm-grid-empty">No hay actividades para este registro histórico.</div></template>
                  <Column field="codActividad" header="CÓDIGO" style="min-width: 105px" />
                  <Column field="actividad" header="ACTIVIDAD" style="min-width: 230px" />
                  <Column field="codCMO" header="CMO" style="min-width: 100px" />
                  <Column field="cantidad" header="CANTIDAD" style="min-width: 100px" />
                  <Column field="reglaAplicada" header="REGLA" style="min-width: 170px" />
                  <Column field="validada" header="VALIDADA" style="min-width: 105px" />
                </DataTable>
              </div>
            </template>
          </DataTable>
        </div>
      </section>

      <section v-else-if="activeTab === 'materials'" class="certificacion-contratista-tab-panel">
        <h3>Materiales de la OT</h3>
        <div class="fm-grid-shell certificacion-contratista-subgrid-shell">
          <DataTable :value="materials" scrollable scrollHeight="430px" class="fm-pass-grid certificacion-contratista-subgrid">
            <template #empty><div class="fm-grid-empty">No hay materiales asociados.</div></template>
            <Column v-for="column in materialColumns" :key="column.field" :field="column.field" :header="column.header" :style="{ minWidth: column.width }" />
          </DataTable>
        </div>
      </section>

      <section v-else-if="activeTab === 'base'" class="certificacion-contratista-tab-panel">
        <h3>Base instalada</h3>
        <div class="fm-grid-shell certificacion-contratista-subgrid-shell">
          <DataTable :value="bases" scrollable scrollHeight="430px" class="fm-pass-grid certificacion-contratista-subgrid">
            <template #empty><div class="fm-grid-empty">No hay base instalada informada.</div></template>
            <Column v-for="column in baseColumns" :key="column.field" :field="column.field" :header="column.header" :style="{ minWidth: column.width }" />
          </DataTable>
        </div>
      </section>

      <section v-else class="certificacion-contratista-tab-panel certificacion-contratista-incident-panel">
        <h3>Datos de siniestro</h3>
        <div class="certificacion-contratista-inline-form certificacion-contratista-inline-form--incident">
          <div class="fm-field"><label for="incident-oi">N.º OI</label><InputText id="incident-oi" v-model="incident.nroOI" :disabled="!editable" /></div>
          <div class="fm-field"><label for="incident-ehs">N.º EHS</label><InputText id="incident-ehs" v-model="incident.nroEHS" :disabled="!editable" /></div>
          <div v-if="editable" class="fm-actions"><FmButton label="GUARDAR" icon="pi-save" :loading="actionLoading" @click="$emit('save-incident', { nroOI: incident.nroOI, nroEHS: incident.nroEHS })" /></div>
        </div>
      </section>
    </div>

    <template #footer>
      <div class="certificacion-contratista-dialog__footer certificacion-contratista-dialog__footer--activity">
        <FmButton v-if="documentType === 'ACTA'" label="VALIDAR/VERIFICAR" icon="pi-check-square" variant="outline" :loading="actionLoading" @click="$emit('validate-rules')" />
        <FmButton v-if="documentType !== 'ACTA'" label="VALIDAR ACTIVIDADES" icon="pi-list-check" variant="outline" :loading="actionLoading" @click="$emit('validate-activities')" />
        <FmButton v-if="documentType === 'NOTA_DEBITO' && canVerifyNetwork" label="VERIFICAR RED" icon="pi-verified" variant="outline" :loading="actionLoading" @click="$emit('verify-network')" />
        <FmButton label="CERRAR" variant="outline" @click="visible = false" />
      </div>
    </template>
  </Dialog>

  <ConfirmActionDialog
    v-model:visible="deleteVisible"
    title="Eliminar actividad"
    message="¿Confirmás que querés eliminar esta actividad?"
    :detail="activityToDelete ? `${activityToDelete.codActividad || ''} - ${activityToDelete.actividad || ''}` : ''"
    confirmLabel="ELIMINAR"
    severity="danger"
    :loading="actionLoading"
    @confirm="deleteActivity"
  />
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import Checkbox from 'primevue/checkbox'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import ConfirmActionDialog from './ConfirmActionDialog.vue'
import { useExcelExport } from '@/composables/useExportExcel'
import { buscarActividades, eliminarActividad } from '../api/certificacionApi'

const visible = defineModel('visible', { type: Boolean, default: false })
const props = defineProps({ row: { type: Object, default: null }, detail: { type: Object, default: null }, documentNumber: { type: String, default: '' }, documentType: { type: String, default: 'ACTA' }, editable: { type: Boolean, default: true }, loading: { type: Boolean, default: false }, actionLoading: { type: Boolean, default: false } })
const emit = defineEmits(['save-activities', 'add-activity', 'reload', 'save-incident', 'validate-rules', 'validate-activities', 'verify-network', 'error'])
const activeTab = ref('activities')
const editableActivities = ref([])
const showAddForm = ref(false)
const activitySuggestions = ref([])
const deleteVisible = ref(false)
const activityToDelete = ref(null)
const expandedHistoryRows = ref({})
const incident = reactive({ nroOI: '', nroEHS: '' })
const newActivity = reactive({ selected: null, quantity: 1, description: '', reason: '', modifyHistory: false })
const otNumber = computed(() => props.row?.numeroOT ?? props.row?.nroOT ?? '')
const originalActivities = computed(() => props.detail?.actividadesOriginales ?? [])
const editable = computed(() => props.editable)
const completeHistoryRows = computed(() => props.detail?.historialDomicilioCompleto ?? [])
const canVerifyNetwork = computed(() => String(props.detail?.tipoOT ?? props.row?.tipoOT ?? '').toUpperCase() === 'R'
  && String(props.detail?.reglaFlujo ?? props.row?.reglaFlujo ?? '').toUpperCase() === 'INIC')
const historyRows = computed(() => props.detail?.historialDomicilio?.length
  ? props.detail.historialDomicilio
  : (props.detail?.historialDomicilioCompleto ?? []))
const materials = computed(() => props.detail?.materiales ?? [])
const bases = computed(() => props.detail?.basesInstaladas ?? [])
const tabs = computed(() => [
  { value: 'activities', label: 'Resultantes', icon: 'pi pi-list-check', count: editableActivities.value.length },
  { value: 'originals', label: 'Originales', icon: 'pi pi-history', count: originalActivities.value.length },
  { value: 'history', label: 'Historial domicilio', icon: 'pi pi-home', count: historyRows.value.length },
  { value: 'materials', label: 'Materiales', icon: 'pi pi-box', count: materials.value.length },
  { value: 'base', label: 'Base instalada', icon: 'pi pi-server', count: bases.value.length },
  { value: 'incident', label: 'Siniestro', icon: 'pi pi-shield' }
])
const historyColumns = [
  { field: 'nroOt', header: 'N.º OT', width: '115px' },
  { field: 'fechaCierre', header: 'FECHA CIERRE', width: '135px' },
  { field: 'fechaCreacion', header: 'FECHA CREACIÓN', width: '140px' },
  { field: 'nroActa', header: 'ACTA / NOTA', width: '130px' },
  { field: 'contratista', header: 'CONTRATISTA', width: '180px' },
  { field: 'estadoOt', header: 'ESTADO OT', width: '120px' },
  { field: 'estadoActa', header: 'ESTADO DOCUMENTO', width: '155px' },
  { field: 'cantidad', header: 'CANTIDAD', width: '100px' }
]
const materialColumns = [
  { field: 'codigo', header: 'CÓDIGO', width: '120px' },
  { field: 'descripcion', header: 'DESCRIPCIÓN', width: '260px' },
  { field: 'cantidad', header: 'CANTIDAD', width: '100px' },
  { field: 'accion', header: 'ACCIÓN', width: '125px' },
  { field: 'estado', header: 'ESTADO', width: '120px' },
  { field: 'validado', header: 'VALIDADO', width: '110px' }
]
const baseColumns = [
  { field: 'baseInstalada', header: 'BASE INSTALADA', width: '240px' },
  { field: 'modelo', header: 'MODELO', width: '220px' },
  { field: 'nroSerie', header: 'N.º SERIE', width: '180px' }
]

const exportHistory = async () => {
  try {
    const rows = completeHistoryRows.value
    const fields = Object.keys(rows[0] ?? {})
    const { exportToExcel } = useExcelExport()
    await exportToExcel({
      rows,
      fields,
      columns: fields.map((field) => ({
        field,
        header: field.replace(/([A-Z])/g, ' $1').trim().toUpperCase()
      })),
      filename: `Historial_domicilio_OT_${otNumber.value}.xlsx`
    })
  } catch (cause) {
    emit('error', cause instanceof Error ? cause.message : 'No fue posible exportar el historial.')
  }
}

const initialize = () => {
  activeTab.value = 'activities'
  expandedHistoryRows.value = {}
  editableActivities.value = (props.detail?.actividadesResultantes ?? []).map((item) => ({ ...item, __active: String(item.activo ?? 'S').toUpperCase() !== 'N' }))
  incident.nroOI = props.detail?.nroOI ?? props.row?.nroOI ?? ''
  incident.nroEHS = props.detail?.nroEHS ?? ''
  resetNewActivity()
}

watch(visible, (isVisible) => {
  if (isVisible) initialize()
})

watch(() => props.detail, () => {
  if (visible.value) initialize()
}, { deep: true })
const resetNewActivity = () => { Object.assign(newActivity, { selected: null, quantity: 1, description: '', reason: '', modifyHistory: false }); showAddForm.value = false }
const searchActivitySuggestions = async ({ query }) => {
  if (!query || query.length < 3) { activitySuggestions.value = []; return }
  try { activitySuggestions.value = await buscarActividades(query) } catch (cause) { emit('error', cause instanceof Error ? cause.message : 'No fue posible buscar actividades.') }
}
const addActivity = () => {
  const selected = newActivity.selected
  emit('add-activity', { codActividad: selected?.codigo ?? selected?.valor, descripcion: newActivity.description || selected?.nombre || selected?.valor, motivo: newActivity.reason, modificarHistorico: newActivity.modifyHistory, cantidad: newActivity.quantity })
  resetNewActivity()
}
const saveActivities = () => emit('save-activities', editableActivities.value.map(({ __active, ...item }) => ({ ...item, activo: __active ? 'S' : 'N', cantidadResultante: Number(item.cantidadResultante ?? item.cantidad ?? 0), update: 'S' })))
const requestDelete = (activity) => { activityToDelete.value = activity; deleteVisible.value = true }
const deleteActivity = async () => {
  const activity = activityToDelete.value
  try {
    const payload = { modificarHistorico: false, nroOt: otNumber.value, nroActa: props.documentNumber, nroNotaDebito: props.documentNumber, descripcion: activity?.actividad ?? '', codActividad: activity?.codActividad ?? '', motivo: activity?.motivo ?? 'Eliminación desde detalle Vue' }
    await eliminarActividad(props.documentType, payload)
    deleteVisible.value = false
    emit('reload')
  } catch (cause) { emit('error', cause instanceof Error ? cause.message : 'No fue posible eliminar la actividad.') }
}
</script>
