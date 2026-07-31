<template>
  <FmFormDialog
    :visible="visible"
    title="Edición Jobtype-Contrato"
    size="lg"
    :draggable="true"
    :dirty="hayCambios"
    class="jc-edit-dialog"
    @update:visible="$emit('update:visible', $event)"
    @close="cerrar"
  >
    <div class="jc-edit-content">
      <!-- Fila 1: campos de sólo lectura -->
      <div class="jc-edit-field">
        <label for="jc-edit-jobtype">JobType</label>
        <InputText
          id="jc-edit-jobtype"
          :model-value="jobtype"
          disabled
          class="jc-edit-control jc-edit-control--readonly"
        />
      </div>

      <div class="jc-edit-field">
        <label for="jc-edit-contrato-actual">Contrato</label>
        <InputText
          id="jc-edit-contrato-actual"
          :model-value="contratoActual"
          disabled
          class="jc-edit-control jc-edit-control--readonly"
        />
      </div>

      <div class="jc-edit-field">
        <label for="jc-edit-pais">País</label>
        <InputText
          id="jc-edit-pais"
          :model-value="pais"
          disabled
          class="jc-edit-control jc-edit-control--readonly"
        />
      </div>

      <!-- Fila 2: nuevo contrato -->
      <div class="jc-edit-field jc-edit-field--nuevo">
        <label for="jc-edit-nuevo-contrato">Nuevo Contrato</label>
        <AutoComplete
          id="jc-edit-nuevo-contrato"
          v-model="nuevoContrato"
          :suggestions="contratoSuggestions"
          option-label="valor"
          :min-length="4"
          class="jc-edit-control"
          input-class="jc-edit-control"
          @complete="buscarContratos"
          @item-select="onContratoSelect"
          @clear="contratoSelectedItem = null"
        />
      </div>
    </div>

    <template #footer>
      <FmButton
        label="ACTUALIZAR"
        :disabled="!puedeActualizar"
        @click="actualizar"
      />
    </template>
  </FmFormDialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useJobtypeContratoStore } from '../store/jobtypeContratoStore'

const props = defineProps({
  visible:         { type: Boolean, default: false },
  tareaContratoId: { type: Number,  default: 0 },
  jobtype:         { type: String,  default: '' },
  contratoActual:  { type: String,  default: '' },
  pais:            { type: String,  default: '' }
})

const emit = defineEmits(['update:visible', 'actualizado'])

const store = useJobtypeContratoStore()

const nuevoContrato       = ref('')
const contratoSuggestions = ref([])
const contratoSelectedItem = ref(null)

const hayCambios    = computed(() => Boolean(contratoSelectedItem.value))
const puedeActualizar = computed(() => hayCambios.value)

watch(() => props.visible, (val) => {
  if (val) {
    nuevoContrato.value        = ''
    contratoSelectedItem.value = null
  }
})

const buscarContratos = async (event) => {
  contratoSuggestions.value = await store.buscarContratos(event.query)
}

const onContratoSelect = (event) => {
  contratoSelectedItem.value = event.value
}

const actualizar = async () => {
  if (!puedeActualizar.value) return
  try {
    await store.actualizarRelacion(props.tareaContratoId, contratoSelectedItem.value.contratoId)
    cerrar()
    emit('actualizado')
  } catch { /* error en store.error */ }
}

const cerrar = () => {
  nuevoContrato.value        = ''
  contratoSelectedItem.value = null
  emit('update:visible', false)
}
</script>

<style scoped>
.jc-edit-content {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-areas:
    'jobtype contrato pais'
    'nuevo   .        .   ';
  align-items: start;
  column-gap: 20px;
  row-gap: 14px;
  padding: 16px 0 24px;
}

.jc-edit-field                  { min-width: 0; display: flex; flex-direction: column; gap: 7px; }
.jc-edit-field:nth-child(1)     { grid-area: jobtype; }
.jc-edit-field:nth-child(2)     { grid-area: contrato; }
.jc-edit-field:nth-child(3)     { grid-area: pais; }
.jc-edit-field--nuevo           { grid-area: nuevo; }

.jc-edit-field > label {
  color: #202020;
  font-size: var(--fm-font-size-base);
  font-weight: 600;
}

.jc-edit-control {
  width: 100%;
  height: 32px;
  min-height: 32px;
  box-sizing: border-box;
}

.jc-edit-control--readonly:disabled {
  border-color: #d1d1d1;
  background: #eeeeee;
  color: #444;
  opacity: 1;
}

@media (max-width: 760px) {
  .jc-edit-content {
    grid-template-columns: 1fr;
    grid-template-areas:
      'jobtype'
      'contrato'
      'pais'
      'nuevo';
    row-gap: 14px;
    padding: 16px 0 18px;
  }
}
</style>
