<template>
  <div class="fm-screen certificacion-contratista-page certificacion-contratista-busqueda-ots">
    <Accordion v-model:value="activePanels" multiple class="fm-accordion">
      <AccordionPanel value="filters">
        <AccordionHeader>BÚSQUEDA DE OTS</AccordionHeader>
        <AccordionContent>
          <form class="certificacion-contratista-ots-entry" @submit.prevent="search">
            <div class="fm-field">
              <label for="gcc-ots">Órdenes de trabajo separadas por coma, espacio o salto de línea</label>
              <Textarea id="gcc-ots" v-model="rawOts" rows="7" placeholder="Ej.: 10000001, 10000002, 10000003" autoResize />
              <div class="certificacion-contratista-ots-counter"><span>{{ parsedOts.length }} OTs</span><span>Máximo: 1000</span></div>
            </div>
            <div class="fm-actions">
              <FmButton label="LIMPIAR" variant="outline" type="button" :disabled="loading" @click="clear" />
              <FmButton label="BUSCAR" type="submit" :loading="loading" :disabled="!parsedOts.length || parsedOts.length > 1000" />
            </div>
          </form>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="results">
        <AccordionHeader>RESULTADOS DE LA BÚSQUEDA</AccordionHeader>
        <AccordionContent>
          <div class="certificacion-contratista-result-tabs">
            <button type="button" :class="{ 'is-active': activeTab === 'all' }" @click="activeTab = 'all'">Todas <span>{{ rows.length }}</span></button>
            <button type="button" :class="{ 'is-active': activeTab === 'eligible' }" @click="activeTab = 'eligible'">Procesables <span>{{ eligibleRows.length }}</span></button>
            <button type="button" :class="{ 'is-active': activeTab === 'failed' }" @click="activeTab = 'failed'">GM fallidas <span>{{ failedRows.length }}</span></button>
            <button type="button" :class="{ 'is-active': activeTab === 'external' }" @click="loadExternal">Externas <span>{{ externalRows.length }}</span></button>
          </div>

          <div class="fm-grid-shell certificacion-contratista-grid-shell">
            <DataTable v-model:selection="selectedRows" :value="displayRows" :loading="loading || externalLoading" dataKey="nroOT" scrollable scrollHeight="flex" removableSort class="fm-pass-grid certificacion-contratista-grid">
              <template #empty><div class="fm-grid-empty">{{ searched ? 'No hay registros para esta categoría.' : 'Ingresá OTs y presioná BUSCAR.' }}</div></template>
              <Column v-if="activeTab === 'eligible'" selectionMode="multiple" style="width: 42px; min-width: 42px" />
              <Column v-for="column in currentColumns" :key="column.field" :field="column.field" :header="column.header" sortable :style="{ minWidth: column.width }">
                <template #body="slotProps"><span class="fm-cell-text">{{ slotProps.data[column.field] ?? '-' }}</span></template>
              </Column>
            </DataTable>
            <div class="certificacion-contratista-grid-footer-actions">
              <FmButton label="EXPORTAR" icon="pi-file-excel" variant="outline" :disabled="!displayRows.length" @click="exportCurrent" />
              <FmButton v-if="activeTab === 'eligible'" label="CAMBIAR TÉCNICO" icon="pi-user-edit" :disabled="!selectedRows.length" @click="techVisible = true" />
              <FmButton v-if="activeTab === 'failed'" label="ABRIR REPROCESO" icon="pi-external-link" @click="router.push({ name: 'ROTF' })" />
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <CambioTecnicoDialog v-model:visible="techVisible" :ots="selectedOtNumbers" :loading="actionLoading" @submit="changeTechnician" @error="showError" />
    <FmAlertDialog v-model:visible="alertVisible" title="Búsqueda de OTs" :message="message" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Textarea from 'primevue/textarea'
import CambioTecnicoDialog from '../dialogs/CambioTecnicoDialog.vue'
import { buscarOtsExternas, buscarOtsGcc, cambiarTecnicoOts } from '../api/certificacionApi'
import { useExcelExport } from '@/composables/useExportExcel'

const router = useRouter()
const rawOts = ref('')
const rows = ref([])
const externalRows = ref([])
const selectedRows = ref([])
const loading = ref(false)
const externalLoading = ref(false)
const actionLoading = ref(false)
const searched = ref(false)
const activePanels = ref(['filters', 'results'])
const activeTab = ref('all')
const techVisible = ref(false)
const message = ref('')
const alertVisible = computed({ get: () => Boolean(message.value), set: (value) => { if (!value) message.value = '' } })
const parsedOts = computed(() => [...new Set(rawOts.value.split(/[\s,;]+/).map((value) => value.trim()).filter(Boolean))])
const eligibleRows = computed(() => rows.value.filter((item) => item.esGmOk === 'SI' && item.statusOT === 'OT Cerrada' && item.tieneActividades === 'SI'))
const failedRows = computed(() => rows.value.filter((item) => item.esGmFallida === 'SI'))
const displayRows = computed(() => activeTab.value === 'eligible' ? eligibleRows.value : activeTab.value === 'failed' ? failedRows.value : activeTab.value === 'external' ? externalRows.value : rows.value)
const selectedOtNumbers = computed(() => selectedRows.value.map((item) => item.nroOT).filter(Boolean))
const mainColumns = [
  { field: 'nroOT', header: 'N.º OT', width: '120px' }, { field: 'nroOtSfs', header: 'N.º OT SFS', width: '120px' }, { field: 'statusOT', header: 'ESTADO OT', width: '130px' }, { field: 'statusWFX', header: 'ESTADO WFX', width: '130px' }, { field: 'fechaCierreOT', header: 'FECHA CIERRE', width: '140px' }, { field: 'nroTech', header: 'N.º TECH', width: '110px' }, { field: 'nombreTech', header: 'TÉCNICO', width: '170px' }, { field: 'resolutionCode', header: 'CÓD. SOLUCIÓN', width: '125px' }, { field: 'resolutionDesc', header: 'SOLUCIÓN', width: '190px' }, { field: 'contratista', header: 'CONTRATISTA', width: '175px' }, { field: 'baseTecnica', header: 'BASE TÉCNICA', width: '150px' }, { field: 'pais', header: 'PAÍS', width: '90px' }, { field: 'tieneActividades', header: 'ACTIVIDADES', width: '110px' }, { field: 'ubicacionOT', header: 'UBICACIÓN', width: '150px' }
]
const externalColumns = [
  { field: 'numeroOrdenTrabajo', header: 'N.º OT', width: '120px' }, { field: 'idOrdenTrabajo', header: 'N.º OT SFS', width: '120px' }, { field: 'statusOt', header: 'ESTADO WFX', width: '130px' }, { field: 'fechaCierre', header: 'FECHA CIERRE', width: '140px' }, { field: 'techId', header: 'N.º TECH', width: '110px' }, { field: 'techName', header: 'TÉCNICO', width: '170px' }, { field: 'codigoResolucion', header: 'CÓD. SOLUCIÓN', width: '125px' }, { field: 'descripcionResolucion', header: 'SOLUCIÓN', width: '190px' }, { field: 'ubicacionOT', header: 'UBICACIÓN', width: '150px' }
]
const currentColumns = computed(() => activeTab.value === 'external' ? externalColumns : mainColumns)

const search = async () => {
  if (!parsedOts.value.length || parsedOts.value.length > 1000) return
  loading.value = true; message.value = ''; selectedRows.value = []; externalRows.value = []
  try { rows.value = await buscarOtsGcc(parsedOts.value); searched.value = true; activeTab.value = 'all'; if (!rows.value.length) message.value = 'No se obtuvieron resultados.' }
  catch (cause) { rows.value = []; searched.value = true; showError(cause instanceof Error ? cause.message : 'No fue posible buscar las OTs.') }
  finally { loading.value = false }
}
const loadExternal = async () => {
  activeTab.value = 'external'
  if (externalRows.value.length || !searched.value) return
  externalLoading.value = true
  try {
    const found = rows.value.filter((item) => item.ubicacionOT !== 'No se encontró OT').map((item) => item.nroOT)
    const missing = rows.value.filter((item) => item.ubicacionOT === 'No se encontró OT').map((item) => item.nroOT)
    externalRows.value = await buscarOtsExternas(found, missing)
  } catch (cause) { showError(cause instanceof Error ? cause.message : 'No fue posible buscar OTs externas.') }
  finally { externalLoading.value = false }
}
const changeTechnician = async (payload) => {
  actionLoading.value = true
  try { const response = await cambiarTecnicoOts(payload); techVisible.value = false; message.value = typeof response === 'string' ? response : response?.respuesta ?? 'Las OTs fueron enviadas a procesar.'; await search() }
  catch (cause) { showError(cause instanceof Error ? cause.message : 'No fue posible cambiar el técnico.') }
  finally { actionLoading.value = false }
}
const clear = () => { rawOts.value = ''; rows.value = []; externalRows.value = []; selectedRows.value = []; searched.value = false; activeTab.value = 'all' }
const showError = (value) => { message.value = value }
const exportCurrent = async () => { const { exportToExcel } = useExcelExport(); await exportToExcel({ rows: displayRows.value, fields: currentColumns.value.map((column) => column.field), columns: currentColumns.value, filename: `Busqueda_OTs_${activeTab.value}.xlsx` }) }
</script>
