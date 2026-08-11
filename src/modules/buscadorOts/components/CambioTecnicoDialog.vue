<template>
  <Dialog
    :visible="visible"
    append-to="body"
    modal
    header="Cambio de Técnico"
    :draggable="false"
    :resizable="false"
    class="fm-dialog fm-responsive-dialog"
    :style="{ '--fm-dialog-width': '70rem' }"
    @update:visible="emit('update:visible', $event)"
  >
    <FmGridShell>
      <DataTable
        :value="rows"
        data-key="id"
        class="fm-pass-grid"
        table-style="table-layout: fixed; min-width: 760px; width: 100%"
        scrollable
        show-gridlines
      >
        <template #empty>
          <div class="fm-grid-empty">No hay órdenes seleccionadas</div>
        </template>
        <Column field="nroOt" header="Nro de OT" style="width: 130px" />
        <Column field="statusOt" header="Status de la OT" style="width: 150px" />
        <Column field="nroTech" header="Nro Tech" style="width: 130px" />
        <Column field="nombreTech" header="Nombre del Tech" style="width: 180px" />
        <Column field="fechaUltimaModificacion" header="Fecha Última Modificación de OT" style="width: 200px" />
      </DataTable>
    </FmGridShell>

    <div class="fm-filters">
      <div class="fm-filter-grid">
        <div class="fm-field fm-field--span-2">
          <label for="cambio-tech-id">TECH ID</label>
          <InputText
            id="cambio-tech-id"
            v-model="techId"
            autocomplete="off"
            @keyup.enter="searchTechnician"
          />
        </div>

        <div class="fm-field fm-field--span-2">
          <span class="fm-field__label">&nbsp;</span>
          <FmButton
            label="BUSCAR"
            @click="searchTechnician"
          />
        </div>

        <div class="fm-field fm-field--span-3">
          <label for="cambio-tech-empresa">EMPRESA CONTRATISTA</label>
          <InputText id="cambio-tech-empresa" v-model="empresaContratista" disabled />
        </div>

        <div class="fm-field fm-field--span-2">
          <label for="cambio-tech-base">BASE TÉCNICA</label>
          <InputText id="cambio-tech-base" v-model="baseTecnica" disabled />
        </div>

        <div class="fm-field fm-field--span-3">
          <label for="cambio-tech-provincia">PROVINCIA</label>
          <InputText id="cambio-tech-provincia" v-model="provincia" disabled />
        </div>

        <div class="fm-field--span-12">
          <label class="fm-field__label" for="cambio-tech-nota">NOTA</label>
          <Textarea
            id="cambio-tech-nota"
            v-model="nota"
            rows="3"
            fluid
            auto-resize
          />
        </div>
      </div>
    </div>

    <template #footer>
      <FmButton
        label="LIMPIAR"
        variant="outline"
        @click="clearForm"
      />
      <FmButton
        label="EJECUTAR"
        @click="execute"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import FmButton from '@/components/shared/FmButton.vue'
import FmGridShell from '@/components/shared/FmGridShell.vue'
import type { BuscadorOtRow } from '../store/types'
import { findMockTechnician, type MockTechnician } from '../mocks/reprocesoMocks'

const props = defineProps<{
  visible: boolean
  rows: BuscadorOtRow[]
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'alert', message: string): void
  (event: 'execute', payload: { rows: BuscadorOtRow[]; technician: MockTechnician; nota: string }): void
}>()

const techId = ref('')
const empresaContratista = ref('')
const baseTecnica = ref('')
const provincia = ref('')
const nota = ref('')
const resolvedTechnician = ref<MockTechnician | null>(null)

const clearTechnicianData = () => {
  resolvedTechnician.value = null
  empresaContratista.value = ''
  baseTecnica.value = ''
  provincia.value = ''
}

const clearForm = () => {
  techId.value = ''
  nota.value = ''
  clearTechnicianData()
}

watch(() => props.visible, (visible) => {
  if (visible) clearForm()
})

watch(techId, (value) => {
  if (!resolvedTechnician.value) return
  if (resolvedTechnician.value.techId !== value.trim().toUpperCase()) {
    clearTechnicianData()
  }
})

const searchTechnician = () => {
  const technician = findMockTechnician(techId.value)

  if (!technician) {
    clearTechnicianData()
    emit('alert', 'Verifique el Tech id ingresado, no es posible realizar la acción.')
    return
  }

  resolvedTechnician.value = technician
  techId.value = technician.techId
  empresaContratista.value = technician.empresaContratista
  baseTecnica.value = technician.baseTecnica
  provincia.value = technician.provincia
}

const execute = () => {
  if (!resolvedTechnician.value) {
    emit('alert', 'Verifique el Tech id ingresado, no es posible realizar la acción.')
    return
  }

  if (!nota.value.trim()) {
    emit('alert', 'La nota es obligatoria.')
    return
  }

  emit('execute', {
    rows: [...props.rows],
    technician: { ...resolvedTechnician.value },
    nota: nota.value.trim()
  })
}
</script>
