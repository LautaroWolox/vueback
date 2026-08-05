<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Gestionar traspaso de OTs"
    class="fm-dialog certificacion-contratista-dialog certificacion-contratista-transfer-dialog"
    :style="{ width: 'min(860px, calc(100vw - 28px))' }"
    @show="initialize"
  >
    <div class="certificacion-contratista-dialog__content">
      <div class="certificacion-contratista-selection-summary">
        <strong>{{ selectedNumbers.length }}</strong>
        <span>OT{{ selectedNumbers.length === 1 ? '' : 's' }} a traspasar</span>
        <small>{{ selectedNumbers.join(', ') }}</small>
      </div>

      <div v-if="loadingCatalogs" class="certificacion-contratista-inline-loader">
        <ProgressSpinner style="width: 30px; height: 30px" strokeWidth="4" />
        <span>Cargando datos del traspaso…</span>
      </div>

      <div v-else class="certificacion-contratista-transfer-grid">
        <div class="fm-field">
          <label for="transfer-region">Región *</label>
          <Select id="transfer-region" v-model="form.region" :options="options.regions" optionLabel="label" optionValue="value" placeholder="Seleccionar" filter class="fm-select" @change="onRegionChange" />
        </div>
        <div class="fm-field">
          <label for="transfer-subregion">Subregión / base *</label>
          <Select id="transfer-subregion" v-model="form.base" :options="options.bases" optionLabel="label" optionValue="value" placeholder="Seleccionar" filter class="fm-select" />
        </div>
        <div class="fm-field">
          <label for="transfer-contractor">Contratista *</label>
          <Select id="transfer-contractor" v-model="form.contractor" :options="options.contractors" optionLabel="label" optionValue="value" placeholder="Seleccionar" filter class="fm-select" />
        </div>
        <div class="fm-field">
          <label for="transfer-contract">Contrato *</label>
          <Select id="transfer-contract" v-model="form.contract" :options="options.contracts" optionLabel="label" optionValue="value" placeholder="Seleccionar" filter class="fm-select" />
        </div>
        <div class="fm-field">
          <label for="transfer-company">Sociedad *</label>
          <Select id="transfer-company" v-model="form.company" :options="options.companies" optionLabel="label" optionValue="value" placeholder="Seleccionar" filter class="fm-select" />
        </div>
        <div class="fm-field fm-field--span-2">
          <label for="transfer-note">Nota de traspaso *</label>
          <Textarea id="transfer-note" v-model="form.note" rows="4" maxlength="200" autoResize />
          <small class="certificacion-contratista-field-counter">{{ form.note.length }}/200</small>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="certificacion-contratista-dialog__footer">
        <FmButton label="CANCELAR" variant="outline" :disabled="loading" @click="visible = false" />
        <FmButton label="TRASPASAR" :disabled="!isValid || loadingCatalogs" :loading="loading" @click="submit" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import Textarea from 'primevue/textarea'
import { cargarDatosTraspaso, cargarSubregiones } from '../api/certificacionApi'

const visible = defineModel('visible', { type: Boolean, default: false })
const props = defineProps({ selectedNumbers: { type: Array, default: () => [] }, documentNumber: { type: String, default: '' }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['submit', 'error'])
const loadingCatalogs = ref(false)
const form = reactive({ region: '', base: '', contractor: '', contract: '', company: '', note: '' })
const options = reactive({ regions: [], bases: [], contractors: [], contracts: [], companies: [] })
const mapOptions = (values = []) => values.map((item) => ({ label: item.textContent ?? item.nombre ?? item.label ?? item.value ?? String(item), value: item.value ?? item.codigo ?? item.idLogiEstruc ?? item.nombre ?? String(item), raw: item }))
const isValid = computed(() => props.selectedNumbers.length && form.region && form.base && form.contractor && form.contract && form.company && form.note.trim())

const initialize = async () => {
  Object.assign(form, { region: '', base: '', contractor: '', contract: '', company: '', note: '' })
  loadingCatalogs.value = true
  try {
    const data = await cargarDatosTraspaso()
    options.regions = mapOptions(data?.regiones)
    options.bases = mapOptions(data?.basesTecnicas ?? data?.subregiones)
    options.contractors = mapOptions(data?.contratistas)
    options.contracts = mapOptions(data?.contratos)
    options.companies = mapOptions(data?.sociedades)
  } catch (cause) {
    emit('error', cause instanceof Error ? cause.message : 'No fue posible cargar los datos de traspaso.')
  } finally {
    loadingCatalogs.value = false
  }
}

const onRegionChange = async () => {
  form.base = ''
  const selected = options.regions.find((item) => item.value === form.region)
  if (!selected) return
  try {
    const response = await cargarSubregiones({ codigo: selected.raw?.codigo ?? selected.value, nombre: selected.raw?.nombre ?? selected.label })
    options.bases = mapOptions(response)
  } catch (cause) {
    emit('error', cause instanceof Error ? cause.message : 'No fue posible cargar las subregiones.')
  }
}

const submit = () => {
  const region = options.regions.find((item) => item.value === form.region)
  const base = options.bases.find((item) => item.value === form.base)
  const contractor = options.contractors.find((item) => item.value === form.contractor)
  const contract = options.contracts.find((item) => item.value === form.contract)
  const company = options.companies.find((item) => item.value === form.company)
  emit('submit', {
    validation: { nroActa: props.documentNumber, nroOts: props.selectedNumbers },
    transfer: {
      nroOrdenTrabajo: props.selectedNumbers,
      codigoRegion: region?.raw?.codigo ?? region?.value,
      provincia: base?.raw?.provincia ?? '',
      baseTecnica: base?.label,
      baseTecnicaCodigo: base?.raw?.codigo ?? base?.value,
      baseTecnicaNombre: base?.raw?.nombre ?? base?.label,
      empresaContratistaCodigo: contractor?.raw?.codigo ?? contractor?.value,
      tipoContratoNombreCorto: contract?.raw?.nombreCorto ?? contract?.value,
      sociedadNombreCorto: company?.raw?.nombreCorto ?? company?.value,
      nota: form.note.trim()
    }
  })
}
</script>
