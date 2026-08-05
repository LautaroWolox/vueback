<template>
  <div class="fm-screen certificacion-contratista-page certificacion-contratista-batch-page">
    <Accordion v-model:value="activePanels" multiple class="fm-accordion">
      <AccordionPanel value="input">
        <AccordionHeader>PRUEBA MASIVA DE REGLAS</AccordionHeader>
        <AccordionContent>
          <form class="certificacion-contratista-ots-entry" @submit.prevent="confirmVisible = true">
            <div class="fm-field"><label for="batch-ots">OTs a procesar</label><Textarea id="batch-ots" v-model="rawOts" rows="8" placeholder="Ingresá las OTs separadas por coma, espacio o salto de línea" autoResize /><div class="certificacion-contratista-ots-counter"><span>{{ parsedOts.length }} OTs</span><span>Se procesarán individualmente</span></div></div>
            <div class="fm-actions"><FmButton label="LIMPIAR" variant="outline" type="button" :disabled="running" @click="clear" /><FmButton label="EJECUTAR PRUEBA" icon="pi-play" type="submit" :disabled="!parsedOts.length || running" /></div>
          </form>
        </AccordionContent>
      </AccordionPanel>
      <AccordionPanel value="results">
        <AccordionHeader>RESULTADOS</AccordionHeader>
        <AccordionContent>
          <div class="certificacion-contratista-batch-progress"><div><strong>{{ completed }}</strong><span>de {{ parsedOts.length }} procesadas</span></div><progress :value="completed" :max="Math.max(parsedOts.length, 1)" /></div>
          <div class="fm-grid-shell certificacion-contratista-grid-shell"><DataTable :value="results" scrollable scrollHeight="flex" class="fm-pass-grid certificacion-contratista-grid"><template #empty><div class="fm-grid-empty">Todavía no se ejecutaron pruebas.</div></template><Column field="ot" header="N.º OT" style="min-width: 130px" /><Column field="status" header="ESTADO" style="min-width: 120px"><template #body="slotProps"><span :class="['certificacion-contratista-flow-tag', slotProps.data.ok ? 'is-success' : 'is-danger']">{{ slotProps.data.status }}</span></template></Column><Column field="message" header="RESPUESTA" style="min-width: 360px" /></DataTable></div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
    <ConfirmActionDialog v-model:visible="confirmVisible" title="Ejecutar prueba masiva" :message="`¿Procesar ${parsedOts.length} OT(s)?`" detail="La ejecución se realizará de forma secuencial para no sobrecargar el motor de reglas." confirmLabel="EJECUTAR" :loading="running" @confirm="runBatch" />
    <FmAlertDialog v-model:visible="alertVisible" title="Prueba masiva" :message="message" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import Textarea from 'primevue/textarea'
import ConfirmActionDialog from '../dialogs/ConfirmActionDialog.vue'
import { ejecutarReglasDomicilio } from '../api/certificacionApi'

const activePanels = ref(['input', 'results'])
const rawOts = ref('')
const results = ref([])
const running = ref(false)
const confirmVisible = ref(false)
const message = ref('')
const alertVisible = computed({ get: () => Boolean(message.value), set: (value) => { if (!value) message.value = '' } })
const parsedOts = computed(() => [...new Set(rawOts.value.split(/[\s,;]+/).map((value) => value.trim()).filter(Boolean))])
const completed = computed(() => results.value.length)
const clear = () => { rawOts.value = ''; results.value = [] }
const runBatch = async () => {
  running.value = true; results.value = []
  try {
    for (const ot of parsedOts.value) {
      try { const response = await ejecutarReglasDomicilio(ot); results.value.push({ ot, ok: response?.status !== false, status: response?.status === false ? 'OBSERVADA' : 'PROCESADA', message: response?.respuesta ?? 'Solicitud enviada.' }) }
      catch (cause) { results.value.push({ ot, ok: false, status: 'ERROR', message: cause instanceof Error ? cause.message : 'Error no identificado.' }) }
    }
    confirmVisible.value = false
    message.value = `La prueba finalizó: ${results.value.filter((item) => item.ok).length} procesadas y ${results.value.filter((item) => !item.ok).length} observadas.`
  } finally { running.value = false }
}
</script>
