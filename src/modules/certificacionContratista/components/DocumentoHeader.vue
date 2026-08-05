<template>
  <header class="certificacion-contratista-detail-header">
    <div class="certificacion-contratista-detail-header__top">
      <div>
        <button type="button" class="certificacion-contratista-back-button" @click="$emit('back')">
          <i class="pi pi-arrow-left" aria-hidden="true" />
          Volver a la consulta
        </button>
        <h1>{{ title }}</h1>
      </div>
      <span :class="['certificacion-contratista-status', statusClass]">{{ header?.estado || header?.estadoActa || 'SIN ESTADO' }}</span>
    </div>

    <div class="certificacion-contratista-detail-summary">
      <div><span>Región</span><strong>{{ header?.region || '-' }}</strong></div>
      <div><span>Provincia</span><strong>{{ header?.provincia || '-' }}</strong></div>
      <div><span>Sociedad</span><strong>{{ header?.sociedad || '-' }}</strong></div>
      <div><span>Contratista</span><strong>{{ header?.empresaContratista || header?.contratista || '-' }}</strong></div>
      <div><span>Tipo de contrato</span><strong>{{ header?.tipoContrato || '-' }}</strong></div>
      <div><span>Período</span><strong>{{ header?.periodo || '-' }}</strong></div>
      <div v-if="header?.calificacion"><span>Calificación</span><strong>{{ header.calificacion }}</strong></div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ title: { type: String, required: true }, header: { type: Object, default: null } })
defineEmits(['back'])
const statusClass = computed(() => {
  const status = String(props.header?.estado ?? props.header?.estadoActa ?? '').toLowerCase()
  if (status.includes('certific') || status.includes('cerrad')) return 'is-success'
  if (status.includes('curso') || status.includes('abiert')) return 'is-progress'
  if (status.includes('anulad') || status.includes('error')) return 'is-danger'
  return 'is-neutral'
})
</script>
