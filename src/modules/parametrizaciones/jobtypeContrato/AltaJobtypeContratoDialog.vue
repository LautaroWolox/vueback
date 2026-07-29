<template>
  <Dialog
    :visible="visible"
    append-to="body"
    modal
    :closable="false"
    :close-on-escape="false"
    :draggable="false"
    :resizable="false"
    class="jobtype-contrato-alta-dialog"
    :style="dialogStyle"
    @update:visible="onVisibleChange"
  >
    <template #header>
      <div class="alta-header">
        <h2>Alta Jobtype - Contrato</h2>
        <ParametrizacionCloseButton @click="close" />
      </div>
    </template>

    <div class="alta-content">
      <div class="alta-form">
        <div class="alta-field">
          <label for="alta-contrato-pais">País</label>
          <Select
            id="alta-contrato-pais"
            v-model="form.pais"
            :options="paisOptions"
            option-label="label"
            option-value="value"
            class="alta-control"
          />
        </div>

        <div class="alta-field">
          <label for="alta-contrato-jobtype">Jobtype</label>
          <InputText
            id="alta-contrato-jobtype"
            v-model="form.jobtype"
            class="alta-control"
            :invalid="attempted && !form.jobtype.trim()"
          />
        </div>

        <div class="alta-field">
          <label for="alta-contrato-nombre">Contrato</label>
          <InputText
            id="alta-contrato-nombre"
            v-model="form.nombreContrato"
            class="alta-control"
            :invalid="attempted && !form.nombreContrato.trim()"
          />
        </div>

        <div class="alta-field">
          <label for="alta-contrato-origen">Origen</label>
          <Select
            id="alta-contrato-origen"
            v-model="form.origen"
            :options="origenOptions"
            option-label="label"
            option-value="value"
            class="alta-control"
          />
        </div>

        <ParametrizacionButton
          label="AGREGAR"
          class="alta-add-button"
          @click="addPreview"
        />
      </div>

      <div class="alta-grid">
        <ParametrizacionGrid
          table-id="tabla-alta-jobtype-contrato"
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
      <ParametrizacionButton
        label="RELACIONAR"
        :disabled="previewRows.length === 0"
        @click="submit"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import ParametrizacionGrid from '../shared/ParametrizacionGrid.vue'
import ParametrizacionButton from '../shared/ParametrizacionButton.vue'
import ParametrizacionCloseButton from '../shared/ParametrizacionCloseButton.vue'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'submit'])

const dialogStyle = 'width: min(980px, calc(100vw - 48px)); max-width: 980px; height: min(560px, calc(100dvh - 48px)); max-height: calc(100dvh - 48px);'

const columns = [
  { field: 'codigoTarea', header: 'CODIGO_TAREA', width: '20%' },
  { field: 'tarea', header: 'TAREA', width: '20%' },
  { field: 'origen', header: 'ORIGEN', width: '20%' },
  { field: 'nombreContrato', header: 'NOMBRE_CONTRATO', width: '20%' },
  { field: 'pais', header: 'PAIS', width: '20%' }
]

const paisOptions = [
  { label: '', value: '' },
  { label: 'ARG/UY', value: 'ARG/UY' },
  { label: 'PY', value: 'PY' }
]

const form = reactive({
  pais: '',
  jobtype: '',
  nombreContrato: '',
  origen: ''
})

const previewRows = ref([])
const selectedPreview = ref(null)
const attempted = ref(false)

const origenOptions = computed(() => {
  const values = form.pais === 'PY' ? ['FAN'] : ['', 'FAN', 'MXM']
  return values.map((value) => ({ label: value, value }))
})

watch(() => form.pais, (pais) => {
  if (!pais) {
    form.origen = ''
    return
  }

  if (pais === 'PY') {
    form.origen = 'FAN'
    return
  }

  if (!['', 'FAN', 'MXM'].includes(form.origen)) form.origen = ''
})

watch(() => props.visible, (visible) => {
  if (visible) reset()
})

const resetForm = () => {
  form.pais = ''
  form.jobtype = ''
  form.nombreContrato = ''
  form.origen = ''
  attempted.value = false
}

const reset = () => {
  resetForm()
  previewRows.value = []
  selectedPreview.value = null
}

const isValid = () => Boolean(
  form.pais &&
  form.jobtype.trim() &&
  form.nombreContrato.trim() &&
  form.origen
)

const addPreview = () => {
  attempted.value = true
  if (!isValid()) return

  const codigoTarea = form.jobtype.trim().toUpperCase()
  const duplicated = previewRows.value.some((row) => row.codigoTarea === codigoTarea)
  if (duplicated) return

  const row = {
    id: `${Date.now()}-${codigoTarea}`,
    codigoTarea,
    tarea: form.jobtype.trim(),
    origen: form.origen,
    nombreContrato: form.nombreContrato.trim(),
    pais: form.pais
  }

  previewRows.value = [...previewRows.value, row]
  selectedPreview.value = row

  form.jobtype = ''
  form.nombreContrato = ''
  form.origen = form.pais === 'PY' ? 'FAN' : ''
  attempted.value = false
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

.alta-content {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 16px;
  padding: 4px 0;
}

.alta-form {
  display: grid;
  grid-template-columns: 105px minmax(150px, 1fr) minmax(170px, 1fr) 105px 120px;
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

.alta-grid {
  min-height: 0;
  overflow: hidden;
}

:global(.p-dialog.jobtype-contrato-alta-dialog) {
  overflow: hidden;
  border-radius: 6px;
}

:global(.jobtype-contrato-alta-dialog .p-dialog-content) {
  min-height: 0;
  flex: 1 1 auto;
  overflow: hidden;
  padding: 14px 18px;
}

:global(.jobtype-contrato-alta-dialog .p-dialog-footer) {
  padding: 10px 18px 14px;
  border-top: 1px solid #d9dfe2;
}

@media (max-width: 800px) {
  .alta-form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .alta-add-button {
    width: 100%;
  }

  .alta-add-button :deep(.p-button) {
    width: 100% !important;
    min-width: 0 !important;
    max-width: none !important;
  }
}
</style>
