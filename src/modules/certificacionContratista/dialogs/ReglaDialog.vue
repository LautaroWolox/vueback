<template>
  <Dialog
    v-model:visible="visible"
    modal
    maximizable
    header="Crear regla"
    class="fm-dialog certificacion-contratista-dialog certificacion-contratista-rule-dialog"
    :style="{ width: 'min(1180px, calc(100vw - 24px))' }"
    @show="reset"
  >
    <div class="certificacion-contratista-rule-form">
      <div class="certificacion-contratista-rule-meta">
        <div class="fm-field"><label for="rule-type">Tipo de regla *</label><Select id="rule-type" v-model="form.tipo" :options="types" optionLabel="label" optionValue="value" placeholder="Seleccionar" class="fm-select" @change="loadElements" /></div>
        <div class="fm-field"><label for="rule-name">Nombre *</label><InputText id="rule-name" v-model.trim="form.nombre" maxlength="100" /></div>
        <div class="fm-field"><label for="rule-from">Vigencia desde *</label><DatePicker id="rule-from" v-model="form.from" dateFormat="dd/mm/yy" showIcon /></div>
        <div class="fm-field"><label for="rule-to">Vigencia hasta</label><DatePicker id="rule-to" v-model="form.to" dateFormat="dd/mm/yy" showIcon showButtonBar /></div>
      </div>

      <div class="certificacion-contratista-rule-workspace">
        <aside class="certificacion-contratista-rule-elements">
          <div class="certificacion-contratista-rule-elements__header"><strong>Elementos disponibles</strong><span>{{ elements.length }}</span></div>
          <div v-if="elementsLoading" class="certificacion-contratista-inline-loader"><ProgressSpinner style="width: 28px; height: 28px" strokeWidth="4" /><span>Cargando…</span></div>
          <div v-else class="certificacion-contratista-rule-elements__list">
            <button v-for="element in elements" :key="`${element.seccion}-${element.nombre}`" type="button" @click="insertElement(element)">
              <i :class="element.icono ? `pi ${element.icono}` : 'pi pi-code'" aria-hidden="true" />
              <span><strong>{{ element.nombre }}</strong><small>{{ element.seccion || element.tipo }}</small></span>
              <i class="pi pi-plus" aria-hidden="true" />
            </button>
          </div>
        </aside>

        <main class="certificacion-contratista-rule-editor">
          <div class="certificacion-contratista-operator-toolbar">
            <span>Insertar operador:</span>
            <button v-for="operator in operators" :key="operator" type="button" @click="insertOperator(operator)">{{ operator }}</button>
          </div>
          <div class="fm-field">
            <label for="rule-conditions">Condiciones *</label>
            <Textarea id="rule-conditions" ref="conditionsRef" v-model="form.conditions" rows="9" placeholder="Construí la condición utilizando los elementos y operadores disponibles." />
          </div>
          <div class="certificacion-contratista-rule-results">
            <div class="fm-field"><label for="rule-current">Resultado actual *</label><Textarea id="rule-current" v-model="form.thenActual" rows="7" placeholder="Acciones sobre el estado actual" /></div>
            <div class="fm-field"><label for="rule-history">Resultado histórico *</label><Textarea id="rule-history" v-model="form.thenHistorico" rows="7" placeholder="Acciones sobre el histórico" /></div>
          </div>
        </main>
      </div>

      <details class="certificacion-contratista-rule-preview">
        <summary>Vista previa del payload</summary>
        <pre>{{ payloadPreview }}</pre>
      </details>
    </div>

    <template #footer>
      <div class="certificacion-contratista-dialog__footer">
        <FmButton label="CANCELAR" variant="outline" :disabled="loading" @click="visible = false" />
        <FmButton label="CREAR REGLA" icon="pi-plus" :disabled="!isValid" :loading="loading" @click="submit" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import DatePicker from 'primevue/datepicker'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { cargarElementosRegla } from '../api/certificacionApi'

const visible = defineModel('visible', { type: Boolean, default: false })
const props = defineProps({ types: { type: Array, default: () => [] }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['submit', 'error'])
const form = reactive({ tipo: '', nombre: '', from: null, to: null, conditions: '', thenActual: '', thenHistorico: '' })
const elements = ref([])
const elementsLoading = ref(false)
const conditionsRef = ref(null)
const operators = ['AND', 'OR', '(', ')', '=', '!=', '>', '<', '>=', '<=']
const formatDate = (date) => date instanceof Date ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}` : ''
const isValid = computed(() => form.tipo && form.nombre && form.from && form.conditions.trim() && form.thenActual.trim() && form.thenHistorico.trim())
const payload = computed(() => ({ tipo: form.tipo, nombre: form.nombre.trim(), vigenciaDesde: formatDate(form.from), vigenciaHasta: formatDate(form.to), condiciones: form.conditions.trim(), thenActual: form.thenActual.trim(), thenHistorico: form.thenHistorico.trim() }))
const payloadPreview = computed(() => JSON.stringify(payload.value, null, 2))

const reset = () => { Object.assign(form, { tipo: '', nombre: '', from: null, to: null, conditions: '', thenActual: '', thenHistorico: '' }); elements.value = [] }
const loadElements = async () => {
  elements.value = []
  if (!form.tipo) return
  elementsLoading.value = true
  try { elements.value = await cargarElementosRegla(form.tipo) }
  catch (cause) { emit('error', cause instanceof Error ? cause.message : 'No fue posible cargar los elementos de la regla.') }
  finally { elementsLoading.value = false }
}
const appendCondition = (text) => { form.conditions = `${form.conditions}${form.conditions && !form.conditions.endsWith(' ') ? ' ' : ''}${text} ` }
const insertOperator = (operator) => appendCondition(operator)
const insertElement = (element) => {
  const attributes = (element.elementoAtributos ?? []).map((attribute) => attribute.nombre ?? attribute.codigo).filter(Boolean)
  const reference = attributes.length ? `${element.nombre}.${attributes[0]}` : element.nombre
  appendCondition(reference)
}
const submit = () => emit('submit', payload.value)
</script>
