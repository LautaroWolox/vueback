<template>
  <Dialog
    :visible="visible"
    appendTo="body"
    modal
    :closable="false"
    :draggable="false"
    :resizable="false"
    class="jobtype-alta-dialog"
    @update:visible="$emit('update:visible', $event)"
    @hide="onHide"
  >
    <template #header>
      <div class="jobtype-alta-header" style="grid-template-columns: minmax(0, 1fr) 52px">
        <h2 class="jobtype-alta-header__title" style="margin-left: 20px">
          Alta CMO - Actividad
        </h2>

        <button
          type="button"
          class="jobtype-alta-header__close"
          style="justify-self: center; margin-left: 0"
          title="Cerrar"
          aria-label="Cerrar"
          @click="cerrar"
        >×</button>
      </div>
    </template>

    <div class="jobtype-alta-content">
      <div
        class="jobtype-alta-form"
        style="grid-template-columns: minmax(280px, 1fr) minmax(280px, 1fr) 120px !important; max-width: 860px !important; align-items: end !important;"
      >
        <div
          class="jobtype-alta-field fm-field"
          style="width: 100% !important; min-width: 0 !important; max-width: none !important"
        >
          <label for="alta-actividad">Actividad</label>
          <AutoComplete
            id="alta-actividad"
            v-model="actividadSelected"
            :suggestions="actividadSuggestions"
            optionLabel="valor"
            :minLength="3"
            :loading="actividadLoading"
            class="jobtype-alta-control"
            inputClass="jobtype-alta-control"
            aria-required="true"
            placeholder="Escriba 3+ caracteres..."
            @complete="onSearchActividad"
          />
        </div>

        <div
          class="jobtype-alta-field fm-field"
          style="width: 100% !important; min-width: 0 !important; max-width: none !important"
        >
          <label for="alta-cmo">CMO</label>
          <AutoComplete
            id="alta-cmo"
            v-model="cmoSelected"
            :suggestions="cmoSuggestions"
            optionLabel="valor"
            :minLength="3"
            :loading="cmoLoading"
            class="jobtype-alta-control"
            inputClass="jobtype-alta-control"
            aria-required="true"
            placeholder="Escriba 3+ caracteres..."
            @complete="onSearchCmo"
          />
        </div>

        <FmButton
          label="AGREGAR"
          class="jobtype-add-button"
          style="width: 120px !important; min-width: 120px !important; max-width: 120px !important; border-radius: 0 !important"
          :disabled="!canAgregar"
          @click="agregar"
        />
      </div>

      <!-- Errores de backend -->
      <div v-if="errorMessages.length" class="cmo-alta-errors">
        <p v-for="(msg, idx) in errorMessages" :key="idx" class="cmo-alta-errors__item">
          {{ msg }}
        </p>
      </div>

      <div class="jobtype-alta-grid-wrap fm-grid-shell">
        <DataTable
          v-model:selection="selectedPreviewRow"
          v-model:first="previewFirst"
          v-model:rows="previewPageRows"
          class="jobtype-alta-grid fm-pass-grid"
          :value="previewRows"
          dataKey="id"
          tableStyle="table-layout: fixed; width: 100%; min-width: 100%"
          scrollable
          scrollHeight="flex"
          selectionMode="single"
          paginator
          :rowsPerPageOptions="[10]"
          showGridlines
          @row-click="onPreviewRowClick"
        >
          <template #empty>
            <div class="fm-grid-empty jobtype-alta-empty">No hay relaciones agregadas</div>
          </template>

          <template
            #paginatorcontainer="{
              first,
              last,
              page,
              pageCount,
              rows,
              totalRecords,
              firstPageCallback,
              lastPageCallback,
              prevPageCallback,
              nextPageCallback,
              rowChangeCallback,
              changePageCallback
            }"
          >
            <FmGridPaginator
              :first="first"
              :last="last"
              :page="page"
              :page-count="pageCount"
              :rows="rows"
              :total-records="totalRecords"
              :rows-options="[10]"
              :show-rows-select="false"
              :show-counter="false"
              page-label="Página"
              @first-page="firstPageCallback"
              @prev-page="prevPageCallback"
              @next-page="nextPageCallback"
              @last-page="lastPageCallback"
              @page-change="changePageCallback"
              @rows-change="rowChangeCallback"
            >
              <template #actions>
                <FmGridActions
                  size="large"
                  :show-export="false"
                  :show-delete="true"
                  :show-refresh="false"
                  :delete-disabled="!selectedPreviewRow"
                  delete-title="Eliminar"
                  @delete="eliminarPreview"
                />
              </template>
            </FmGridPaginator>
          </template>

          <Column
            v-for="column in altaPreviewColumns"
            :key="column.field"
            :field="column.field"
            :header="column.header"
            :style="{ width: column.width }"
            :headerStyle="{ width: column.width }"
            :bodyStyle="{ width: column.width }"
          >
            <template #body="{ data }">
              <span class="fm-cell-text" :title="String(data[column.field] ?? '')">
                {{ data[column.field] ?? '' }}
              </span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <template #footer>
      <FmButton
        label="RELACIONAR"
        class="jobtype-relate-button"
        style="width: 120px !important; min-width: 120px !important; max-width: 120px !important; border-radius: 0 !important"
        :disabled="previewRows.length === 0 || saving"
        @click="relacionar"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Dialog from 'primevue/dialog'
import AutoComplete from 'primevue/autocomplete'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

import { useCmoActividadStore } from '../store/cmoActividadStore'
import { altaPreviewColumns } from './columns'
import type { ActividadAutocomplete, CmoAutocomplete, NuevaRelacion } from '../store/types'

// ─── Props & Emits ────────────────────────────────────────────────

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

// ─── Servicios ────────────────────────────────────────────────────

const store = useCmoActividadStore()
const confirm = useConfirm()
const toast = useToast()

// ─── Estado local ─────────────────────────────────────────────────

const actividadSelected = ref<ActividadAutocomplete | string | null>(null)
const cmoSelected = ref<CmoAutocomplete | string | null>(null)
const actividadSuggestions = ref<ActividadAutocomplete[]>([])
const cmoSuggestions = ref<CmoAutocomplete[]>([])
const actividadLoading = ref(false)
const cmoLoading = ref(false)

const previewRows = ref<(NuevaRelacion & { id: string })[]>([])
const selectedPreviewRow = ref<(NuevaRelacion & { id: string }) | null>(null)
const previewFirst = ref(0)
const previewPageRows = ref(10)

const saving = ref(false)
const errorMessages = ref<string[]>([])

// Debounce timers
let actividadTimer: ReturnType<typeof setTimeout> | null = null
let cmoTimer: ReturnType<typeof setTimeout> | null = null

// ─── Computed ─────────────────────────────────────────────────────

const canAgregar = computed(() => {
  return (
    actividadSelected.value !== null &&
    typeof actividadSelected.value === 'object' &&
    cmoSelected.value !== null &&
    typeof cmoSelected.value === 'object'
  )
})

// ─── Autocomplete handlers (debounce 300ms) ───────────────────────

const onSearchActividad = (event: { query: string }) => {
  if (actividadTimer) clearTimeout(actividadTimer)
  actividadLoading.value = true

  actividadTimer = setTimeout(async () => {
    try {
      actividadSuggestions.value = await store.searchActividad(event.query)
    } catch {
      actividadSuggestions.value = []
    } finally {
      actividadLoading.value = false
    }
  }, 300)
}

const onSearchCmo = (event: { query: string }) => {
  if (cmoTimer) clearTimeout(cmoTimer)
  cmoLoading.value = true

  cmoTimer = setTimeout(async () => {
    try {
      cmoSuggestions.value = await store.searchCmo(event.query)
    } catch {
      cmoSuggestions.value = []
    } finally {
      cmoLoading.value = false
    }
  }, 300)
}

// ─── Agregar a preview ────────────────────────────────────────────

const agregar = () => {
  if (!canAgregar.value) return

  const actividad = actividadSelected.value as ActividadAutocomplete
  const cmo = cmoSelected.value as CmoAutocomplete

  // Validar duplicado por idActividad en preview
  if (previewRows.value.some((row) => row.idActividad === actividad.id && row.idCmo === cmo.id)) {
    return
  }

  const row: NuevaRelacion & { id: string } = {
    id: `${Date.now()}-${actividad.id}-${cmo.id}`,
    idActividad: actividad.id,
    idCmo: cmo.id,
    codigoActividad: actividad.codigo,
    descActividad: actividad.nombre,
    codigoS4: cmo.codigoS4,
    cmo: cmo.valor ?? `${cmo.codigoS4} - ${cmo.nombre}`,
  }

  previewRows.value = [...previewRows.value, row]
  selectedPreviewRow.value = row
  errorMessages.value = []

  // Limpiar campos
  actividadSelected.value = null
  cmoSelected.value = null
}

// ─── Eliminar de preview ──────────────────────────────────────────

const eliminarPreview = () => {
  if (!selectedPreviewRow.value) return
  previewRows.value = previewRows.value.filter((row) => row.id !== selectedPreviewRow.value!.id)
  selectedPreviewRow.value = null
}

const onPreviewRowClick = ({ data }: { data: NuevaRelacion & { id: string } }) => {
  selectedPreviewRow.value = data
}

// ─── Enviar relaciones al backend ─────────────────────────────────

const relacionar = async () => {
  if (previewRows.value.length === 0 || saving.value) return

  saving.value = true
  errorMessages.value = []

  try {
    // Preparar payload sin el campo 'id' local
    const payload: NuevaRelacion[] = previewRows.value.map(({ id, ...rest }) => rest)
    const responses = await store.crearRelaciones(payload)

    if (responses.length === 0) {
      // Éxito total
      toast.add({
        severity: 'success',
        summary: 'Relaciones creadas',
        detail: 'Las relaciones se crearon correctamente',
        life: 3000,
      })
      resetAndClose()
      emit('saved')
    } else {
      // Errores de negocio — mostrar inline
      errorMessages.value = responses.map((r) => r.mensaje)
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error de conexión con el servidor',
      life: 5000,
    })
  } finally {
    saving.value = false
  }
}

// ─── Cerrar dialog ────────────────────────────────────────────────

const cerrar = () => {
  if (previewRows.value.length > 0) {
    confirm.require({
      message: 'Hay datos ingresados, confirma que desea cancelar?',
      header: 'Confirmar cierre',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Aceptar',
      rejectLabel: 'Cancelar',
      accept: () => {
        resetAndClose()
      },
    })
  } else {
    resetAndClose()
  }
}

const resetAndClose = () => {
  actividadSelected.value = null
  cmoSelected.value = null
  actividadSuggestions.value = []
  cmoSuggestions.value = []
  previewRows.value = []
  selectedPreviewRow.value = null
  previewFirst.value = 0
  errorMessages.value = []
  saving.value = false
  emit('update:visible', false)
}

const onHide = () => {
  // Cleanup al cerrar
  actividadSelected.value = null
  cmoSelected.value = null
  previewRows.value = []
  selectedPreviewRow.value = null
  errorMessages.value = []
}
</script>

<style scoped>
.cmo-alta-errors {
  padding: 4px 16px;
  margin: 0;
}

.cmo-alta-errors__item {
  margin: 2px 0;
  padding: 4px 8px;
  border-left: 3px solid #d32f2f;
  background: #fff5f5;
  color: #d32f2f;
  font-size: 11px;
  line-height: 1.4;
}
</style>
