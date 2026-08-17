<template>
  <div class="busqueda-ots-filter-content">
    <textarea
      v-model="store.otListText"
      class="busqueda-ots-textarea"
      rows="7"
      placeholder="ESCRIBA LAS OTS SEPARADAS POR COMA"
      aria-label="Lista de órdenes de trabajo separadas por coma"
    ></textarea>

    <div class="busqueda-ots-filter-actions">
      <FmButton
        label="BUSCAR"
        :loading="store.searching"
        @click="handleSearch"
      />
      <FmButton
        label="LIMPIAR"
        variant="outline"
        :disabled="store.searching"
        @click="store.clearSearch"
      />
    </div>
  </div>
</template>

<script setup>
import { nextTick } from 'vue'
import FmButton from '@/components/shared/FmButton.vue'
import { useBuscadorOtsStore } from '../store/buscadorOtsStore'

const emit = defineEmits(['search-start', 'searched'])
const store = useBuscadorOtsStore()

const handleSearch = async () => {
  if (!store.parsedOtNumbers.length || store.searching) return

  emit('search-start')
  await nextTick()
  await store.searchOts()
  emit('searched')
}
</script>

<style scoped>
.busqueda-ots-filter-content {
  min-height: 252px;
  padding: 12px 20px 16px;
  border-left: 4px solid #00a9bd;
  background: #fff;
}

.busqueda-ots-textarea {
  width: 100%;
  min-height: 178px;
  max-height: 320px;
  padding: 12px;
  resize: vertical;
  border: 1px solid #c7c7c7;
  border-radius: 2px;
  background: #fff;
  color: #263746;
  font: inherit;
  font-size: 12px;
  line-height: 1.4;
  box-sizing: border-box;
}

.busqueda-ots-textarea::placeholder {
  color: #426f87;
  opacity: 1;
}

.busqueda-ots-textarea:focus {
  outline: none;
  border-color: #00a9bd;
  box-shadow: 0 0 0 2px rgba(0, 169, 189, .12);
}

.busqueda-ots-filter-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-top: 14px;
}

.busqueda-ots-filter-actions :deep(.fm-action-button),
.busqueda-ots-filter-actions :deep(.fm-ui-button) {
  min-width: 80px !important;
  height: 30px !important;
  min-height: 30px !important;
  padding: 0 14px !important;
  border-radius: 15px !important;
  font-size: 11px !important;
  font-weight: 400 !important;
  box-shadow: none !important;
}

@media (max-width: 900px) {
  .busqueda-ots-filter-content {
    padding: 10px;
  }

  .busqueda-ots-filter-actions {
    flex-wrap: wrap;
  }
}
</style>
