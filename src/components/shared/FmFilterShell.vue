<template>
  <div class="fm-filter-shell fm-panel-content fm-panel-content--accent fm-filters">
    <!-- Grilla de campos: el consumidor pone los fm-field aquí -->
    <div class="fm-filter-shell__grid fm-filter-grid">
      <slot name="fields" />
    </div>

    <!-- Acciones: BUSCAR y LIMPIAR más slot para acciones extra -->
    <div class="fm-filter-shell__actions fm-actions fm-filter-actions">
      <slot name="actions">
        <FmButton
          label="BUSCAR"
          :loading="loading"
          :disabled="loading"
          @click="$emit('search')"
        />
        <FmButton
          label="LIMPIAR"
          variant="outline"
          :disabled="loading"
          @click="$emit('clear')"
        />
      </slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: { type: Boolean, default: false }
})

defineEmits(['search', 'clear'])
</script>

<style scoped>
.fm-filter-shell {
  width: 100%;
}

.fm-filter-shell__grid {
  width: 100%;
}

.fm-filter-shell__actions {
  margin-top: 14px;
}
</style>
