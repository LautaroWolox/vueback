<template>
  <Dialog
    :visible="visible"
    appendTo="body"
    modal
    :closable="false"
    :draggable="false"
    :resizable="false"
    class="jobtype-alta-dialog cmo-modificar-dialog"
    :pt="{ root: { class: 'cmo-modificar-dialog' } }"
    @update:visible="$emit('update:visible', $event)"
    @hide="onHide"
  >
    <FmTypingLoader
      v-if="saving"
      overlay
      title="Actualizando relación"
      message="Guardando el nuevo CMO"
    />

    <template #header>
      <div class="jobtype-alta-header" style="grid-template-columns: minmax(0, 1fr) 52px">
        <h2 class="jobtype-alta-header__title" style="margin-left: 20px">
          Modificar CMO - Actividad
        </h2>

        <button
          type="button"
          class="jobtype-alta-header__close"
          style="justify-self: center; margin-left: 0"
          title="Cerrar"
          aria-label="Cerrar"
          :disabled="saving"
          @click="cerrar"
        >×</button>
      </div>
    </template>

    <div class="jobtype-alta-content">
      <div
        class="jobtype-alta-form cmo-modificar-form"
      >
        <div
          class="jobtype-alta-field fm-field"
          style="width: 100% !important; min-width: 0 !important; max-width: none !important"
        >
          <label for="mod-actividad">Actividad</label>
          <InputText
            id="mod-actividad"
            :modelValue="actividadDisplay"
            class="jobtype-alta-control"
            disabled
          />
        </div>

        <div
          class="jobtype-alta-field fm-field"
          style="width: 100% !important; min-width: 0 !important; max-width: none !important"
        >
          <label for="mod-cmo-actual">CMO actual</label>
          <InputText
            id="mod-cmo-actual"
            :modelValue="cmoActualDisplay"
            class="jobtype-alta-control"
            disabled
          />
        </div>

        <div
          class="jobtype-alta-field fm-field"
          style="width: 100% !important; min-width: 0 !important; max-width: none !important"
        >
          <label for="mod-nuevo-cmo">Nuevo CMO</label>
          <AutoComplete
            id="mod-nuevo-cmo"
            v-model="nuevoCmo"
            :suggestions="cmoSuggestions"
            optionLabel="valor"
            :minLength="3"
            :loading="cmoLoading"
            class="jobtype-alta-control"
            inputClass="jobtype-alta-control"
            aria-required="true"
            placeholder="Escriba 3+ caracteres..."
            :disabled="saving"
            @complete="onSearchCmo"
          />
        </div>
      </div>

      <div v-if="errorMessage" class="cmo-modificar-error">
        <p class="cmo-modificar-error__item">{{ errorMessage }}</p>
      </div>
    </div>

    <template #footer>
      <FmButton
        label="ACTUALIZAR"
        class="jobtype-relate-button"
        :disabled="!canActualizar || saving"
        @click="actualizar"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import AutoComplete from 'primevue/autocomplete'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import FmTypingLoader from '@/components/shared/FmTypingLoader.vue'

import { useCmoActividadStore } from '../store/cmoActividadStore'
import type { CmoAutocomplete, RelCmoActividad } from '../store/types'

const props = defineProps<{
  visible: boolean
  relacion: RelCmoActividad | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

const store = useCmoActividadStore()
const confirm = useConfirm()
const toast = useToast()

const nuevoCmo = ref<CmoAutocomplete | string | null>(null)
const cmoSuggestions = ref<CmoAutocomplete[]>([])
const cmoLoading = ref(false)
const saving = ref(false)
const errorMessage = ref<string | null>(null)

let cmoTimer: ReturnType<typeof setTimeout> | null = null

const actividadDisplay = computed(() => {
  if (!props.relacion) return ''
  return `${props.relacion.codigoActividad} - ${props.relacion.descActividad}`
})

const cmoActualDisplay = computed(() => {
  if (!props.relacion) return ''
  return `${props.relacion.codigoS4} - ${props.relacion.cmo}`
})

const canActualizar = computed(() => {
  return nuevoCmo.value !== null && typeof nuevoCmo.value === 'object'
})

const normalize = (value: unknown) => String(value ?? '').trim().toUpperCase()
const isActive = (value: unknown) => normalize(value) === 'S'

const existsActiveDuplicate = (cmo: CmoAutocomplete) =>
  store.rows.some((row) =>
    row.actividadManoObraId !== props.relacion?.actividadManoObraId &&
    isActive(row.activo) &&
    normalize(row.codigoActividad) === normalize(props.relacion?.codigoActividad) &&
    normalize(row.codigoS4) === normalize(cmo.codigoS4)
  )

watch(
  () => props.visible,
  (val) => {
    if (val) {
      nuevoCmo.value = null
      cmoSuggestions.value = []
      errorMessage.value = null
      saving.value = false
    }
  }
)

const onSearchCmo = (event: { query: string }) => {
  if (cmoTimer) clearTimeout(cmoTimer)
  cmoLoading.value = true

  cmoTimer = setTimeout(async () => {
    try {
      cmoSuggestions.value = await store.searchCmo(event.query)
    } catch {
      cmoSuggestions.value = []
    } finally {
      cmoLoading.value = false
    }
  }, 300)
}

const actualizar = async () => {
  if (!canActualizar.value || !props.relacion || saving.value) return

  saving.value = true
  errorMessage.value = null

  try {
    const cmo = nuevoCmo.value as CmoAutocomplete

    if (existsActiveDuplicate(cmo)) {
      errorMessage.value = 'La relación CMO-Actividad ya existe y se encuentra activa.'
      return
    }

    const response = await store.modificarRelacion(
      props.relacion.actividadManoObraId,
      cmo.id
    )

    if (response?.mensaje) {
      errorMessage.value = response.mensaje
    } else {
      toast.add({
        severity: 'success',
        summary: 'Relación modificada',
        detail: 'El CMO fue actualizado correctamente',
        life: 3000,
      })
      resetAndClose()
      emit('saved')
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error de conexión con el servidor',
      life: 5000,
    })
  } finally {
    saving.value = false
  }
}

const cerrar = () => {
  if (nuevoCmo.value !== null && typeof nuevoCmo.value === 'object') {
    confirm.require({
      group: 'cmo-actividad',
      message: 'Hay datos ingresados, confirma que desea cancelar?',
      header: 'Confirmar cierre',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Aceptar',
      rejectLabel: 'Cancelar',
      accept: () => {
        resetAndClose()
      },
    })
  } else {
    resetAndClose()
  }
}

const resetAndClose = () => {
  nuevoCmo.value = null
  cmoSuggestions.value = []
  errorMessage.value = null
  saving.value = false
  emit('update:visible', false)
}

const onHide = () => {
  nuevoCmo.value = null
  cmoSuggestions.value = []
  errorMessage.value = null
}
</script>
