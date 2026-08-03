<template>
  <Dialog
    :visible="visible"
    modal
    appendTo="body"
    :draggable="true"
    :resizable="false"
    :style="dialogStyle"
    class="abm-materiales-dialog abm-materiales-edit-dialog"
    @update:visible="onVisibleChange"
  >
    <template #header>
      <div class="abm-materiales-dialog__header">
        <span>Editar Umbrales</span>
      </div>
    </template>

    <form class="abm-materiales-dialog__form" @submit.prevent="guardar">
      <div class="abm-materiales-dialog__field abm-materiales-dialog__field--full">
        <label for="edit-material-description">CÓDIGO - DESC MATERIAL</label>
        <InputText
          id="edit-material-description"
          :modelValue="codigoDescripcion"
          disabled
        />
      </div>

      <div class="abm-materiales-dialog__field">
        <label for="edit-min-threshold">UMBRAL MÍNIMO</label>
        <InputNumber
          id="edit-min-threshold"
          :modelValue="material?.umbralMinimo ?? 1"
          :useGrouping="false"
          disabled
        />
      </div>

      <div class="abm-materiales-dialog__field">
        <label for="edit-medium-threshold">UMBRAL MEDIO</label>
        <InputNumber
          id="edit-medium-threshold"
          v-model="form.umbralMedio"
          :useGrouping="false"
          :min="1"
          :max="9999"
          :invalid="Boolean(errors.umbralMedio)"
          inputmode="numeric"
        />
        <small v-if="errors.umbralMedio" class="abm-materiales-field-error">
          {{ errors.umbralMedio }}
        </small>
      </div>

      <div class="abm-materiales-dialog__field">
        <label for="edit-max-threshold">UMBRAL MÁXIMO</label>
        <InputNumber
          id="edit-max-threshold"
          v-model="form.umbralMaximo"
          :useGrouping="false"
          :min="1"
          :max="9999"
          :invalid="Boolean(errors.umbralMaximo)"
          inputmode="numeric"
        />
        <small v-if="errors.umbralMaximo" class="abm-materiales-field-error">
          {{ errors.umbralMaximo }}
        </small>
      </div>
    </form>

    <template #footer>
      <div class="abm-materiales-dialog__footer">
        <FmButton
          label="GRABAR"
          :loading="store.loading"
          @click="guardar"
        />
      </div>
    </template>
  </Dialog>

  <FmAlertDialog
    v-model:visible="alertVisible"
    title="Alerta"
    :message="alertMessage"
  />
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import FmButton from '@/components/shared/FmButton.vue'
import FmAlertDialog from '@/components/shared/FmAlertDialog.vue'
import { useAuthStore } from '@/store/auth'
import { useAbmMaterialesStore } from '../store/abmMaterialesStore'

const props = defineProps({
  visible: { type: Boolean, default: false },
  material: { type: Object, default: null }
})

const emit = defineEmits(['update:visible', 'saved'])
const store = useAbmMaterialesStore()
const authStore = useAuthStore()
const dialogStyle = 'width: min(560px, calc(100vw - 28px)); max-width: 560px;'

const form = reactive({
  umbralMedio: null,
  umbralMaximo: null
})

const errors = reactive({
  umbralMedio: '',
  umbralMaximo: ''
})

const alertVisible = ref(false)
const alertMessage = ref('')

const codigoDescripcion = computed(() => {
  if (!props.material) return ''
  return `${props.material.codigoMaterial} - ${props.material.descripcionMaterial}`
})

const reset = () => {
  form.umbralMedio = props.material?.umbralMedio ?? null
  form.umbralMaximo = props.material?.umbralMaximo ?? null
  errors.umbralMedio = ''
  errors.umbralMaximo = ''
}

watch(
  () => [props.visible, props.material],
  ([visible]) => {
    if (visible) reset()
  },
  { deep: true }
)

const validateInteger = (value, label) => {
  if (value === null || value === undefined || value === '') return `${label} no debe estar vacío.`
  if (!Number.isInteger(Number(value))) return `${label} debe ser numérico entero.`
  if (Number(value) <= 0) return `${label} debe ser mayor que 0.`
  if (Number(value) > 9999) return `${label} debe ser como máximo 9999.`
  return ''
}

const validate = () => {
  errors.umbralMedio = validateInteger(form.umbralMedio, 'El campo Umbral Medio')
  errors.umbralMaximo = validateInteger(form.umbralMaximo, 'El campo Umbral Máximo')

  if (!errors.umbralMedio && !errors.umbralMaximo && Number(form.umbralMedio) > Number(form.umbralMaximo)) {
    errors.umbralMedio = 'El campo Umbral Medio debe ser menor o igual al Umbral Máximo.'
  }

  return !errors.umbralMedio && !errors.umbralMaximo
}

const guardar = async () => {
  if (!props.material || !validate()) return

  try {
    const updated = await store.actualizarMaterial({
      codigoMaterial: props.material.codigoMaterial,
      umbralMedio: form.umbralMedio,
      umbralMaximo: form.umbralMaximo,
      usuarioModificacion: authStore.usuario?.legajo || authStore.legajo
    })

    emit('saved', updated)
    emit('update:visible', false)
  } catch (cause) {
    alertMessage.value = cause instanceof Error
      ? cause.message
      : 'No fue posible actualizar el material.'
    alertVisible.value = true
  }
}

const onVisibleChange = (value) => {
  emit('update:visible', value)
}
</script>
