<template>
  <div class="fm-screen certificacion-contratista-page certificacion-contratista-rules-page">
    <Accordion v-model:value="activePanels" multiple class="fm-accordion">
      <AccordionPanel value="filters">
        <AccordionHeader>FILTROS DE BÚSQUEDA</AccordionHeader>
        <AccordionContent>
          <form class="certificacion-contratista-filters" @submit.prevent="search">
            <div class="fm-filter-grid certificacion-contratista-filters__grid certificacion-contratista-rule-filters">
              <div class="fm-field"><label for="rules-type">Tipo de regla</label><Select id="rules-type" v-model="filters.tipo" :options="types" optionLabel="label" optionValue="value" placeholder="Todos" showClear class="fm-select" /></div>
              <div class="fm-field"><label for="rules-name">Nombre de regla</label><InputText id="rules-name" v-model.trim="filters.nombre" /></div>
            </div>
            <div class="fm-actions certificacion-contratista-filters__actions">
              <FmButton label="LIMPIAR" variant="outline" type="button" @click="clear" />
              <FmButton label="BUSCAR" type="submit" :loading="loading" />
            </div>
          </form>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="results">
        <AccordionHeader>REGLAS</AccordionHeader>
        <AccordionContent>
          <div class="fm-grid-shell certificacion-contratista-grid-shell">
            <DataTable :value="rows" :loading="loading" scrollable scrollHeight="flex" removableSort class="fm-pass-grid certificacion-contratista-grid">
              <template #empty><div class="fm-grid-empty">{{ searched ? 'No se encontraron reglas.' : 'Presioná BUSCAR para consultar las reglas.' }}</div></template>
              <Column v-for="column in columns" :key="column.field" :field="column.field" :header="column.header" sortable :style="{ minWidth: column.width }">
                <template #body="slotProps"><span class="fm-cell-text">{{ slotProps.data[column.field] ?? '-' }}</span></template>
              </Column>
            </DataTable>
            <div class="certificacion-contratista-grid-footer-actions">
              <FmButton label="EXPORTAR" icon="pi-file-excel" variant="outline" :disabled="!rows.length" @click="exportRows" />
              <FmButton label="NUEVA REGLA" icon="pi-plus" @click="newRuleVisible = true" />
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <ReglaDialog v-model:visible="newRuleVisible" :types="types" :loading="actionLoading" @submit="create" @error="showMessage" />
    <FmAlertDialog v-model:visible="alertVisible" title="Gestión de reglas" :message="message" />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import InputText from 'primevue/inputtext'
import ReglaDialog from '../dialogs/ReglaDialog.vue'
import { buscarReglas, crearRegla, fetchRuleTypes } from '../api/certificacionApi'
import { useExcelExport } from '@/composables/useExportExcel'

const activePanels = ref(['filters', 'results'])
const types = ref([])
const filters = reactive({ tipo: '', nombre: '' })
const rows = ref([])
const loading = ref(false)
const actionLoading = ref(false)
const searched = ref(false)
const newRuleVisible = ref(false)
const message = ref('')
const alertVisible = computed({ get: () => Boolean(message.value), set: (value) => { if (!value) message.value = '' } })
const columns = [
  { field: 'nombreRegla', header: 'NOMBRE REGLA', width: '190px' }, { field: 'tipoRegla', header: 'TIPO REGLA', width: '150px' }, { field: 'fechaVigenciaDesde', header: 'VIGENCIA DESDE', width: '135px' }, { field: 'fechaVigenciaHasta', header: 'VIGENCIA HASTA', width: '135px' }, { field: 'usuarioModificacion', header: 'USUARIO MODIFICACIÓN', width: '170px' }, { field: 'fechaModificacion', header: 'FECHA MODIFICACIÓN', width: '155px' }, { field: 'activo', header: 'ACTIVO', width: '90px' }, { field: 'homologado', header: 'HOMOLOGADO', width: '115px' }, { field: 'descripcion', header: 'DESCRIPCIÓN', width: '240px' }
]

onMounted(async () => { try { types.value = await fetchRuleTypes() } catch (cause) { showMessage(cause instanceof Error ? cause.message : 'No fue posible cargar los tipos de regla.') } })
const search = async () => { loading.value = true; try { const response = await buscarReglas(filters); rows.value = Array.isArray(response) ? response : []; searched.value = true } catch (cause) { rows.value = []; searched.value = true; showMessage(cause instanceof Error ? cause.message : 'No fue posible buscar las reglas.') } finally { loading.value = false } }
const clear = () => { Object.assign(filters, { tipo: '', nombre: '' }); rows.value = []; searched.value = false }
const create = async (payload) => { actionLoading.value = true; try { const response = await crearRegla(payload); newRuleVisible.value = false; showMessage(response?.respuesta ?? response?.message ?? 'La regla fue creada correctamente.'); await search() } catch (cause) { showMessage(cause instanceof Error ? cause.message : 'No fue posible crear la regla.') } finally { actionLoading.value = false } }
const showMessage = (value) => { message.value = value }
const exportRows = async () => { const { exportToExcel } = useExcelExport(); await exportToExcel({ rows: rows.value, fields: columns.map((column) => column.field), columns, filename: 'Reglas_certificacion.xlsx' }) }
</script>
