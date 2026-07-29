<template>
  <Dialog
    :visible="visible"
    append-to="body"
    modal
    :closable="false"
    :close-on-escape="false"
    :draggable="false"
    :resizable="false"
    class="cmo-actividad-alta-dialog"
    :style="dialogStyle"
    @update:visible="onVisibleChange"
  >
    <template #header>
      <div class="alta-header">
        <h2>Alta CMO - Actividad</h2>
        <button type="button" class="alta-close" title="Cerrar" aria-label="Cerrar" @click="close">×</button>
      </div>
    </template>

    <div class="alta-content">
      <div class="alta-form">
        <div class="alta-field">
          <label for="alta-cmo-actividad">Actividad</label>
          <InputText
            id="alta-cmo-actividad"
            v-model="form.actividad"
            class="alta-control"
            :invalid="attempted && !form.actividad.trim()"
          />
        </div>

        <div class="alta-field">
          <label for="alta-cmo-valor">CMO</label>
          <InputText
            id="alta-cmo-valor"
            v-model="form.cmo"
            class="alta-control"
            :invalid="attempted && !form.cmo.trim()"
          />
        </div>

        <FmButton label="AGREGAR" class="alta-add-button" @click="addPreview" />
      </div>

      <div class="alta-grid">
        <ParametrizacionGrid
          table-id="tabla-alta-cmo-actividad"
          :columns="columns"
          :rows="previewRows"
          :selected="selectedPreview"
          :rows-per-page-options="[10]"
          :initial-rows="10"
          :filterable="false"
          :sortable="false"
          :resizable-columns="false"
          :show-rows-select="false"
          :show-counter="false"
          :show-export="false"
          :show-edit="false"
          :show-refresh="false"
          :show-add="false"
          actions-size="large"
          empty-text="No hay relaciones agregadas"
          @update:selected="selectedPreview = $event"
          @delete="removePreview"
        />
      </div>
    </div>

    <template #footer>
      <FmButton
        label="RELACIONAR"
        class="alta-submit-button"
        :disabled="previewRows.length === 0"
        @click="submit"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import ParametrizacionGrid from '../shared/ParametrizacionGrid.vue'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'submit'])

const dialogStyle = 'width: min(980px, calc(100vw - 48px)); max-width: 980px; height: min(560px, calc(100dvh - 48px)); max-height: calc(100dvh - 48px);'

const columns = [
  { field: 'codigoActividad', header: 'CODIGO_ACTIVIDAD', width: '25%' },
  { field: 'descActividad', header: 'DESC_ACTIVIDAD', width: '25%' },
  { field: 'codigoS4', header: 'CODIGO_S4', width: '25%' },
  { field: 'cmo', header: 'CMO', width: '25%' }
]

const form = reactive({
  actividad: '',
  cmo: ''
})

const previewRows = ref([])
const selectedPreview = ref(null)
const attempted = ref(false)

watch(() => props.visible, (visible) => {
  if (visible) reset()
})

const resetForm = () => {
  form.actividad = ''
  form.cmo = ''
  attempted.value = false
}

const reset = () => {
  resetForm()
  previewRows.value = []
  selectedPreview.value = null
}

const addPreview = () => {
  attempted.value = true
  if (!form.actividad.trim() || !form.cmo.trim()) return

  const codigoActividad = form.actividad.trim().toUpperCase()
  const cmo = form.cmo.trim()
  const duplicated = previewRows.value.some(
    (row) => row.codigoActividad === codigoActividad && row.cmo === cmo
  )
  if (duplicated) return

  const row = {
    id: `${Date.now()}-${codigoActividad}`,
    codigoActividad,
    descActividad: form.actividad.trim(),
    codigoS4: '',
    cmo
  }

  previewRows.value = [...previewRows.value, row]
  selectedPreview.value = row
  resetForm()
}

const removePreview = () => {
  if (!selectedPreview.value) return
  previewRows.value = previewRows.value.filter((row) => row.id !== selectedPreview.value.id)
  selectedPreview.value = null
}

const close = () => {
  emit('update:visible', false)
  reset()
}

const onVisibleChange = (visible) => {
  if (!visible) close()
}

const submit = () => {
  if (!previewRows.value.length) return
  emit('submit', [...previewRows.value])
  close()
}
</script>

<style scoped>
.alta-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.alta-header h2 {
  margin: 0;
  color: #263746;
  font-size: 18px;
  font-weight: 500;
}

.alta-close {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #a5afb4;
  font-size: 22px;
  cursor: pointer;
}

.alta-close:hover {
  color: #00a9bd;
}

.alta-content {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 16px;
  padding: 4px 0;
}

.alta-form {
  max-width: 760px;
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(220px, 1fr) 120px;
  align-items: end;
  gap: 14px;
}

.alta-field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.alta-field label {
  color: #263746;
  font-size: 12px;
  font-weight: 600;
}

.alta-control {
  width: 100%;
  min-width: 0;
  height: 34px;
}

.alta-add-button,
.alta-submit-button {
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
}

.alta-grid {
  min-height: 0;
  overflow: hidden;
}

:global(.p-dialog.cmo-actividad-alta-dialog) {
  overflow: hidden;
  border-radius: 6px;
}

:global(.cmo-actividad-alta-dialog .p-dialog-content) {
  min-height: 0;
  flex: 1 1 auto;
  overflow: hidden;
  padding: 14px 18px;
}

:global(.cmo-actividad-alta-dialog .p-dialog-footer) {
  padding: 10px 18px 14px;
  border-top: 1px solid #d9dfe2;
}

@media (max-width: 720px) {
  .alta-form {
    grid-template-columns: minmax(0, 1fr);
  }

  .alta-add-button {
    width: 100% !important;
    max-width: none !important;
  }
}
</style>
