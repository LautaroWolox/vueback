<template>
  <form class="certificacion-contratista-filters" @submit.prevent="$emit('search')">
    <div class="fm-filter-grid certificacion-contratista-filters__grid">
      <div v-if="hasField('provincia')" class="fm-field">
        <label for="cert-provincia">Provincia</label>
        <Select
          id="cert-provincia"
          v-model="model.provincia"
          :options="catalogs.provincia"
          optionLabel="label"
          optionValue="value"
          placeholder="Todas"
          showClear
          filter
          class="fm-select"
        />
      </div>

      <div v-if="hasField('contratista')" class="fm-field">
        <label for="cert-contratista">Contratista</label>
        <Select
          id="cert-contratista"
          v-model="model.contratista"
          :options="catalogs.contratista"
          optionLabel="label"
          optionValue="value"
          placeholder="Todos"
          showClear
          filter
          class="fm-select"
        />
      </div>

      <div v-if="hasField('sociedad')" class="fm-field">
        <label for="cert-sociedad">Sociedad</label>
        <Select
          id="cert-sociedad"
          v-model="model.sociedad"
          :options="catalogs.sociedad"
          optionLabel="label"
          optionValue="value"
          placeholder="Todas"
          showClear
          filter
          class="fm-select"
        />
      </div>

      <div v-if="hasField('tipoContrato')" class="fm-field">
        <label for="cert-tipo-contrato">Tipo de contrato</label>
        <Select
          id="cert-tipo-contrato"
          v-model="model.tipoContrato"
          :options="catalogs.tipoContrato"
          optionLabel="label"
          optionValue="value"
          placeholder="Todos"
          showClear
          filter
          class="fm-select"
        />
      </div>

      <div v-if="hasField('periodoAnio')" class="fm-field">
        <label for="cert-anio">Año</label>
        <Select
          id="cert-anio"
          v-model="model.periodoAnio"
          :options="catalogs.periodoAnio"
          optionLabel="label"
          optionValue="value"
          placeholder="Todos"
          showClear
          class="fm-select"
          @change="$emit('year-change', model.periodoAnio)"
        />
      </div>

      <div v-if="hasField('periodoNombre')" class="fm-field">
        <label for="cert-periodo">Período</label>
        <Select
          id="cert-periodo"
          v-model="model.periodoNombre"
          :options="catalogs.periodoNombre"
          optionLabel="label"
          optionValue="value"
          placeholder="Todos"
          showClear
          class="fm-select"
        />
      </div>

      <div v-if="hasField('estadoActa')" class="fm-field">
        <label for="cert-estado">Estado</label>
        <Select
          id="cert-estado"
          v-model="model.estadoActa"
          :options="catalogs.estadoActa"
          optionLabel="label"
          optionValue="value"
          placeholder="Todos"
          showClear
          class="fm-select"
        />
      </div>

      <div v-if="hasField('nroActa')" class="fm-field">
        <label for="cert-nro-documento">N.º de documento</label>
        <InputText id="cert-nro-documento" v-model.trim="model.nroActa" autocomplete="off" />
      </div>

      <div v-if="hasField('nroActaAsoc')" class="fm-field">
        <label for="cert-acta-asociada">Acta asociada</label>
        <InputText id="cert-acta-asociada" v-model.trim="model.nroActaAsoc" autocomplete="off" />
      </div>

      <div v-if="hasField('nroOt')" class="fm-field">
        <label for="cert-nro-ot">N.º de OT</label>
        <InputText id="cert-nro-ot" v-model.trim="model.nroOt" autocomplete="off" />
      </div>
    </div>

    <div class="fm-actions certificacion-contratista-filters__actions">
      <FmButton label="LIMPIAR" variant="outline" type="button" :disabled="loading" @click="$emit('clear')" />
      <FmButton label="BUSCAR" type="submit" :loading="loading" />
    </div>
  </form>
</template>

<script setup>
import InputText from 'primevue/inputtext'

const model = defineModel({ type: Object, required: true })

const props = defineProps({
  fields: { type: Array, default: () => [] },
  catalogs: { type: Object, required: true },
  loading: { type: Boolean, default: false }
})

defineEmits(['search', 'clear', 'year-change'])

const hasField = (field) => props.fields.includes(field)
</script>
