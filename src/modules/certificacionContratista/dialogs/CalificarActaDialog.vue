<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Calificar acta"
    class="fm-dialog certificacion-contratista-dialog certificacion-contratista-qualify-dialog"
    :style="{ width: 'min(480px, calc(100vw - 28px))' }"
    @show="value = currentValue || ''"
  >
    <div class="certificacion-contratista-dialog__content">
      <p>Seleccioná la calificación que corresponde al acta.</p>
      <div class="certificacion-contratista-rating-options">
        <button v-for="option in options" :key="option.value" type="button" :class="['certificacion-contratista-rating-option', { 'is-selected': value === option.value }]" @click="value = option.value">
          <i :class="option.icon" aria-hidden="true" />
          <span>{{ option.label }}</span>
        </button>
      </div>
    </div>
    <template #footer>
      <div class="certificacion-contratista-dialog__footer">
        <FmButton label="CANCELAR" variant="outline" :disabled="loading" @click="visible = false" />
        <FmButton label="GUARDAR" :disabled="!value" :loading="loading" @click="$emit('submit', value)" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
const visible = defineModel('visible', { type: Boolean, default: false })
defineProps({ currentValue: { type: String, default: '' }, loading: { type: Boolean, default: false } })
defineEmits(['submit'])
const value = ref('')
const options = [
  { label: 'Mala', value: 'MALA', icon: 'pi pi-thumbs-down' },
  { label: 'Regular', value: 'REGULAR', icon: 'pi pi-minus-circle' },
  { label: 'Buena', value: 'BUENA', icon: 'pi pi-thumbs-up' },
  { label: 'Muy buena', value: 'MUY_BUENA', icon: 'pi pi-star' }
]
</script>
