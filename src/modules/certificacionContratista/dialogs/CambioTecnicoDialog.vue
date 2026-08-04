<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Cambiar técnico"
    class="fm-dialog certificacion-contratista-dialog certificacion-contratista-tech-dialog"
    :style="{ width: 'min(700px, calc(100vw - 28px))' }"
    @show="reset"
  >
    <div class="certificacion-contratista-dialog__content">
      <div class="certificacion-contratista-selection-summary">
        <strong>{{ ots.length }}</strong><span>OT{{ ots.length === 1 ? '' : 's' }} seleccionada{{ ots.length === 1 ? '' : 's' }}</span><small>{{ ots.join(', ') }}</small>
      </div>
      <div class="certificacion-contratista-tech-search">
        <div class="fm-field">
          <label for="tech-legajo">Legajo LDAP o no LDAP *</label>
          <div class="certificacion-contratista-input-action">
            <InputText id="tech-legajo" v-model.trim="legajo" autocomplete="off" @keyup.enter="searchOperator" />
            <FmButton label="BUSCAR" icon="pi-search" variant="outline" :loading="searching" :disabled="!legajo" @click="searchOperator" />
          </div>
        </div>
      </div>

      <section v-if="operator" class="certificacion-contratista-operator-card">
        <div><span>Nombre</span><strong>{{ operator.nombre }} {{ operator.apellido }}</strong></div>
        <div><span>Legajo LDAP</span><strong>{{ operator.legajoLdap || '-' }}</strong></div>
        <div><span>Legajos no LDAP</span><strong>{{ operator.legajosNoLdap?.join(', ') || '-' }}</strong></div>
        <div><span>Empresa</span><strong>{{ operator.empresa || '-' }}</strong></div>
        <div><span>Base técnica</span><strong>{{ operator.baseTecnica || '-' }}</strong></div>
        <div><span>Provincia</span><strong>{{ operator.provincia || '-' }}</strong></div>
      </section>

      <div class="fm-field">
        <label for="tech-note">Nota *</label>
        <Textarea id="tech-note" v-model="note" rows="4" maxlength="500" autoResize />
      </div>
    </div>
    <template #footer>
      <div class="certificacion-contratista-dialog__footer">
        <FmButton label="CANCELAR" variant="outline" :disabled="loading" @click="visible = false" />
        <FmButton label="PROCESAR" :disabled="!operator || !note.trim() || !ots.length" :loading="loading" @click="$emit('submit', { legajoLdap: operator.legajoLdap, legajosNoLdap: operator.legajosNoLdap, nota: note.trim(), ots })" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { buscarOperadorLogistica } from '../api/certificacionApi'

const visible = defineModel('visible', { type: Boolean, default: false })
const props = defineProps({ ots: { type: Array, default: () => [] }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['submit', 'error'])
const legajo = ref('')
const note = ref('')
const operator = ref(null)
const searching = ref(false)
const reset = () => { legajo.value = ''; note.value = ''; operator.value = null }
const searchOperator = async () => {
  if (!legajo.value) return
  searching.value = true
  try {
    const result = await buscarOperadorLogistica(legajo.value)
    if (!result?.legajoLdap && !result?.nombre) throw new Error('No se encontró un operador para el legajo ingresado.')
    operator.value = result
  } catch (cause) {
    operator.value = null
    emit('error', cause instanceof Error ? cause.message : 'No fue posible buscar el técnico.')
  } finally { searching.value = false }
}
</script>
