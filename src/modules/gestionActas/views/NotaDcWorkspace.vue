<template>
  <div class="gestion-actas-module gestion-nota-workspace">
    <header class="gestion-document-header">
      <FmButton
        label="VOLVER A NOTAS"
        icon="pi-arrow-left"
        variant="outline"
        @click="$emit('back')"
      />
      <div class="gestion-document-title">
        <span>{{ isDebit ? 'Nota de Débito' : 'Nota de Crédito' }}</span>
        <strong>{{ noteNumber }}</strong>
      </div>
      <span class="gestion-actas-state" :class="stateClass(note.estadoNota)">{{ note.estadoNota || 'Sin estado' }}</span>
    </header>

    <nav class="gestion-document-tabs" aria-label="Detalle de nota">
      <button type="button" :class="{ 'is-active': tab === 'resumen' }" @click="tab = 'resumen'">
        <i class="pi pi-id-card" /><span>Resumen</span>
      </button>
      <button type="button" :class="{ 'is-active': tab === 'ots' }" @click="openOtsTab">
        <i class="pi pi-list-check" /><span>Órdenes de Trabajo</span>
      </button>
      <button type="button" :class="{ 'is-active': tab === 'cierre' }" @click="tab = 'cierre'">
        <i class="pi pi-file-export" /><span>Exportar / Cierre</span>
      </button>
    </nav>

    <main class="gestion-document-body">
      <FmTypingLoader
        v-if="loading"
        overlay
        :title="`Cargando ${isDebit ? 'Nota de Débito' : 'Nota de Crédito'}`"
        :message="noteNumber"
      />

      <section v-if="tab === 'resumen'" class="gestion-document-summary">
        <article v-for="item in summary" :key="item.label" class="gestion-summary-card">
          <span>{{ item.label }}</span>
          <strong>{{ item.value || '-' }}</strong>
        </article>
      </section>

      <section v-else-if="tab === 'ots'" class="gestion-document-fill">
        <template v-if="!selectedOt">
          <div class="gestion-sectionbar">
            <div>
              <h3>Órdenes de Trabajo</h3>
              <p>Podés abrir varias OTs y alternar entre ellas sin perder el detalle consultado.</p>
            </div>
          </div>

          <ActasWorkspaceGrid
            :rows="noteOts"
            :columns="otColumns"
            data-key="numeroOT"
            title="Órdenes de Trabajo"
            show-export
            :export-filename="`${noteNumber}_OTs.xlsx`"
            empty-text="No hay OTs para esta Nota"
          >
            <template #cell-numeroOT="{ data }">
              <button type="button" class="gestion-actas-link" @click="openOt(data)">{{ data.numeroOT || data.nroOT }}</button>
            </template>
          </ActasWorkspaceGrid>
        </template>

        <template v-else>
          <div class="gestion-ot-header">
            <FmButton
              label="VOLVER A OTs"
              icon="pi-arrow-left"
              variant="outline"
              @click="closeOt"
            />
            <div>
              <span>Orden de Trabajo</span>
              <strong>{{ selectedOtNumber }}</strong>
            </div>
            <div class="gestion-ot-header__meta">
              <span>{{ selectedOt.tarea || selectedOt.codigoTarea || 'Sin tarea' }}</span>
              <span>{{ selectedOt.direccion || 'Sin domicilio' }}</span>
            </div>
          </div>

          <div class="gestion-open-ots" role="tablist" aria-label="OTs abiertas">
            <div
              v-for="ot in openedOts"
              :key="otNumber(ot)"
              class="gestion-open-ot"
              :class="{ 'is-active': selectedOtNumber === otNumber(ot) }"
            >
              <button type="button" class="gestion-open-ot__select" @click="activateOpenedOt(ot)">
                <i class="pi pi-briefcase" />
                <span>OT {{ otNumber(ot) }}</span>
              </button>
              <button
                type="button"
                class="gestion-open-ot__close"
                :aria-label="`Cerrar OT ${otNumber(ot)}`"
                @click.stop="closeOpenedOt(ot)"
              >×</button>
            </div>
          </div>

          <nav class="gestion-ot-tabs" aria-label="Detalle de Orden de Trabajo">
            <button
              v-for="item in otTabs"
              :key="item.key"
              type="button"
              :class="{ 'is-active': otTab === item.key }"
              @click="selectOtTab(item.key)"
            >
              <i class="pi" :class="item.icon" />
              <span>{{ item.label }}</span>
            </button>
          </nav>

          <div class="gestion-ot-body">
            <FmTypingLoader v-if="otLoading" overlay title="Cargando OT" :message="selectedOtNumber" />

            <section v-if="otTab === 'resumen'" class="gestion-document-summary gestion-document-summary--ot">
              <article v-for="item in otSummary" :key="item.label" class="gestion-summary-card">
                <span>{{ item.label }}</span>
                <strong>{{ item.value || '-' }}</strong>
              </article>
            </section>

            <section v-else-if="otTab === 'actividades'" class="gestion-activity-grids">
              <ActasWorkspaceGrid
                :rows="originalActivities"
                :columns="originalActivityColumns"
                data-key="codActividad"
                title="Actividades originales"
                show-export
                :export-filename="`OT_${selectedOtNumber}_Actividades_Originales.xlsx`"
                empty-text="No hay actividades originales"
              />
              <ActasWorkspaceGrid
                :rows="resultingActivities"
                :columns="resultActivityColumns"
                data-key="codActividad"
                title="Actividades resultantes"
                show-export
                :export-filename="`OT_${selectedOtNumber}_Actividades_Resultantes.xlsx`"
                empty-text="No hay actividades resultantes"
              />
            </section>

            <section v-else-if="otTab === 'bases'" class="gestion-document-fill">
              <ActasWorkspaceGrid
                :rows="installedBases"
                :columns="baseColumns"
                data-key="nroSerie"
                title="Base instalada"
                show-export
                :export-filename="`OT_${selectedOtNumber}_Base_Instalada.xlsx`"
                empty-text="No hay base instalada"
              />
            </section>

            <section v-else-if="otTab === 'historial'" class="gestion-document-fill">
              <ActasWorkspaceGrid
                :rows="historyRows"
                :columns="historyColumns"
                data-key="nroOt"
                title="Historial del domicilio"
                show-export
                :export-filename="`OT_${selectedOtNumber}_Historial.xlsx`"
                empty-text="No hay historial del domicilio"
              />
            </section>

            <section v-else class="gestion-document-fill">
              <ActasWorkspaceGrid
                :rows="materials"
                :columns="materialColumns"
                data-key="codigo"
                title="Materiales"
                show-export
                show-refresh
                :refresh-disabled="materialsLoading"
                :export-filename="`OT_${selectedOtNumber}_Materiales.xlsx`"
                empty-text="No hay materiales"
                @refresh="refreshMaterials"
              />
            </section>
          </div>
        </template>
      </section>

      <section v-else class="gestion-document-close">
        <article class="gestion-close-card">
          <i class="pi pi-file-excel" />
          <div>
            <h3>Exportar {{ isDebit ? 'Nota de Débito' : 'Nota de Crédito' }}</h3>
            <p>Genera el Excel desde los datos reales del backend usando el exportador común del proyecto.</p>
          </div>
          <FmButton
            label="EXPORTAR EXCEL"
            icon="pi-download"
            variant="outline"
            :loading="exportLoading"
            @click="exportNote"
          />
        </article>

        <article class="gestion-close-card gestion-close-card--primary">
          <i class="pi pi-lock" />
          <div>
            <h3>Cierre</h3>
            <p>El cierre utiliza el endpoint correspondiente de {{ isDebit ? 'Nota de Débito' : 'Nota de Crédito' }}.</p>
          </div>
          <FmButton
            :label="closed ? 'NOTA CERRADA' : `CERRAR ${isDebit ? 'NOTA DE DÉBITO' : 'NOTA DE CRÉDITO'}`"
            icon="pi-check-circle"
            :disabled="closed"
            :loading="actionLoading"
            @click="confirmClose = true"
          />
        </article>
      </section>
    </main>

    <Dialog
      v-model:visible="confirmClose"
      modal
      header="Confirmar cierre"
      :draggable="false"
      class="fm-dialog gestion-actas-dialog"
      :style="{ '--fm-dialog-width': '32rem' }"
    >
      <div class="gestion-actas-confirm">
        <i class="pi pi-exclamation-triangle" />
        <p>Se cerrará {{ isDebit ? 'la Nota de Débito' : 'la Nota de Crédito' }} <strong>{{ noteNumber }}</strong>. ¿Desea continuar?</p>
      </div>
      <template #footer>
        <FmButton label="CANCELAR" variant="outline" @click="confirmClose = false" />
        <FmButton label="CONFIRMAR" icon="pi-check" :loading="actionLoading" @click="closeNote" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import FmButton from '@/components/shared/FmButton.vue'
import FmTypingLoader from '@/components/shared/FmTypingLoader.vue'
import ActasWorkspaceGrid from '../components/ActasWorkspaceGrid.vue'
import { useExcelExport } from '@/composables/useExportExcel'
import { DOCUMENT_TYPES, useGestionActasStore } from '@/store/gestionActas'

const props = defineProps({
  type: { type: String, required: true },
  note: { type: Object, required: true },
})
defineEmits(['back'])

const store = useGestionActasStore()
const { exportToExcel } = useExcelExport()
const tab = ref('resumen')
const loading = ref(false)
const selectedOt = ref(null)
const openedOts = ref([])
const otTabByKey = ref({})
const otLoading = ref(false)
const materialsLoading = ref(false)
const exportLoading = ref(false)
const actionLoading = ref(false)
const confirmClose = ref(false)
const localClosed = ref(false)

const isDebit = computed(() => props.type === DOCUMENT_TYPES.NOTA_DEBITO)
const noteNumber = computed(() => String(props.note?.nroActaDC || props.note?.nroNota || ''))
const noteKey = computed(() => `${props.type}::${noteNumber.value}`)
const noteOts = computed(() => store.noteOts[noteKey.value] || [])
const selectedOtNumber = computed(() => String(selectedOt.value?.numeroOT || selectedOt.value?.nroOT || ''))
const otDetailKey = computed(() => `${props.type}::${noteNumber.value}::${selectedOtNumber.value}`)
const otTab = computed({
  get: () => otTabByKey.value[otDetailKey.value] || 'resumen',
  set: (value) => {
    if (otDetailKey.value) otTabByKey.value[otDetailKey.value] = value
  },
})
const currentOtDetail = computed(() => store.noteOtDetails[otDetailKey.value] || {})
const materials = computed(() => store.materialsByOt[selectedOtNumber.value] || [])
const closed = computed(() => localClosed.value || String(props.note?.estadoNota || '').toUpperCase().includes('CERR'))

const originalActivities = computed(() => currentOtDetail.value?.actividadesOriginales || [])
const resultingActivities = computed(() => currentOtDetail.value?.actividadesResultantes || [])
const installedBases = computed(() => currentOtDetail.value?.basesInstaladas || [])
const historyRows = computed(() => currentOtDetail.value?.historialDomicilio || [])

const summary = computed(() => [
  { label: isDebit.value ? 'Nota de Débito' : 'Nota de Crédito', value: noteNumber.value },
  { label: 'Acta asociada', value: props.note?.nroActa },
  { label: 'Estado', value: props.note?.estadoNota },
  { label: 'Período', value: props.note?.periodo },
  { label: 'Año', value: props.note?.anio },
  { label: 'Fecha de creación', value: props.note?.fechaCreacionDC },
  { label: 'Fecha de cierre', value: props.note?.fechaCierreDC },
  { label: 'Contratista', value: props.note?.contratista },
  { label: 'Provincia', value: props.note?.provincia },
  { label: 'Región', value: props.note?.region },
  { label: 'Tipo de contrato', value: props.note?.contrato },
  { label: 'Sociedad', value: props.note?.sociedad },
])

const otSummary = computed(() => {
  const row = selectedOt.value || {}
  const detail = currentOtDetail.value || {}
  return [
    { label: 'N° OT', value: selectedOtNumber.value },
    { label: 'Tarea', value: detail.tarea || row.tarea || row.codigoTarea },
    { label: 'Domicilio', value: detail.domicilio || row.direccion },
    { label: 'Ciudad', value: detail.ciudad || row.ciudad },
    { label: 'Técnico de cierre', value: detail.tecnicoCierre || row.tecnicoCierre },
    { label: 'N° Cliente', value: detail.nroCliente || row.nroCliente },
    { label: 'Regla / Flujo', value: detail.reglaFlujo || row.reglaFlujo },
    { label: 'Tipo OT', value: detail.tipoOT || row.tipoOT },
  ]
})

const otTabs = [
  { key: 'resumen', label: 'Resumen', icon: 'pi-id-card' },
  { key: 'actividades', label: 'Actividades', icon: 'pi-list-check' },
  { key: 'bases', label: 'Base instalada', icon: 'pi-server' },
  { key: 'historial', label: 'Historial', icon: 'pi-history' },
  { key: 'materiales', label: 'Materiales', icon: 'pi-box' },
]

const otColumns = [
  { field: 'numeroOT', header: 'NRO_OT', width: '128px' },
  { field: 'fechaCierre', header: 'FECHA_CIERRE', width: '138px' },
  { field: 'tarea', header: 'CÓDIGO_TAREA', width: '150px' },
  { field: 'direccion', header: 'DIRECCIÓN', width: '210px' },
  { field: 'ciudad', header: 'CIUDAD', width: '140px' },
  { field: 'provincia', header: 'PROVINCIA', width: '132px' },
  { field: 'region', header: 'REGIÓN', width: '125px' },
  { field: 'contratista', header: 'CONTRATISTA', width: '170px' },
  { field: 'contrato', header: 'CONTRATO', width: '140px' },
  { field: 'sociedad', header: 'SOCIEDAD', width: '130px' },
  { field: 'tecnicoCierre', header: 'TÉCNICO CIERRE', width: '145px' },
]
const originalActivityColumns = [
  { field: 'codActividad', header: 'CÓDIGO', width: '120px' },
  { field: 'actividad', header: 'ACTIVIDAD', width: '260px' },
  { field: 'cantidadOriginal', header: 'CANTIDAD', width: '110px' },
  { field: 'codCMO', header: 'CMO', width: '100px' },
  { field: 'cmo', header: 'DESCRIPCIÓN CMO', width: '190px' },
]
const resultActivityColumns = [
  { field: 'codActividad', header: 'CÓDIGO', width: '120px' },
  { field: 'actividad', header: 'ACTIVIDAD', width: '230px' },
  { field: 'cantidadResultante', header: 'CANTIDAD', width: '110px' },
  { field: 'codCMO', header: 'CMO', width: '100px' },
  { field: 'reglaTipo', header: 'TIPO REGLA', width: '110px' },
  { field: 'reglaAplicada', header: 'REGLA', width: '150px' },
  { field: 'comentario', header: 'COMENTARIO', width: '180px' },
  { field: 'motivo', header: 'MOTIVO', width: '150px' },
  { field: 'activo', header: 'ACTIVO', width: '90px' },
]
const baseColumns = [
  { field: 'baseInstalada', header: 'BASE INSTALADA', width: '220px' },
  { field: 'modelo', header: 'MODELO', width: '160px' },
  { field: 'nroSerie', header: 'N° SERIE', width: '170px' },
  { field: 'estado', header: 'ESTADO', width: '130px' },
]
const historyColumns = [
  { field: 'nroOt', header: 'NRO_OT', width: '130px' },
  { field: 'fechaCierre', header: 'FECHA_CIERRE', width: '150px' },
  { field: 'tarea', header: 'TAREA', width: '170px' },
  { field: 'tecnico', header: 'TÉCNICO', width: '160px' },
  { field: 'estado', header: 'ESTADO', width: '120px' },
]
const materialColumns = [
  { field: 'codigo', header: 'CÓDIGO', width: '130px' },
  { field: 'descripcion', header: 'DESCRIPCIÓN', width: '260px' },
  { field: 'cantidad', header: 'CANTIDAD', width: '110px' },
  { field: 'unidad', header: 'UNIDAD', width: '110px' },
]

const normalizeState = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
const stateClass = (value) => {
  const state = normalizeState(value)
  if (state.includes('CERR') || state.includes('CERT')) return 'is-success'
  if (state.includes('CURSO') || state.includes('PROCES')) return 'is-info'
  if (state.includes('PEND') || state.includes('ABIERT')) return 'is-warning'
  if (state.includes('ERROR') || state.includes('RECHAZ')) return 'is-danger'
  return 'is-neutral'
}

const loadOts = async () => {
  loading.value = true
  try { await store.loadNoteOts(props.type, props.note) }
  finally { loading.value = false }
}
const openOtsTab = async () => {
  tab.value = 'ots'
  if (!noteOts.value.length) await loadOts()
}
const otNumber = (row) => String(row?.numeroOT || row?.nroOT || '')
const activateOpenedOt = async (row) => {
  selectedOt.value = row
  const key = `${props.type}::${noteNumber.value}::${otNumber(row)}`
  if (!store.noteOtDetails[key]) {
    otLoading.value = true
    try {
      await store.loadNoteOtDetail({ type: props.type, nroNota: noteNumber.value, nroOt: otNumber(row) })
    } finally { otLoading.value = false }
  }
}
const openOt = async (row) => {
  if (!openedOts.value.some((item) => otNumber(item) === otNumber(row))) openedOts.value.push(row)
  await activateOpenedOt(row)
}
const closeOpenedOt = (row) => {
  const key = otNumber(row)
  const index = openedOts.value.findIndex((item) => otNumber(item) === key)
  if (index < 0) return
  const wasActive = selectedOtNumber.value === key
  openedOts.value.splice(index, 1)
  if (wasActive) selectedOt.value = openedOts.value[index] || openedOts.value[index - 1] || null
}
const closeOt = () => { selectedOt.value = null }
const selectOtTab = async (key) => {
  otTab.value = key
  if (key === 'materiales' && selectedOtNumber.value && !materials.value.length) await refreshMaterials()
}
const refreshMaterials = async () => {
  materialsLoading.value = true
  try { await store.loadOtMaterials(selectedOtNumber.value) }
  finally { materialsLoading.value = false }
}
const exportNote = async () => {
  exportLoading.value = true
  try {
    const rows = await store.loadNoteExportRows(noteNumber.value)
    if (!rows.length) return
    const fields = Object.keys(rows[0]).filter((field) => typeof rows[0]?.[field] !== 'object')
    const columns = fields.map((field) => ({ field, header: field.replaceAll('_', ' ').toUpperCase() }))
    await exportToExcel({ rows, fields, columns, filename: `${noteNumber.value}_${isDebit.value ? 'Nota_Debito' : 'Nota_Credito'}.xlsx`, columnTypes: {}, valueTransformers: {} })
  } finally { exportLoading.value = false }
}
const closeNote = async () => {
  actionLoading.value = true
  try {
    const response = await store.closeNote(props.type, noteNumber.value)
    if (response?.status === false) throw new Error(response?.mensaje || response?.respuesta || 'No se pudo cerrar la Nota.')
    localClosed.value = true
    confirmClose.value = false
  } finally { actionLoading.value = false }
}

watch(() => props.note, () => {
  tab.value = 'resumen'
  selectedOt.value = null
  openedOts.value = []
  otTabByKey.value = {}
  localClosed.value = false
}, { deep: true })

onMounted(loadOts)
</script>
