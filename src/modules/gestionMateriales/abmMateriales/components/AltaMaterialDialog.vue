<template>
  <Dialog
    :visible="visible"
    modal
    appendTo="body"
    :draggable="true"
    :resizable="false"
    :style="dialogStyle"
    class="abm-materiales-dialog abm-materiales-add-dialog"
    @update:visible="onVisibleChange"
  >
    <template #header>
      <div class="abm-materiales-dialog__header">
        <span>Agregar Material</span>
      </div>
    </template>

    <template #closeicon>
      <span class="abm-materiales-dialog-close-icon" aria-hidden="true">×</span>
    </template>

    <form
      class="abm-materiales-dialog__form abm-materiales-dialog__form--add"
      @submit.prevent="guardar"
    >
      <div class="abm-materiales-dialog__field abm-materiales-dialog__field--code">
        <label for="add-material-code">CÓDIGO</label>
        <InputText
          id="add-material-code"
          v-model.trim="form.codigoMaterial"
          maxlength="50"
          :invalid="Boolean(errors.codigoMaterial)"
          autocomplete="off"
        />
        <small v-if="errors.codigoMaterial" class="abm-materiales-field-error">
          {{ errors.codigoMaterial }}
        </small>
      </div>

      <div class="abm-materiales-dialog__field abm-materiales-dialog__field--full">
        <label for="add-material-description">DESC MATERIAL</label>
        <InputText
          id="add-material-description"
          v-model.trim="form.descripcionMaterial"
          maxlength="200"
          :invalid="Boolean(errors.descripcionMaterial)"
          autocomplete="off"
        />
        <small v-if="errors.descripcionMaterial" class="abm-materiales-field-error">
          {{ errors.descripcionMaterial }}
        </small>
      </div>

      <div class="abm-materiales-dialog__field abm-materiales-dialog__field--threshold">
        <label for="add-min-threshold">UMBRAL MÍNIMO</label>
        <InputNumber
          id="add-min-threshold"
          :modelValue="1"
          :useGrouping="false"
          disabled
        />
      </div>

      <div class="abm-materiales-dialog__field abm-materiales-dialog__field--threshold">
        <label for="add-medium-threshold">UMBRAL MEDIO</label>
        <InputNumber
          id="add-medium-threshold"
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

      <div class="abm-materiales-dialog__field abm-materiales-dialog__field--threshold">
        <label for="add-max-threshold">UMBRAL MÁXIMO</label>
        <InputNumber
          id="add-max-threshold"
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
import { reactive, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import FmButton from '@/components/shared/FmButton.vue'
import FmAlertDialog from '@/components/shared/FmAlertDialog.vue'
import { useAuthStore } from '@/store/auth'
import { useAbmMaterialesStore } from '../store/abmMaterialesStore'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'created'])
const store = useAbmMaterialesStore()
const authStore = useAuthStore()
const dialogStyle = 'width: min(560px, calc(100vw - 28px)); max-width: 560px;'

const createInitialForm = () => ({
  codigoMaterial: '',
  descripcionMaterial: '',
  umbralMedio: null,
  umbralMaximo: null
})

const form = reactive(createInitialForm())
const errors = reactive({
  codigoMaterial: '',
  descripcionMaterial: '',
  umbralMedio: '',
  umbralMaximo: ''
})
const alertVisible = ref(false)
const alertMessage = ref('')

const reset = () => {
  Object.assign(form, createInitialForm())
  Object.keys(errors).forEach((key) => { errors[key] = '' })
}

watch(() => props.visible, (visible) => {
  if (visible) reset()
})

const validateInteger = (value, label) => {
  if (value === null || value === undefined || value === '') return `${label} no debe estar vacío.`
  if (!Number.isInteger(Number(value))) return `${label} debe ser numérico entero.`
  if (Number(value) <= 0) return `${label} debe ser mayor que 0.`
  if (Number(value) > 9999) return `${label} debe ser como máximo 9999.`
  return ''
}

const validate = () => {
  errors.codigoMaterial = form.codigoMaterial
    ? (form.codigoMaterial.length <= 50 ? '' : 'El Código debe tener como máximo 50 caracteres.')
    : 'El Código no debe estar vacío.'

  errors.descripcionMaterial = form.descripcionMaterial
    ? (form.descripcionMaterial.length <= 200 ? '' : 'La Descripción debe tener como máximo 200 caracteres.')
    : 'La Descripción no debe estar vacía.'

  errors.umbralMedio = validateInteger(form.umbralMedio, 'El campo Umbral Medio')
  errors.umbralMaximo = validateInteger(form.umbralMaximo, 'El campo Umbral Máximo')

  if (!errors.umbralMedio && !errors.umbralMaximo && Number(form.umbralMedio) > Number(form.umbralMaximo)) {
    errors.umbralMedio = 'El campo Umbral Medio debe ser menor o igual al Umbral Máximo.'
  }

  return Object.values(errors).every((message) => !message)
}

const guardar = async () => {
  if (!validate()) return

  try {
    const result = await store.crearMaterial({
      ...form,
      usuarioModificacion: authStore.usuario?.legajo || authStore.legajo
    })

    if (!result.ok) {
      alertMessage.value = result.reason === 'INACTIVE_EXISTS'
        ? 'Verificar material se encuentra desactivado'
        : 'Verificar material ya se encuentra activo'
      alertVisible.value = true
      return
    }

    emit('created', result.material)
    emit('update:visible', false)
  } catch (cause) {
    alertMessage.value = cause instanceof Error
      ? cause.message
      : 'No fue posible crear el material.'
    alertVisible.value = true
  }
}

const onVisibleChange = (value) => {
  emit('update:visible', value)
}
</script>
