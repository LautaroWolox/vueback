<template>
  <div class="fm-screen actas-migration-page">
    <div class="actas-prototype-banner">
      <div>
        <strong>Migración Vue · Gestión de Actas</strong>
        <span>Prototipo funcional sin iframe</span>
      </div>
      <span class="actas-prototype-status">FASE 1</span>
    </div>

    <nav class="actas-main-stepper" aria-label="Flujo de consulta de actas">
      <button
        type="button"
        class="actas-main-step"
        :class="{ 'is-active': activeMainStep === 1, 'is-done': activeMainStep > 1 }"
        @click="activeMainStep = 1"
      >
        <span class="actas-main-step__number">1</span>
        <span>
          <strong>Seleccionar actas</strong>
          <small>Buscar y elegir una o varias</small>
        </span>
      </button>

      <span class="actas-main-step__line" :class="{ 'is-done': activeMainStep > 1 }" />

      <button
        type="button"
        class="actas-main-step"
        :class="{ 'is-active': activeMainStep === 2 }"
        :disabled="!selectedRows.length"
        @click="goToWorkspace"
      >
        <span class="actas-main-step__number">2</span>
        <span>
          <strong>Actas seleccionadas</strong>
          <small>{{ selectedRows.length ? `${selectedRows.length} disponibles` : 'Sin selección' }}</small>
        </span>
      </button>
    </nav>

    <section v-if="activeMainStep === 1" class="actas-selection-view">
      <Accordion v-model:value="openPanels" multiple class="fm-accordion actas-accordion">
        <AccordionPanel value="filters">
          <AccordionHeader>FILTROS DE BÚSQUEDA</AccordionHeader>
          <AccordionContent>
            <div class="actas-filter-grid">
              <label class="actas-field">
                <span>Provincia</span>
                <input v-model.trim="filters.provincia" type="text" @keyup.enter="searchActas" />
              </label>

              <label class="actas-field">
                <span>Contratista</span>
                <input v-model.trim="filters.contratista" type="text" @keyup.enter="searchActas" />
              </label>

              <label class="actas-field">
                <span>Sociedad</span>
                <input v-model.trim="filters.sociedad" type="text" @keyup.enter="searchActas" />
              </label>

              <label class="actas-field">
                <span>Tipo de Contrato</span>
                <input v-model.trim="filters.tipoContrato" type="text" @keyup.enter="searchActas" />
              </label>

              <label class="actas-field actas-field--year">
                <span>Año</span>
                <input v-model.trim="filters.periodoAnio" type="text" inputmode="numeric" @keyup.enter="searchActas" />
              </label>

              <label class="actas-field">
                <span>Periodo</span>
                <input v-model.trim="filters.periodoNombre" type="text" @keyup.enter="searchActas" />
              </label>

              <label class="actas-field">
                <span>Estado</span>
                <input v-model.trim="filters.estadoActa" type="text" @keyup.enter="searchActas" />
              </label>

              <label class="actas-field">
                <span>Acta</span>
                <input v-model.trim="filters.nroActa" type="text" @keyup.enter="searchActas" />
              </label>

              <label class="actas-field">
                <span>N° de OT</span>
                <input v-model.trim="filters.nroOt" type="text" @keyup.enter="searchActas" />
              </label>
            </div>

            <div v-if="validationMessage" class="actas-message actas-message--warning" role="alert">
              <i class="pi pi-exclamation-triangle" />
              <span>{{ validationMessage }}</span>
            </div>

            <div class="actas-filter-actions">
              <Button
                label="BUSCAR"
                icon="pi pi-search"
                size="small"
                :loading="loading"
                @click="searchActas"
              />
              <Button
                label="LIMPIAR"
                icon="pi pi-eraser"
                severity="secondary"
                outlined
                size="small"
                :disabled="loading"
                @click="clearFilters"
              />
            </div>
          </AccordionContent>
        </AccordionPanel>

        <AccordionPanel value="results" class="actas-results-panel">
          <AccordionHeader>ACTAS</AccordionHeader>
          <AccordionContent>
            <div v-if="errorMessage" class="actas-message actas-message--error" role="alert">
              <i class="pi pi-times-circle" />
              <span>{{ errorMessage }}</span>
            </div>

            <div class="actas-grid-toolbar">
              <div>
                <strong>{{ totalElements }}</strong>
                <span> resultado{{ totalElements === 1 ? '' : 's' }}</span>
              </div>
              <div class="actas-selection-summary">
                <i class="pi pi-check-square" />
                <strong>{{ selectedRows.length }}</strong>
                <span> acta{{ selectedRows.length === 1 ? '' : 's' }} seleccionada{{ selectedRows.length === 1 ? '' : 's' }}</span>
              </div>
            </div>

            <FmGridShell
              class="actas-grid-shell"
              :loading="loading"
              loading-title="Consultando Actas"
              loading-message="Buscando información"
            >
              <DataTable
                v-model:selection="selectedRows"
                :value="rows"
                dataKey="nroActa"
                class="actas-main-grid"
                paginator
                :rows="20"
                :rowsPerPageOptions="[20, 50, 100]"
                stripedRows
                scrollable
                scrollHeight="flex"
                :rowHover="true"
                :emptyMessage="hasSearched ? 'No se encontraron resultados' : 'Realice una búsqueda para visualizar actas'"
              >
                <Column selectionMode="multiple" headerStyle="width: 3rem" frozen />
                <Column field="nroActa" header="NRO_ACTA" sortable frozen>
                  <template #body="slotProps">
                    <strong class="actas-number-cell">{{ slotProps.data.nroActa }}</strong>
                  </template>
                </Column>
                <Column field="hayND" header="ND ASOCIADA" sortable />
                <Column field="hayNC" header="NC ASOCIADA" sortable />
                <Column field="estadoActa" header="ESTADO_ACTA" sortable />
                <Column field="periodo" header="PERIODO" sortable />
                <Column field="anio" header="AÑO" sortable />
                <Column field="fechaCreacion" header="FECHA_CREACION_ACTA" sortable />
                <Column field="fechaCierre" header="FECHA_CIERRE_ACTA" sortable />
                <Column field="contratista" header="CONTRATISTA" sortable />
                <Column field="provincia" header="PROVINCIA" sortable />
                <Column field="region" header="REGION" sortable />
                <Column field="tipoContrato" header="TIPO_CONTRATO" sortable />
                <Column field="sociedad" header="SOCIEDAD" sortable />
                <Column field="valoracion" header="VALORACION" sortable />
              </DataTable>
            </FmGridShell>

            <div class="actas-grid-footer">
              <span v-if="selectedRows.length">
                Podés seleccionar todas las actas que necesites antes de continuar.
              </span>
              <span v-else>Seleccioná una o más filas para abrir el workspace.</span>

              <Button
                :label="selectedRows.length ? `CONTINUAR CON ${selectedRows.length} ACTA${selectedRows.length === 1 ? '' : 'S'}` : 'CONTINUAR'"
                icon="pi pi-arrow-right"
                iconPos="right"
                size="small"
                :disabled="!selectedRows.length"
                @click="goToWorkspace"
              />
            </div>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </section>

    <section v-else class="actas-workspace-view">
      <div class="actas-workspace-toolbar">
        <Button
          label="VOLVER A LA GRILLA"
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          size="small"
          @click="activeMainStep = 1"
        />
        <div>
          <strong>{{ selectedRows.length }}</strong>
          <span> acta{{ selectedRows.length === 1 ? '' : 's' }} abierta{{ selectedRows.length === 1 ? '' : 's' }} en este workspace</span>
        </div>
      </div>

      <div class="actas-document-strip" role="tablist" aria-label="Actas seleccionadas">
        <button
          v-for="acta in selectedRows"
          :key="acta.nroActa"
          type="button"
          role="tab"
          class="actas-document-tab"
          :class="{ 'is-active': currentActa?.nroActa === acta.nroActa }"
          :aria-selected="currentActa?.nroActa === acta.nroActa"
          @click="openActa(acta)"
        >
          <span>ACTA</span>
          <strong>{{ acta.nroActa }}</strong>
          <small>{{ acta.estadoActa || 'Sin estado' }}</small>
        </button>
      </div>

      <div v-if="currentActa" class="actas-document-workspace">
        <aside class="actas-vertical-stepper" aria-label="Detalle de acta">
          <div class="actas-current-document">
            <span>Acta seleccionada</span>
            <strong>{{ currentActa.nroActa }}</strong>
            <small>{{ currentActa.contratista || 'Contratista no informado' }}</small>
          </div>

          <button
            v-for="(step, index) in detailSteps"
            :key="step.key"
            type="button"
            class="actas-detail-step"
            :class="{ 'is-active': currentDetailStep === step.key }"
            @click="setDetailStep(step.key)"
          >
            <span class="actas-detail-step__rail">
              <span class="actas-detail-step__dot">{{ index + 1 }}</span>
              <span v-if="index < detailSteps.length - 1" class="actas-detail-step__line" />
            </span>
            <span class="actas-detail-step__copy">
              <strong>{{ step.label }}</strong>
              <small>{{ step.description }}</small>
            </span>
          </button>
        </aside>

        <main class="actas-detail-content">
          <header class="actas-detail-header">
            <div>
              <span>{{ currentStepDefinition.label }}</span>
              <h2>Acta {{ currentActa.nroActa }}</h2>
            </div>
            <span class="actas-state-badge">{{ currentActa.estadoActa || 'Sin estado' }}</span>
          </header>

          <section v-if="currentDetailStep === 'resumen'" class="actas-detail-section">
            <div class="actas-summary-grid">
              <article class="actas-summary-card">
                <span>Número de Acta</span>
                <strong>{{ currentActa.nroActa || '-' }}</strong>
              </article>
              <article class="actas-summary-card">
                <span>Estado</span>
                <strong>{{ currentActa.estadoActa || '-' }}</strong>
              </article>
              <article class="actas-summary-card">
                <span>Contratista</span>
                <strong>{{ currentActa.contratista || '-' }}</strong>
              </article>
              <article class="actas-summary-card">
                <span>Provincia</span>
                <strong>{{ currentActa.provincia || '-' }}</strong>
              </article>
              <article class="actas-summary-card">
                <span>Sociedad</span>
                <strong>{{ currentActa.sociedad || '-' }}</strong>
              </article>
              <article class="actas-summary-card">
                <span>Tipo de Contrato</span>
                <strong>{{ currentActa.tipoContrato || '-' }}</strong>
              </article>
              <article class="actas-summary-card">
                <span>Periodo</span>
                <strong>{{ currentActa.periodo || '-' }} {{ currentActa.anio || '' }}</strong>
              </article>
              <article class="actas-summary-card">
                <span>Valoración</span>
                <strong>{{ currentActa.valoracion || '-' }}</strong>
              </article>
            </div>

            <div class="actas-architecture-note">
              <i class="pi pi-info-circle" />
              <div>
                <strong>Este detalle ya vive dentro de Vue.</strong>
                <p>
                  La siguiente fase va a conectar aquí los datos completos del detalle del acta sin abrir una pestaña nueva del navegador.
                </p>
              </div>
            </div>
          </section>

          <section v-else-if="currentDetailStep === 'ots'" class="actas-detail-section actas-detail-section--fill">
            <div class="actas-section-title">
              <div>
                <h3>Órdenes de Trabajo</h3>
                <p>La grilla real de OTs de esta acta se conectará en este paso.</p>
              </div>
              <span class="actas-phase-chip">PRÓXIMA FASE</span>
            </div>

            <div class="actas-ot-preview">
              <div class="actas-ot-preview__empty">
                <i class="pi pi-table" />
                <strong>Grilla de OTs</strong>
                <span>Al seleccionar una OT se abrirá el stepper horizontal inferior, no un popup.</span>
              </div>

              <div class="actas-inner-stepper-preview">
                <span class="is-active">1. Resumen</span>
                <i class="pi pi-angle-right" />
                <span>2. Actividades</span>
                <i class="pi pi-angle-right" />
                <span>3. Base instalada</span>
                <i class="pi pi-angle-right" />
                <span>4. Historial</span>
                <i class="pi pi-angle-right" />
                <span>5. Materiales</span>
              </div>
            </div>
          </section>

          <section v-else class="actas-detail-section">
            <div class="actas-placeholder-panel">
              <i :class="currentStepDefinition.icon" />
              <h3>{{ currentStepDefinition.label }}</h3>
              <p>{{ currentStepDefinition.placeholder }}</p>
              <span>Se implementará acá, dentro del workspace, evitando cadenas de pop-ups.</span>
            </div>
          </section>
        </main>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

const DEFAULT_PAGE_SIZE = 100

const activeMainStep = ref(1)
const openPanels = ref(['filters', 'results'])
const rows = ref([])
const selectedRows = ref([])
const currentActa = ref(null)
const loading = ref(false)
const hasSearched = ref(false)
const totalElements = ref(0)
const errorMessage = ref('')
const validationMessage = ref('')
const detailStepByActa = reactive({})

const filters = reactive({
  provincia: '',
  contratista: '',
  sociedad: '',
  tipoContrato: '',
  periodoAnio: '',
  periodoNombre: '',
  estadoActa: '',
  nroActa: '',
  nroOt: ''
})

const detailSteps = [
  {
    key: 'resumen',
    label: 'Resumen',
    description: 'Datos generales del acta',
    icon: 'pi pi-file',
    placeholder: ''
  },
  {
    key: 'ots',
    label: 'Órdenes de Trabajo',
    description: 'OTs incluidas y excluidas',
    icon: 'pi pi-table',
    placeholder: ''
  },
  {
    key: 'validacion',
    label: 'Actividades / Reglas',
    description: 'Validación y verificación',
    icon: 'pi pi-check-circle',
    placeholder: 'Acá vamos a concentrar validación de actividades, reglas A/B y estados, sin abrir modales encadenados.'
  },
  {
    key: 'gestion',
    label: 'Gestión',
    description: 'Excluir, incluir y traspasar',
    icon: 'pi pi-cog',
    placeholder: 'Acá se integrarán inclusión/exclusión de OTs y el flujo de traspaso como procesos guiados.'
  },
  {
    key: 'cierre',
    label: 'Cierre / Certificación',
    description: 'Exportar, valorar y certificar',
    icon: 'pi pi-verified',
    placeholder: 'Acá se concentrarán exportación, calificación, cierre y certificación con confirmaciones mínimas.'
  }
]

const currentDetailStep = computed(() => {
  if (!currentActa.value?.nroActa) return 'resumen'
  return detailStepByActa[currentActa.value.nroActa] || 'resumen'
})

const currentStepDefinition = computed(() => (
  detailSteps.find((step) => step.key === currentDetailStep.value) || detailSteps[0]
))

const nonEmptyFilters = () => Object.entries(filters)
  .filter(([, value]) => String(value ?? '').trim().length > 0)

const validateSearch = () => {
  validationMessage.value = ''
  const active = nonEmptyFilters()

  if (!active.length) {
    validationMessage.value = 'Al menos un dato es obligatorio.'
    return false
  }

  if (filters.nroActa && active.some(([key]) => key !== 'nroActa')) {
    validationMessage.value = 'La búsqueda por Nro de Acta es independiente de otros filtros.'
    return false
  }

  if (filters.nroOt && active.some(([key]) => key !== 'nroOt')) {
    validationMessage.value = 'La búsqueda por Nro de OT es independiente de otros filtros.'
    return false
  }

  return true
}

const searchActas = async () => {
  if (loading.value || !validateSearch()) return

  loading.value = true
  errorMessage.value = ''
  selectedRows.value = []
  currentActa.value = null

  try {
    const params = new URLSearchParams()
    nonEmptyFilters().forEach(([key, value]) => params.set(key, String(value).trim()))
    params.set('page', '0')
    params.set('size', String(DEFAULT_PAGE_SIZE))

    const response = await fetch(`/pc/consultarActas/buscarActas.html?${params.toString()}`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' }
    })

    if (!response.ok) {
      throw new Error(`No se pudo consultar Actas (HTTP ${response.status}).`)
    }

    const payload = await response.json()
    const elements = Array.isArray(payload?.elements)
      ? payload.elements
      : Array.isArray(payload)
        ? payload
        : []

    rows.value = elements
    totalElements.value = Number(payload?.totalElements ?? elements.length)
    hasSearched.value = true

    if (!elements.length) {
      errorMessage.value = 'No se encontraron resultados para los filtros ingresados.'
    }
  } catch (error) {
    rows.value = []
    totalElements.value = 0
    hasSearched.value = true
    errorMessage.value = error instanceof Error
      ? error.message
      : 'Error de conexión consultando Actas.'
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = ''
  })
  rows.value = []
  selectedRows.value = []
  currentActa.value = null
  totalElements.value = 0
  hasSearched.value = false
  validationMessage.value = ''
  errorMessage.value = ''
}

const goToWorkspace = () => {
  if (!selectedRows.value.length) return
  activeMainStep.value = 2

  const stillSelected = selectedRows.value.find(
    (row) => row.nroActa === currentActa.value?.nroActa
  )
  currentActa.value = stillSelected || selectedRows.value[0]
}

const openActa = (acta) => {
  currentActa.value = acta
}

const setDetailStep = (step) => {
  if (!currentActa.value?.nroActa) return
  detailStepByActa[currentActa.value.nroActa] = step
}
</script>

<style scoped>
.actas-migration-page {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 6px 6px;
  overflow: hidden;
  box-sizing: border-box;
  background: #f5f7f8;
  color: #263238;
  font-family: Arial, Helvetica, sans-serif;
}

.actas-prototype-banner {
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 12px;
  background: #073f43;
  color: #fff;
  border-left: 4px solid #12bfc2;
}

.actas-prototype-banner > div {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.actas-prototype-banner strong {
  font-size: 13px;
}

.actas-prototype-banner span {
  font-size: 11px;
  opacity: .86;
}

.actas-prototype-status,
.actas-phase-chip {
  flex: 0 0 auto;
  padding: 3px 7px;
  border: 1px solid rgba(255,255,255,.4);
  border-radius: 999px;
  font-size: 10px !important;
  font-weight: 700;
  letter-spacing: .04em;
}

.actas-main-stepper {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 12px;
  background: #fff;
  border: 1px solid #d9e0e3;
}

.actas-main-step {
  min-width: 220px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 4px 8px;
  border: 0;
  background: transparent;
  color: #6c757d;
  text-align: left;
  cursor: pointer;
}

.actas-main-step:disabled {
  cursor: default;
  opacity: .5;
}

.actas-main-step.is-active,
.actas-main-step.is-done {
  color: #087f82;
}

.actas-main-step__number {
  width: 27px;
  height: 27px;
  flex: 0 0 27px;
  display: grid;
  place-items: center;
  border: 2px solid #aeb8bc;
  border-radius: 50%;
  background: #fff;
  font-size: 12px;
  font-weight: 700;
}

.actas-main-step.is-active .actas-main-step__number {
  border-color: #0fb8bb;
  background: #0fb8bb;
  color: #fff;
}

.actas-main-step.is-done .actas-main-step__number {
  border-color: #0fb8bb;
  color: #087f82;
}

.actas-main-step strong,
.actas-main-step small {
  display: block;
}

.actas-main-step strong {
  font-size: 12px;
}

.actas-main-step small {
  margin-top: 1px;
  font-size: 10px;
  font-weight: 400;
}

.actas-main-step__line {
  width: 90px;
  height: 2px;
  flex: 0 0 90px;
  background: #d4dcdf;
}

.actas-main-step__line.is-done {
  background: #0fb8bb;
}

.actas-selection-view,
.actas-workspace-view {
  min-height: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.actas-accordion {
  min-height: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 5px !important;
  overflow: hidden;
}

.actas-accordion :deep(.p-accordionpanel) {
  flex: 0 0 auto;
  border: 1px solid #d6dde2 !important;
  border-radius: 0 !important;
  background: #fff !important;
}

.actas-accordion :deep(.actas-results-panel.p-accordionpanel) {
  min-height: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.actas-accordion :deep(.p-accordionheader) {
  min-height: 29px !important;
  padding: 5px 10px !important;
  border-radius: 0 !important;
  background: #f5f6f6 !important;
  color: #111 !important;
  font-size: 12px !important;
  font-weight: 700 !important;
}

.actas-accordion :deep(.actas-results-panel .p-accordioncontent),
.actas-accordion :deep(.actas-results-panel .p-accordioncontent-content) {
  min-height: 0;
  height: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.actas-accordion :deep(.p-accordioncontent-content) {
  padding: 9px 10px !important;
}

.actas-filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(140px, 1fr));
  gap: 7px 12px;
}

.actas-field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.actas-field > span {
  font-size: 11px;
  font-weight: 700;
  color: #34464b;
}

.actas-field input {
  width: 100%;
  height: 29px;
  padding: 4px 8px;
  border: 1px solid #b7c3c7;
  border-radius: 2px;
  outline: none;
  background: #fff;
  color: #263238;
  font-size: 12px;
  box-sizing: border-box;
}

.actas-field input:focus {
  border-color: #0fb8bb;
  box-shadow: 0 0 0 1px #0fb8bb;
}

.actas-filter-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 9px;
}

.actas-message {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 8px;
  padding: 7px 9px;
  border: 1px solid;
  font-size: 11px;
}

.actas-message--warning {
  border-color: #e5c46b;
  background: #fff9e8;
  color: #775b0a;
}

.actas-message--error {
  flex: 0 0 auto;
  margin: 0 0 7px;
  border-color: #e4b2b7;
  background: #fff4f5;
  color: #9b2b35;
}

.actas-grid-toolbar,
.actas-grid-footer,
.actas-workspace-toolbar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.actas-grid-toolbar {
  min-height: 30px;
  padding: 0 2px 7px;
  color: #536469;
  font-size: 11px;
}

.actas-selection-summary {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #087f82;
}

.actas-grid-shell {
  min-height: 0;
  flex: 1 1 auto;
  overflow: hidden;
  border: 1px solid #d6dde2;
}

.actas-main-grid {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.actas-main-grid :deep(.p-datatable-table-container) {
  min-height: 0;
  flex: 1 1 auto;
}

.actas-main-grid :deep(.p-datatable-thead > tr > th) {
  white-space: nowrap;
  font-size: 11px;
}

.actas-main-grid :deep(.p-datatable-tbody > tr > td) {
  white-space: nowrap;
  font-size: 11px;
}

.actas-number-cell {
  color: #087f82;
}

.actas-grid-footer {
  min-height: 43px;
  padding: 7px 2px 0;
  color: #64757a;
  font-size: 11px;
}

.actas-workspace-toolbar {
  min-height: 42px;
  padding: 5px 8px;
  background: #fff;
  border: 1px solid #d9e0e3;
  font-size: 11px;
  color: #5c6c71;
}

.actas-document-strip {
  flex: 0 0 auto;
  display: flex;
  gap: 5px;
  padding: 7px 8px;
  overflow-x: auto;
  background: #edf1f2;
  border-right: 1px solid #d9e0e3;
  border-left: 1px solid #d9e0e3;
}

.actas-document-tab {
  min-width: 130px;
  padding: 6px 10px;
  border: 1px solid #c8d1d4;
  border-bottom: 3px solid transparent;
  background: #fff;
  color: #4e5d62;
  text-align: left;
  cursor: pointer;
}

.actas-document-tab:hover {
  background: #f3fbfb;
  border-color: #89d8da;
}

.actas-document-tab.is-active {
  border-color: #0fb8bb;
  border-bottom-color: #0b8f91;
  background: #e9fbfb;
  color: #075f61;
}

.actas-document-tab span,
.actas-document-tab strong,
.actas-document-tab small {
  display: block;
}

.actas-document-tab span {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .05em;
}

.actas-document-tab strong {
  margin: 1px 0;
  font-size: 13px;
}

.actas-document-tab small {
  font-size: 10px;
}

.actas-document-workspace {
  min-height: 0;
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: 245px minmax(0, 1fr);
  overflow: hidden;
  background: #fff;
  border: 1px solid #d9e0e3;
}

.actas-vertical-stepper {
  min-height: 0;
  padding: 12px 10px;
  overflow-y: auto;
  background: #f7f9f9;
  border-right: 1px solid #d9e0e3;
}

.actas-current-document {
  margin-bottom: 12px;
  padding: 8px 9px;
  border-left: 3px solid #0fb8bb;
  background: #fff;
}

.actas-current-document span,
.actas-current-document strong,
.actas-current-document small {
  display: block;
}

.actas-current-document span {
  font-size: 9px;
  color: #718084;
  text-transform: uppercase;
}

.actas-current-document strong {
  margin: 2px 0;
  color: #075f61;
  font-size: 15px;
}

.actas-current-document small {
  font-size: 10px;
  color: #617075;
}

.actas-detail-step {
  width: 100%;
  min-height: 54px;
  display: flex;
  align-items: stretch;
  gap: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #647378;
  text-align: left;
  cursor: pointer;
}

.actas-detail-step__rail {
  width: 27px;
  flex: 0 0 27px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.actas-detail-step__dot {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  display: grid;
  place-items: center;
  border: 2px solid #b9c4c7;
  border-radius: 50%;
  background: #fff;
  font-size: 10px;
  font-weight: 700;
}

.actas-detail-step__line {
  width: 2px;
  flex: 1 1 auto;
  min-height: 24px;
  background: #ccd5d8;
}

.actas-detail-step__copy {
  min-width: 0;
  flex: 1 1 auto;
  padding: 3px 6px 8px;
}

.actas-detail-step__copy strong,
.actas-detail-step__copy small {
  display: block;
}

.actas-detail-step__copy strong {
  font-size: 11px;
}

.actas-detail-step__copy small {
  margin-top: 2px;
  font-size: 9px;
}

.actas-detail-step.is-active {
  color: #087f82;
}

.actas-detail-step.is-active .actas-detail-step__dot {
  border-color: #0fb8bb;
  background: #0fb8bb;
  color: #fff;
}

.actas-detail-step.is-active .actas-detail-step__copy {
  background: #e9fafa;
  box-shadow: inset 3px 0 0 #0fb8bb;
}

.actas-detail-content {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.actas-detail-header {
  flex: 0 0 auto;
  min-height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 9px 14px;
  border-bottom: 1px solid #dce2e4;
  background: #fff;
}

.actas-detail-header span {
  font-size: 10px;
  color: #748287;
}

.actas-detail-header h2 {
  margin: 2px 0 0;
  font-size: 17px;
  color: #253438;
}

.actas-state-badge {
  padding: 4px 9px;
  border-radius: 999px;
  background: #e9fafa;
  color: #087f82 !important;
  font-weight: 700;
}

.actas-detail-section {
  min-height: 0;
  flex: 1 1 auto;
  padding: 14px;
  overflow: auto;
  background: #fbfcfc;
}

.actas-detail-section--fill {
  display: flex;
  flex-direction: column;
}

.actas-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(150px, 1fr));
  gap: 10px;
}

.actas-summary-card {
  min-height: 62px;
  padding: 10px 11px;
  border: 1px solid #dce3e5;
  border-top: 3px solid #0fb8bb;
  background: #fff;
}

.actas-summary-card span,
.actas-summary-card strong {
  display: block;
}

.actas-summary-card span {
  margin-bottom: 5px;
  font-size: 9px;
  color: #77868b;
  text-transform: uppercase;
}

.actas-summary-card strong {
  font-size: 12px;
  color: #26383d;
}

.actas-architecture-note {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  padding: 11px 13px;
  border: 1px solid #a8dfe0;
  background: #eefcfc;
  color: #275c5e;
}

.actas-architecture-note i {
  margin-top: 2px;
  color: #0b9799;
}

.actas-architecture-note strong {
  font-size: 11px;
}

.actas-architecture-note p {
  margin: 3px 0 0;
  font-size: 10px;
}

.actas-section-title {
  flex: 0 0 auto;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.actas-section-title h3,
.actas-placeholder-panel h3 {
  margin: 0;
  color: #26383d;
  font-size: 14px;
}

.actas-section-title p,
.actas-placeholder-panel p {
  margin: 3px 0 0;
  color: #6d7c81;
  font-size: 10px;
}

.actas-phase-chip {
  border-color: #0fb8bb;
  background: #e9fafa;
  color: #087f82;
}

.actas-ot-preview {
  min-height: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.actas-ot-preview__empty {
  min-height: 180px;
  flex: 1 1 auto;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 5px;
  border: 1px dashed #aab8bc;
  background: #fff;
  color: #77868b;
  text-align: center;
}

.actas-ot-preview__empty i {
  font-size: 27px;
  color: #0fb8bb;
}

.actas-ot-preview__empty strong {
  color: #34464b;
  font-size: 12px;
}

.actas-ot-preview__empty span {
  max-width: 470px;
  font-size: 10px;
}

.actas-inner-stepper-preview {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px;
  border: 1px solid #dce3e5;
  background: #fff;
  color: #718084;
  font-size: 10px;
}

.actas-inner-stepper-preview span {
  padding: 5px 8px;
  border-radius: 999px;
}

.actas-inner-stepper-preview span.is-active {
  background: #0fb8bb;
  color: #fff;
  font-weight: 700;
}

.actas-placeholder-panel {
  min-height: 260px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 6px;
  border: 1px dashed #aab8bc;
  background: #fff;
  color: #6d7c81;
  text-align: center;
}

.actas-placeholder-panel > i {
  font-size: 30px;
  color: #0fb8bb;
}

.actas-placeholder-panel > span {
  max-width: 540px;
  font-size: 10px;
}

@media (max-width: 1100px) {
  .actas-filter-grid,
  .actas-summary-grid {
    grid-template-columns: repeat(2, minmax(150px, 1fr));
  }

  .actas-main-step {
    min-width: 180px;
  }

  .actas-main-step__line {
    width: 50px;
    flex-basis: 50px;
  }
}

@media (max-width: 760px) {
  .actas-main-stepper {
    justify-content: flex-start;
    overflow-x: auto;
  }

  .actas-filter-grid,
  .actas-summary-grid {
    grid-template-columns: 1fr;
  }

  .actas-document-workspace {
    grid-template-columns: 1fr;
  }

  .actas-vertical-stepper {
    display: flex;
    gap: 5px;
    padding: 7px;
    overflow-x: auto;
    border-right: 0;
    border-bottom: 1px solid #d9e0e3;
  }

  .actas-current-document {
    display: none;
  }

  .actas-detail-step {
    min-width: 145px;
    min-height: 46px;
  }

  .actas-detail-step__rail {
    display: none;
  }
}
</style>
