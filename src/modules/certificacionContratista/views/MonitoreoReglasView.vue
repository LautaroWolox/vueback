<template>
  <div class="fm-screen certificacion-contratista-page certificacion-contratista-monitor-page">
    <Accordion v-model:value="activePanels" multiple class="fm-accordion">
      <AccordionPanel value="monitor">
        <AccordionHeader>MONITOREO Y EJECUCIÓN DE REGLAS</AccordionHeader>
        <AccordionContent>
          <div class="certificacion-contratista-monitor-summary">
            <div><span>Última ejecución</span><strong>{{ rows[0]?.inicioEjecucion || '-' }}</strong></div>
            <div><span>Estado</span><strong>{{ rows[0]?.estatusEjecucion || 'Sin ejecuciones' }}</strong></div>
            <div><span>En ejecución</span><strong>{{ running ? 'Sí' : 'No' }}</strong></div>
            <div class="fm-actions"><FmButton label="ACTUALIZAR" icon="pi-refresh" variant="outline" :loading="loading" @click="load" /><FmButton label="EJECUTAR REGLAS" icon="pi-play" :disabled="running" :loading="actionLoading" @click="confirmVisible = true" /></div>
          </div>
          <div class="fm-grid-shell certificacion-contratista-grid-shell">
            <DataTable :value="rows" :loading="loading" scrollable scrollHeight="flex" removableSort sortField="inicioEjecucion" :sortOrder="-1" class="fm-pass-grid certificacion-contratista-grid">
              <template #empty><div class="fm-grid-empty">No existen ejecuciones registradas.</div></template>
              <Column v-for="column in columns" :key="column.field" :field="column.field" :header="column.header" sortable :style="{ minWidth: column.width }">
                <template #body="slotProps"><span v-if="column.field === 'estatusEjecucion'" :class="['certificacion-contratista-flow-tag', statusClass(slotProps.data)]">{{ slotProps.data[column.field] || '-' }}</span><span v-else class="fm-cell-text">{{ slotProps.data[column.field] ?? '-' }}</span></template>
              </Column>
            </DataTable>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
    <ConfirmActionDialog v-model:visible="confirmVisible" title="Ejecutar reglas" message="¿Confirmás la ejecución general del motor de reglas?" detail="Mientras haya una ejecución activa no podrá iniciarse otra." confirmLabel="EJECUTAR" :loading="actionLoading" @confirm="run" />
    <FmAlertDialog v-model:visible="alertVisible" title="Monitoreo de reglas" :message="message" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import ConfirmActionDialog from '../dialogs/ConfirmActionDialog.vue'
import { cargarMonitoreoReglas, ejecutarReglas } from '../api/certificacionApi'

const activePanels = ref(['monitor'])
const rows = ref([])
const loading = ref(false)
const actionLoading = ref(false)
const confirmVisible = ref(false)
const message = ref('')
const alertVisible = computed({ get: () => Boolean(message.value), set: (value) => { if (!value) message.value = '' } })
const running = computed(() => rows.value.some((item) => item.estatusEjecucionNombreCorto === 'ENEJ' || String(item.estatusEjecucion).toLowerCase().includes('ejecución')))
const columns = [
  { field: 'inicioEjecucion', header: 'INICIO EJECUCIÓN', width: '160px' }, { field: 'finalEjecucion', header: 'FINAL EJECUCIÓN', width: '160px' }, { field: 'usuarioEjecucion', header: 'USUARIO', width: '135px' }, { field: 'estatusEjecucion', header: 'ESTADO', width: '150px' }, { field: 'domicilio', header: 'DOMICILIO', width: '210px' }, { field: 'nombre', header: 'PROCESO', width: '180px' }, { field: 'descripcionEstado', header: 'DESCRIPCIÓN', width: '260px' }
]
const statusClass = (row) => { const value = String(row.estatusEjecucionNombreCorto ?? row.estatusEjecucion ?? '').toLowerCase(); if (value.includes('enej') || value.includes('ejec')) return 'is-progress'; if (value.includes('ok') || value.includes('fin')) return 'is-success'; if (value.includes('error') || value.includes('fall')) return 'is-danger'; return 'is-neutral' }
const load = async () => { loading.value = true; try { const response = await cargarMonitoreoReglas(); rows.value = Array.isArray(response) ? response : [] } catch (cause) { message.value = cause instanceof Error ? cause.message : 'No fue posible cargar el monitoreo.' } finally { loading.value = false } }
const run = async () => { actionLoading.value = true; try { const response = await ejecutarReglas(); confirmVisible.value = false; message.value = response?.respuesta ?? 'La ejecución fue iniciada.'; await load() } catch (cause) { message.value = cause instanceof Error ? cause.message : 'No fue posible ejecutar las reglas.' } finally { actionLoading.value = false } }
onMounted(load)
</script>
