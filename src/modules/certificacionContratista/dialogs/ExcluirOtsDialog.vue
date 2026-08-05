<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Excluir órdenes de trabajo"
    class="fm-dialog certificacion-contratista-dialog certificacion-contratista-operation-dialog"
    :style="{ width: 'min(620px, calc(100vw - 28px))' }"
    @show="reset"
  >
    <div class="certificacion-contratista-dialog__content">
      <div class="certificacion-contratista-selection-summary">
        <strong>{{ selectedNumbers.length }}</strong>
        <span>OT{{ selectedNumbers.length === 1 ? '' : 's' }} seleccionada{{ selectedNumbers.length === 1 ? '' : 's' }}</span>
        <small>{{ selectedNumbers.join(', ') }}</small>
      </div>

      <div class="fm-field">
        <label for="cert-exclusion-reason">Motivo de exclusión *</label>
        <Select id="cert-exclusion-reason" v-model="form.reason" :options="reasonOptions" optionLabel="label" optionValue="value" placeholder="Seleccionar motivo" filter class="fm-select" />
      </div>
      <div class="fm-field">
        <label for="cert-exclusion-note">Nota</label>
        <Textarea id="cert-exclusion-note" v-model="form.note" rows="4" maxlength="200" autoResize />
        <small class="certificacion-contratista-field-counter">{{ form.note.length }}/200</small>
      </div>
      <label class="certificacion-contratista-checkbox-line">
        <Checkbox v-model="form.modifyHistory" binary />
        <span>Modificar también el histórico del domicilio</span>
      </label>
    </div>

    <template #footer>
      <div class="certificacion-contratista-dialog__footer">
        <FmButton label="CANCELAR" variant="outline" :disabled="loading" @click="visible = false" />
        <FmButton label="EXCLUIR" :disabled="!form.reason || !selectedNumbers.length" :loading="loading" @click="submit" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { computed, reactive } from 'vue'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'

const visible = defineModel('visible', { type: Boolean, default: false })
const props = defineProps({
  selectedNumbers: { type: Array, default: () => [] },
  reasons: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})
const emit = defineEmits(['submit'])
const form = reactive({ reason: '', note: '', modifyHistory: false })
const reasonOptions = computed(() => props.reasons.map((reason) => ({
  label: reason.descripcion ?? reason.nombre ?? reason.motivo ?? reason.nombreCorto ?? String(reason),
  value: reason.nombreCorto ?? reason.codigo ?? reason.id ?? reason.nombre ?? String(reason)
})))
const reset = () => Object.assign(form, { reason: '', note: '', modifyHistory: false })
const submit = () => emit('submit', { ...form })
</script>
