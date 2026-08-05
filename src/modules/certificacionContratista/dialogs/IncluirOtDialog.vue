<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Incluir orden de trabajo"
    class="fm-dialog certificacion-contratista-dialog certificacion-contratista-operation-dialog"
    :style="{ width: 'min(620px, calc(100vw - 28px))' }"
    @show="reset"
  >
    <div class="certificacion-contratista-dialog__content">
      <div class="fm-field">
        <label for="cert-include-ot">N.º de OT *</label>
        <InputText id="cert-include-ot" v-model.trim="form.nroOT" autocomplete="off" />
      </div>
      <div class="fm-field">
        <label for="cert-include-reason">Motivo *</label>
        <Select id="cert-include-reason" v-model="form.reason" :options="reasonOptions" optionLabel="label" optionValue="value" placeholder="Seleccionar motivo" filter class="fm-select" />
      </div>
      <div class="fm-field">
        <label for="cert-include-note">Nota</label>
        <Textarea id="cert-include-note" v-model="form.note" rows="4" maxlength="200" autoResize />
        <small class="certificacion-contratista-field-counter">{{ form.note.length }}/200</small>
      </div>
      <label class="certificacion-contratista-checkbox-line">
        <Checkbox v-model="form.modifyHistory" binary />
        <span>Modificar el histórico del domicilio</span>
      </label>
      <label class="certificacion-contratista-checkbox-line">
        <Checkbox v-model="form.reset" binary />
        <span>Resetear actividades al incluir</span>
      </label>
    </div>

    <template #footer>
      <div class="certificacion-contratista-dialog__footer">
        <FmButton label="CANCELAR" variant="outline" :disabled="loading" @click="visible = false" />
        <FmButton label="INCLUIR" :disabled="!form.nroOT || !form.reason" :loading="loading" @click="submit" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { computed, reactive } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'

const visible = defineModel('visible', { type: Boolean, default: false })
const props = defineProps({
  reasons: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  initialOt: { type: String, default: '' }
})
const emit = defineEmits(['submit'])
const form = reactive({ nroOT: '', reason: '', note: '', modifyHistory: false, reset: false })
const reasonOptions = computed(() => props.reasons.map((reason) => ({
  label: reason.descripcion ?? reason.nombre ?? reason.motivo ?? reason.nombreCorto ?? String(reason),
  value: reason.nombreCorto ?? reason.codigo ?? reason.id ?? reason.nombre ?? String(reason)
})))
const reset = () => Object.assign(form, { nroOT: props.initialOt, reason: '', note: '', modifyHistory: false, reset: false })
const submit = () => emit('submit', { ...form })
</script>
