<template>
  <section class="busqueda-ots-reprocess-flow" aria-label="Reprocesar y cambiar técnico">
    <div class="busqueda-ots-reprocess-flow__header">
      <div class="busqueda-ots-reprocess-flow__heading">
        <span class="busqueda-ots-reprocess-flow__icon" aria-hidden="true">
          <i class="pi pi-filter"></i>
        </span>
        <div>
          <h3>Reprocesar / cambiar técnico</h3>
          <p>Completá los pasos para seleccionar las OTs, validar el técnico y ejecutar el cambio.</p>
        </div>
      </div>

      <FmButton
        label="VOLVER A LA GRILLA"
        icon="pi-arrow-left"
        variant="outline"
        @click="cancelFlow"
      />
    </div>

    <Stepper value="1" linear class="fm-workflow-stepper busqueda-ots-reprocess-stepper">
      <StepList>
        <Step value="1">
          <span class="fm-workflow-stepper__step-label">
            <i class="pi pi-list-check" aria-hidden="true"></i>
            <span>Seleccionar OTs</span>
          </span>
        </Step>
        <Step value="2">
          <span class="fm-workflow-stepper__step-label">
            <i class="pi pi-user-edit" aria-hidden="true"></i>
            <span>Cambio de técnico</span>
          </span>
        </Step>
        <Step value="3">
          <span class="fm-workflow-stepper__step-label">
            <i class="pi pi-check-circle" aria-hidden="true"></i>
            <span>Confirmar</span>
          </span>
        </Step>
      </StepList>

      <StepPanels>
        <StepPanel v-slot="{ activateCallback }" value="1">
          <div class="fm-workflow-stepper__panel">
            <div class="fm-workflow-stepper__panel-title">
              <div>
                <span class="fm-workflow-stepper__eyebrow">PASO 1 DE 3</span>
                <h4>Seleccioná las órdenes a reprocesar</h4>
                <p>Se muestran únicamente OTs cerradas, con actividades y ubicación GM OK.</p>
              </div>
              <span class="fm-workflow-stepper__counter">
                {{ selectedRows.length }} seleccionada{{ selectedRows.length === 1 ? '' : 's' }}
              </span>
            </div>

            <Message
              v-if="stepError"
              severity="warn"
              :closable="false"
              class="fm-workflow-stepper__message"
            >
              {{ stepError }}
            </Message>

            <Message
              v-if="rows.length === 0"
              severity="info"
              :closable="false"
              class="fm-workflow-stepper__message"
            >
              No hay OTs que cumplan las condiciones para reprocesar.
            </Message>

            <FmGridShell class="fm-workflow-stepper__grid-shell">
              <DataTable
                v-model:selection="selectedRows"
                v-model:first="first"
                v-model:rows="pageRows"
                :value="rows"
                data-key="id"
                class="fm-pass-grid fm-workflow-stepper__grid"
                table-style="table-layout: fixed; min-width: 1180px; width: 100%"
                paginator
                scrollable
                scroll-height="330px"
                show-gridlines
                removable-sort
                sort-mode="multiple"
                :rows-per-page-options="rowsOptions"
              >
                <template
                  #paginatorcontainer="{
                    first: paginatorFirst,
                    last,
                    page,
                    pageCount,
                    rows: paginatorRows,
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
                    :first="paginatorFirst"
                    :last="last"
                    :page="page"
                    :page-count="Math.max(pageCount, 1)"
                    :rows="paginatorRows"
                    :total-records="totalRecords"
                    :rows-options="rowsOptions"
                    :show-rows-select="true"
                    :show-counter="true"
                    :auto-max-rows="false"
                    :counter-text="totalRecords === 0 ? 'No hay resultados' : ''"
                    @first-page="firstPageCallback"
                    @prev-page="prevPageCallback"
                    @next-page="nextPageCallback"
                    @last-page="lastPageCallback"
                    @page-change="changePageCallback"
                    @rows-change="rowChangeCallback"
                  />
                </template>

                <template #empty>
                  <div class="fm-grid-empty">No hay resultados</div>
                </template>

                <Column
                  selection-mode="multiple"
                  header-style="width: 46px; min-width: 46px; max-width: 46px"
                  body-style="width: 46px; min-width: 46px; max-width: 46px"
                />
                <Column field="nroOt" header="Nro de OT" sortable style="width: 130px" />
                <Column field="nroOtSfs" header="Nro OT SFS" sortable style="width: 130px" />
                <Column field="statusOt" header="Status de la OT" sortable style="width: 135px" />
                <Column field="statusOtWfx" header="Status OT WFX" sortable style="width: 125px" />
                <Column field="fechaUltimaModificacion" header="Fecha Última Modificación" sortable style="width: 180px" />
                <Column field="nroTech" header="Nro Tech" sortable style="width: 120px" />
                <Column field="nombreTech" header="Nombre del Tech" sortable style="width: 165px" />
                <Column field="actividades" header="Actividades" sortable style="width: 105px" />
                <Column field="ubicacionOt" header="Ubicación de la OT" sortable style="width: 135px" />
                <Column field="origenOt" header="Origen OT" sortable style="width: 105px" />
              </DataTable>
            </FmGridShell>

            <div class="fm-workflow-stepper__actions fm-workflow-stepper__actions--split">
              <FmButton
                label="VOLVER A LA GRILLA"
                icon="pi-arrow-left"
                variant="outline"
                @click="cancelFlow"
              />
              <FmButton
                label="SIGUIENTE"
                icon="pi-arrow-right"
                :disabled="rows.length === 0"
                @click="goToTechnician(activateCallback)"
              />
            </div>
          </div>
        </StepPanel>

        <StepPanel v-slot="{ activateCallback }" value="2">
          <div class="fm-workflow-stepper__panel">
            <div class="fm-workflow-stepper__panel-title">
              <div>
                <span class="fm-workflow-stepper__eyebrow">PASO 2 DE 3</span>
                <h4>Buscá y validá el nuevo técnico</h4>
                <p>Las OTs seleccionadas se mantienen mientras avanzás o volvés atrás.</p>
              </div>
              <span class="fm-workflow-stepper__counter">
                {{ selectedRows.length }} OT{{ selectedRows.length === 1 ? '' : 's' }}
              </span>
            </div>

            <Message
              v-if="stepError"
              severity="warn"
              :closable="false"
              class="fm-workflow-stepper__message"
            >
              {{ stepError }}
            </Message>

            <div class="fm-workflow-stepper__selected-summary">
              <div class="fm-workflow-stepper__summary-icon" aria-hidden="true">
                <i class="pi pi-check-square"></i>
              </div>
              <div>
                <strong>{{ selectedRows.length }} OT{{ selectedRows.length === 1 ? '' : 's' }} seleccionada{{ selectedRows.length === 1 ? '' : 's' }}</strong>
                <span>{{ selectedOtPreview }}</span>
              </div>
            </div>

            <div class="fm-filters fm-workflow-stepper__form">
              <div class="fm-filter-grid">
                <div class="fm-field fm-field--span-3">
                  <label for="stepper-cambio-tech-id">TECH ID</label>
                  <InputText
                    id="stepper-cambio-tech-id"
                    v-model="techId"
                    autocomplete="off"
                    @keyup.enter="searchTechnician"
                  />
                </div>

                <div class="fm-field fm-field--span-2 fm-workflow-stepper__search-field">
                  <span class="fm-field__label">&nbsp;</span>
                  <FmButton label="BUSCAR" @click="searchTechnician" />
                </div>

                <div class="fm-field fm-field--span-3">
                  <label for="stepper-cambio-tech-empresa">EMPRESA CONTRATISTA</label>
                  <InputText
                    id="stepper-cambio-tech-empresa"
                    v-model="empresaContratista"
                    disabled
                  />
                </div>

                <div class="fm-field fm-field--span-2">
                  <label for="stepper-cambio-tech-base">BASE TÉCNICA</label>
                  <InputText
                    id="stepper-cambio-tech-base"
                    v-model="baseTecnica"
                    disabled
                  />
                </div>

                <div class="fm-field fm-field--span-2">
                  <label for="stepper-cambio-tech-provincia">PROVINCIA</label>
                  <InputText
                    id="stepper-cambio-tech-provincia"
                    v-model="provincia"
                    disabled
                  />
                </div>
              </div>

              <div v-if="resolvedTechnician" class="fm-workflow-stepper__technician-card">
                <span class="fm-workflow-stepper__technician-avatar" aria-hidden="true">
                  <i class="pi pi-user"></i>
                </span>
                <div class="fm-workflow-stepper__technician-main">
                  <span class="fm-workflow-stepper__eyebrow">TÉCNICO ENCONTRADO</span>
                  <strong>{{ resolvedTechnician.nombre }}</strong>
                  <small>{{ resolvedTechnician.techId }}</small>
                </div>
                <div class="fm-workflow-stepper__technician-meta">
                  <span><i class="pi pi-building"></i>{{ resolvedTechnician.empresaContratista }}</span>
                  <span><i class="pi pi-map-marker"></i>{{ resolvedTechnician.baseTecnica }} · {{ resolvedTechnician.provincia }}</span>
                </div>
              </div>
            </div>

            <div class="fm-workflow-stepper__actions fm-workflow-stepper__actions--split">
              <div class="fm-workflow-stepper__actions-group">
                <FmButton
                  label="ATRÁS"
                  icon="pi-arrow-left"
                  variant="outline"
                  @click="goBack(activateCallback, '1')"
                />
                <FmButton
                  label="LIMPIAR"
                  variant="outline"
                  @click="clearTechnicianForm"
                />
              </div>

              <div class="fm-workflow-stepper__actions-group">
                <FmButton
                  label="VOLVER A LA GRILLA"
                  icon="pi-times"
                  variant="outline"
                  @click="cancelFlow"
                />
                <FmButton
                  label="SIGUIENTE"
                  icon="pi-arrow-right"
                  @click="goToConfirmation(activateCallback)"
                />
              </div>
            </div>
          </div>
        </StepPanel>

        <StepPanel v-slot="{ activateCallback }" value="3">
          <div class="fm-workflow-stepper__panel">
            <div class="fm-workflow-stepper__panel-title">
              <div>
                <span class="fm-workflow-stepper__eyebrow">PASO 3 DE 3</span>
                <h4>Revisá y confirmá el reproceso</h4>
                <p>Verificá la selección, el técnico y agregá la nota obligatoria.</p>
              </div>
              <span class="fm-workflow-stepper__counter fm-workflow-stepper__counter--ready">
                Listo para ejecutar
              </span>
            </div>

            <Message
              v-if="stepError"
              severity="warn"
              :closable="false"
              class="fm-workflow-stepper__message"
            >
              {{ stepError }}
            </Message>

            <div class="fm-workflow-stepper__review-grid">
              <article class="fm-workflow-stepper__review-card">
                <span class="fm-workflow-stepper__review-card-icon" aria-hidden="true">
                  <i class="pi pi-list-check"></i>
                </span>
                <div>
                  <span class="fm-workflow-stepper__eyebrow">ÓRDENES</span>
                  <strong>{{ selectedRows.length }} OT{{ selectedRows.length === 1 ? '' : 's' }}</strong>
                  <small>{{ selectedOtPreview }}</small>
                </div>
              </article>

              <article class="fm-workflow-stepper__review-card">
                <span class="fm-workflow-stepper__review-card-icon" aria-hidden="true">
                  <i class="pi pi-user-edit"></i>
                </span>
                <div>
                  <span class="fm-workflow-stepper__eyebrow">NUEVO TÉCNICO</span>
                  <strong>{{ resolvedTechnician?.nombre }}</strong>
                  <small>{{ resolvedTechnician?.techId }} · {{ resolvedTechnician?.baseTecnica }}</small>
                </div>
              </article>
            </div>

            <div class="fm-filters fm-workflow-stepper__form fm-workflow-stepper__form--note">
              <div class="fm-field fm-workflow-stepper__note-field">
                <label for="stepper-cambio-tech-nota">NOTA</label>
                <Textarea
                  id="stepper-cambio-tech-nota"
                  v-model="nota"
                  rows="4"
                  fluid
                  auto-resize
                  placeholder="Ingresá el motivo o detalle del reproceso"
                />
                <small>La nota es obligatoria para ejecutar el cambio.</small>
              </div>
            </div>

            <div class="fm-workflow-stepper__actions fm-workflow-stepper__actions--split">
              <div class="fm-workflow-stepper__actions-group">
                <FmButton
                  label="ATRÁS"
                  icon="pi-arrow-left"
                  variant="outline"
                  @click="goBack(activateCallback, '2')"
                />
              </div>

              <div class="fm-workflow-stepper__actions-group">
                <FmButton
                  label="VOLVER A LA GRILLA"
                  icon="pi-times"
                  variant="outline"
                  @click="cancelFlow"
                />
                <FmButton
                  label="EJECUTAR"
                  icon="pi-check"
                  @click="executeFlow"
                />
              </div>
            </div>
          </div>
        </StepPanel>
      </StepPanels>
    </Stepper>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Stepper from 'primevue/stepper'
import StepList from 'primevue/steplist'
import Step from 'primevue/step'
import StepPanels from 'primevue/steppanels'
import StepPanel from 'primevue/steppanel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import FmButton from '@/components/shared/FmButton.vue'
import FmGridShell from '@/components/shared/FmGridShell.vue'
import FmGridPaginator from '@/components/shared/FmGridPaginator.vue'
import type { BuscadorOtRow } from '../store/types'
import { findMockTechnician, type MockTechnician } from '../mocks/reprocesoMocks'

const props = defineProps<{
  rows: BuscadorOtRow[]
}>()

const emit = defineEmits<{
  (event: 'cancel'): void
  (event: 'execute', payload: {
    rows: BuscadorOtRow[]
    technician: MockTechnician
    nota: string
  }): void
}>()

const selectedRows = ref<BuscadorOtRow[]>([])
const first = ref(0)
const pageRows = ref(100)
const rowsOptions = [100, 250, 500]
const stepError = ref('')

const techId = ref('')
const empresaContratista = ref('')
const baseTecnica = ref('')
const provincia = ref('')
const nota = ref('')
const resolvedTechnician = ref<MockTechnician | null>(null)

const selectedOtPreview = computed(() => {
  const values = selectedRows.value
    .map((row) => String(row.nroOt ?? row.id ?? '').trim())
    .filter(Boolean)

  if (!values.length) return 'Sin OTs seleccionadas'
  if (values.length <= 4) return values.join(', ')
  return `${values.slice(0, 4).join(', ')} (+${values.length - 4} más)`
})

watch(() => props.rows, (rows) => {
  const availableIds = new Set(rows.map((row) => String(row.id ?? row.nroOt ?? '')))
  selectedRows.value = selectedRows.value.filter((row) => (
    availableIds.has(String(row.id ?? row.nroOt ?? ''))
  ))
})

watch(techId, (value) => {
  if (!resolvedTechnician.value) return

  if (resolvedTechnician.value.techId !== value.trim().toUpperCase()) {
    clearTechnicianData()
  }
})

const clearError = () => {
  stepError.value = ''
}

const clearTechnicianData = () => {
  resolvedTechnician.value = null
  empresaContratista.value = ''
  baseTecnica.value = ''
  provincia.value = ''
}

const clearTechnicianForm = () => {
  techId.value = ''
  clearTechnicianData()
  clearError()
}

const searchTechnician = () => {
  clearError()
  const technician = findMockTechnician(techId.value)

  if (!technician) {
    clearTechnicianData()
    stepError.value = 'Verifique el Tech ID ingresado, no es posible realizar la acción.'
    return
  }

  resolvedTechnician.value = technician
  techId.value = technician.techId
  empresaContratista.value = technician.empresaContratista
  baseTecnica.value = technician.baseTecnica
  provincia.value = technician.provincia
}

const goToTechnician = (activateCallback: (value: string) => void) => {
  clearError()

  if (selectedRows.value.length === 0) {
    stepError.value = 'Debes seleccionar al menos una fila.'
    return
  }

  activateCallback('2')
}

const goToConfirmation = (activateCallback: (value: string) => void) => {
  clearError()

  if (!resolvedTechnician.value) {
    stepError.value = 'Buscá y validá un Tech ID antes de continuar.'
    return
  }

  activateCallback('3')
}

const goBack = (activateCallback: (value: string) => void, value: string) => {
  clearError()
  activateCallback(value)
}

const cancelFlow = () => {
  clearError()
  emit('cancel')
}

const executeFlow = () => {
  clearError()

  if (!resolvedTechnician.value) {
    stepError.value = 'Verifique el Tech ID ingresado, no es posible realizar la acción.'
    return
  }

  if (!nota.value.trim()) {
    stepError.value = 'La nota es obligatoria.'
    return
  }

  emit('execute', {
    rows: [...selectedRows.value],
    technician: { ...resolvedTechnician.value },
    nota: nota.value.trim()
  })
}
</script>
