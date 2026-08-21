<template>
  <div class="fm-screen actas-v2-page">
    <header class="actas-v2-heading">
      <div>
        <span class="actas-v2-eyebrow">Gestión de Actas</span>
        <h1>Consultar Actas</h1>
      </div>
      <div class="actas-v2-heading__status">
        <span class="actas-v2-live-dot" />
        Datos reales FM
      </div>
    </header>

    <nav class="actas-main-stepper" aria-label="Flujo de Gestión de Actas">
      <button
        type="button"
        class="actas-main-step"
        :class="{ 'is-active': mainStep === 1, 'is-complete': mainStep === 2 }"
        @click="mainStep = 1"
      >
        <span class="actas-main-step__index">1</span>
        <span class="actas-main-step__copy">
          <strong>Seleccionar actas</strong>
          <small>Buscar y elegir una o varias</small>
        </span>
      </button>
      <span class="actas-main-step__connector" :class="{ 'is-complete': mainStep === 2 }" />
      <button
        type="button"
        class="actas-main-step"
        :class="{ 'is-active': mainStep === 2 }"
        :disabled="!selectedRows.length"
        @click="goToWorkspace"
      >
        <span class="actas-main-step__index">2</span>
        <span class="actas-main-step__copy">
          <strong>Actas seleccionadas</strong>
          <small>{{ selectedRows.length ? `${selectedRows.length} disponibles` : 'Sin selección' }}</small>
        </span>
      </button>
    </nav>

    <section v-if="mainStep === 1" class="actas-selection-page">
      <article class="actas-filter-card">
        <header class="actas-card-heading">
          <span class="actas-card-heading__icon"><i class="pi pi-clipboard" /></span>
          <span>Datos Generales</span>
        </header>
        <div class="actas-card-divider" />

        <div class="actas-general-grid">
          <label class="actas-form-field">
            <span>Provincia</span>
            <Select
              v-model="filters.provincia"
              :options="catalogs.provincia"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione..."
              showClear
              filter
              :loading="catalogsLoading"
              class="actas-select"
            />
          </label>

          <label class="actas-form-field">
            <span>Contratista Acta</span>
            <Select
              v-model="filters.contratista"
              :options="catalogs.contratista"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione..."
              showClear
              filter
              :loading="catalogsLoading"
              class="actas-select"
            />
          </label>

          <label class="actas-form-field">
            <span>Sociedad Acta</span>
            <Select
              v-model="filters.sociedad"
              :options="catalogs.sociedad"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione..."
              showClear
              filter
              :loading="catalogsLoading"
              class="actas-select"
            />
          </label>

          <label class="actas-form-field">
            <span>Tipo de Contrato</span>
            <Select
              v-model="filters.tipoContrato"
              :options="catalogs.tipoContrato"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione..."
              showClear
              filter
              :loading="catalogsLoading"
              class="actas-select"
            />
          </label>

          <label class="actas-form-field">
            <span>Año</span>
            <Select
              v-model="filters.periodoAnio"
              :options="catalogs.periodoAnio"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione..."
              showClear
              :loading="catalogsLoading"
              class="actas-select"
            />
          </label>

          <label class="actas-form-field">
            <span>Período</span>
            <Select
              v-model="filters.periodoNombre"
              :options="periodOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione..."
              showClear
              :disabled="!filters.periodoAnio"
              :loading="catalogsLoading"
              class="actas-select"
            />
          </label>

          <label class="actas-form-field">
            <span>Estado</span>
            <Select
              v-model="filters.estadoActa"
              :options="catalogs.estadoActa"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione..."
              showClear
              :loading="catalogsLoading"
              class="actas-select"
            />
          </label>
        </div>
      </article>

      <article class="actas-filter-card actas-reference-card">
        <header class="actas-card-heading">
          <span class="actas-card-heading__icon"><i class="pi pi-link" /></span>
          <span>Referencias</span>
        </header>
        <div class="actas-card-divider" />

        <div class="actas-reference-grid">
          <label class="actas-form-field">
            <span>Nro de Acta</span>
            <InputText
              v-model.trim="filters.nroActa"
              placeholder="Ingrese el número de acta"
              class="actas-input"
              @keyup.enter="runSearch"
            />
          </label>
          <label class="actas-form-field">
            <span>N° de OT</span>
            <InputText
              v-model.trim="filters.nroOt"
              placeholder="Ingrese el número de OT"
              class="actas-input"
              @keyup.enter="runSearch"
            />
          </label>
        </div>
      </article>

      <div v-if="catalogsError || validationMessage || searchError" class="actas-feedback" role="alert">
        <i class="pi pi-exclamation-triangle" />
        <span>{{ validationMessage || searchError || catalogsError }}</span>
      </div>

      <div class="actas-search-actions">
        <Button
          label="BUSCAR"
          icon="pi pi-search"
          class="actas-primary-button"
          :loading="searchLoading"
          @click="runSearch"
        />
        <Button
          label="LIMPIAR"
          icon="pi pi-eraser"
          severity="secondary"
          outlined
          class="actas-secondary-button"
          @click="clearSearch"
        />
      </div>

      <section class="actas-grid-card">
        <header class="actas-grid-card__heading">
          <div>
            <span class="actas-grid-card__icon"><i class="pi pi-table" /></span>
            <div>
              <strong>Actas</strong>
              <small>{{ hasSearched ? `${totalElements} resultado${totalElements === 1 ? '' : 's'}` : 'Realice una búsqueda' }}</small>
            </div>
          </div>
          <span class="actas-selection-count">
            <i class="pi pi-check-square" />
            {{ selectedRows.length }} acta{{ selectedRows.length === 1 ? '' : 's' }} seleccionada{{ selectedRows.length === 1 ? '' : 's' }}
          </span>
        </header>

        <FmGridShell
          class="actas-grid-shell"
          :loading="searchLoading"
          loading-title="Consultando Actas"
          loading-message="Buscando información en Field Manager"
        >
          <DataTable
            v-model:selection="selectedRows"
            v-model:filters="actaTableFilters"
            v-model:first="actaFirst"
            v-model:rows="actaRowsPerPage"
            :value="rows"
            dataKey="nroActa"
            class="fm-pass-grid actas-main-grid"
            scrollable
            scrollHeight="flex"
            filterDisplay="row"
            removableSort
            sortMode="single"
            paginator
            :rowsPerPageOptions="[100, 250, 500]"
            :resizableColumns="true"
            columnResizeMode="fit"
            showGridlines
            stripedRows
          >
            <template
              #paginatorcontainer="{
                first,
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
                :first="first"
                :last="last"
                :page="page"
                :page-count="Math.max(pageCount, 1)"
                :rows="paginatorRows"
                :total-records="totalRecords"
                :rows-options="[100, 250, 500]"
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
              <div class="fm-grid-empty">
                {{ hasSearched ? 'No hay resultados' : 'Realice una búsqueda para visualizar actas' }}
              </div>
            </template>

            <Column selectionMode="multiple" frozen :exportable="false" style="width: 44px; min-width: 44px" />

            <Column
              v-for="column in actaColumns"
              :key="column.field"
              :field="column.field"
              :header="column.header"
              sortable
              filter
              :showFilterMenu="false"
              :frozen="column.frozen"
              :style="columnStyle(column)"
              :headerStyle="columnStyle(column)"
              :bodyStyle="columnStyle(column)"
            >
              <template #filter="{ filterModel, filterCallback }">
                <div class="fm-filter-cell actas-filter-cell">
                  <span class="fm-filter-prefix">~</span>
                  <InputText
                    v-model="filterModel.value"
                    type="text"
                    class="fm-column-filter actas-column-filter"
                    @input="filterCallback()"
                  />
                  <button
                    type="button"
                    class="actas-filter-clear"
                    title="Limpiar filtro"
                    aria-label="Limpiar filtro"
                    @click="clearColumnFilter(filterModel, filterCallback, 'acta')"
                  >×</button>
                </div>
              </template>

              <template #body="{ data }">
                <span class="actas-cell-text" :class="{ 'actas-cell-text--strong': column.field === 'nroActa' }">
                  {{ data[column.field] ?? '' }}
                </span>
              </template>
            </Column>
          </DataTable>
        </FmGridShell>

        <footer class="actas-grid-footer">
          <span>
            {{ selectedRows.length ? 'Podés seleccionar todas las actas que necesites.' : 'Seleccioná una o más filas para continuar.' }}
          </span>
          <Button
            :label="selectedRows.length ? `CONTINUAR CON ${selectedRows.length} ACTA${selectedRows.length === 1 ? '' : 'S'}` : 'CONTINUAR'"
            icon="pi pi-arrow-right"
            iconPos="right"
            class="actas-primary-button"
            :disabled="!selectedRows.length"
            @click="goToWorkspace"
          />
        </footer>
      </section>
    </section>

    <section v-else class="actas-workspace-page">
      <header class="actas-workspace-topbar">
        <Button
          label="VOLVER A LA GRILLA"
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          class="actas-secondary-button"
          @click="mainStep = 1"
        />
        <span>
          <strong>{{ selectedRows.length }}</strong>
          acta{{ selectedRows.length === 1 ? '' : 's' }} en el workspace
        </span>
      </header>

      <div class="actas-document-tabs" role="tablist" aria-label="Actas seleccionadas">
        <button
          v-for="acta in selectedRows"
          :key="acta.nroActa"
          type="button"
          class="actas-document-tab"
          :class="{ 'is-active': activeActaNumber === acta.nroActa }"
          @click="openActa(acta)"
        >
          <span>ACTA</span>
          <strong>{{ acta.nroActa }}</strong>
          <small>{{ acta.estadoActa || 'Sin estado' }}</small>
        </button>
      </div>

      <div v-if="currentActa" class="actas-document-layout">
        <aside class="actas-detail-stepper">
          <div class="actas-detail-stepper__document">
            <span>Acta seleccionada</span>
            <strong>{{ currentActa.nroActa }}</strong>
            <small>{{ currentHeader.contratista || currentHeader.empresaContratista || 'Contratista no informado' }}</small>
          </div>

          <button
            v-for="(step, index) in detailSteps"
            :key="step.key"
            type="button"
            class="actas-detail-step"
            :class="{ 'is-active': currentUi.detailStep === step.key }"
            @click="currentUi.detailStep = step.key"
          >
            <span class="actas-detail-step__rail">
              <span class="actas-detail-step__dot">{{ index + 1 }}</span>
              <span v-if="index < detailSteps.length - 1" class="actas-detail-step__line" />
            </span>
            <span class="actas-detail-step__label">
              <strong>{{ step.label }}</strong>
              <small>{{ step.description }}</small>
            </span>
          </button>
        </aside>

        <main class="actas-detail-panel">
          <FmTypingLoader
            v-if="currentDetailLoading"
            overlay
            title="Cargando Acta"
            :message="`Consultando detalle de ${currentActa.nroActa}`"
          />

          <div v-if="currentDetailError" class="actas-feedback actas-feedback--inside" role="alert">
            <i class="pi pi-exclamation-triangle" />
            <span>{{ currentDetailError }}</span>
          </div>

          <template v-else>
            <header class="actas-detail-panel__header">
              <div>
                <span>{{ currentStep.label }}</span>
                <h2>Acta {{ currentActa.nroActa }}</h2>
              </div>
              <span class="actas-state-badge">{{ currentHeader.estado || currentActa.estadoActa || 'Sin estado' }}</span>
            </header>

            <section v-if="currentUi.detailStep === 'resumen'" class="actas-detail-body">
              <div class="actas-summary-grid">
                <article v-for="item in summaryItems" :key="item.label" class="actas-summary-item">
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value || '-' }}</strong>
                </article>
              </div>
              <div class="actas-real-data-note">
                <i class="pi pi-database" />
                <div>
                  <strong>Detalle real cargado desde FM</strong>
                  <span>Esta vista usa el endpoint JSON del detalle de Acta; no abre una pestaña nueva.</span>
                </div>
              </div>
            </section>

            <section v-else-if="currentUi.detailStep === 'ots'" class="actas-detail-body actas-detail-body--fill">
              <template v-if="!currentUi.selectedOt">
                <div class="actas-section-heading">
                  <div>
                    <h3>Órdenes de Trabajo</h3>
                    <p>Seleccioná el número de OT para abrir su detalle dentro de este workspace.</p>
                  </div>
                  <span class="actas-record-chip">{{ currentOtRows.length }} OTs</span>
                </div>

                <FmGridShell class="actas-ot-grid-shell" :loading="false">
                  <DataTable
                    v-model:filters="otTableFilters"
                    v-model:first="otFirst"
                    v-model:rows="otRowsPerPage"
                    :value="currentOtRows"
                    dataKey="numeroOT"
                    class="fm-pass-grid actas-ot-grid"
                    scrollable
                    scrollHeight="flex"
                    filterDisplay="row"
                    paginator
                    :rowsPerPageOptions="[100, 250, 500]"
                    showGridlines
                    stripedRows
                  >
                    <template
                      #paginatorcontainer="{
                        first,
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
                        :first="first"
                        :last="last"
                        :page="page"
                        :page-count="Math.max(pageCount, 1)"
                        :rows="paginatorRows"
                        :total-records="totalRecords"
                        :rows-options="[100, 250, 500]"
                        :show-rows-select="true"
                        :show-counter="true"
                        :auto-max-rows="false"
                        :counter-text="totalRecords === 0 ? 'No hay OTs' : ''"
                        @first-page="firstPageCallback"
                        @prev-page="prevPageCallback"
                        @next-page="nextPageCallback"
                        @last-page="lastPageCallback"
                        @page-change="changePageCallback"
                        @rows-change="rowChangeCallback"
                      />
                    </template>

                    <template #empty><div class="fm-grid-empty">No hay OTs para esta Acta</div></template>

                    <Column
                      v-for="column in otColumns"
                      :key="column.field"
                      :field="column.field"
                      :header="column.header"
                      sortable
                      filter
                      :showFilterMenu="false"
                      :style="columnStyle(column)"
                      :headerStyle="columnStyle(column)"
                      :bodyStyle="columnStyle(column)"
                    >
                      <template #filter="{ filterModel, filterCallback }">
                        <div class="fm-filter-cell actas-filter-cell">
                          <span class="fm-filter-prefix">~</span>
                          <InputText
                            v-model="filterModel.value"
                            class="fm-column-filter actas-column-filter"
                            @input="filterCallback()"
                          />
                          <button
                            type="button"
                            class="actas-filter-clear"
                            @click="clearColumnFilter(filterModel, filterCallback, 'ot')"
                          >×</button>
                        </div>
                      </template>

                      <template #body="{ data }">
                        <button
                          v-if="column.field === 'numeroOT'"
                          type="button"
                          class="actas-ot-link"
                          @click="openOt(data)"
                        >
                          {{ data.numeroOT }}
                        </button>
                        <span v-else class="actas-cell-text">{{ data[column.field] ?? '' }}</span>
                      </template>
                    </Column>
                  </DataTable>
                </FmGridShell>
              </template>

              <template v-else>
                <div class="actas-ot-workspace-heading">
                  <Button
                    label="VOLVER A OTS"
                    icon="pi pi-arrow-left"
                    severity="secondary"
                    text
                    @click="currentUi.selectedOt = null"
                  />
                  <div>
                    <span>Orden de Trabajo</span>
                    <strong>{{ currentUi.selectedOt.numeroOT }}</strong>
                  </div>
                  <span class="actas-state-badge">{{ currentUi.selectedOt.reglaFlujo || currentUi.selectedOt.validado || '-' }}</span>
                </div>

                <nav class="actas-ot-stepper" aria-label="Detalle de Orden de Trabajo">
                  <button
                    v-for="(tab, index) in otTabs"
                    :key="tab.key"
                    type="button"
                    :class="{ 'is-active': currentUi.otTab === tab.key }"
                    @click="selectOtTab(tab.key)"
                  >
                    <span>{{ index + 1 }}</span>
                    <strong>{{ tab.label }}</strong>
                  </button>
                </nav>

                <div class="actas-ot-content">
                  <FmTypingLoader
                    v-if="currentOtDetailLoading"
                    overlay
                    title="Cargando OT"
                    :message="`Consultando ${currentUi.selectedOt.numeroOT}`"
                  />

                  <div v-if="currentOtDetailError" class="actas-feedback actas-feedback--inside">
                    <i class="pi pi-exclamation-triangle" />
                    <span>{{ currentOtDetailError }}</span>
                  </div>

                  <template v-else-if="currentOtDetail">
                    <section v-if="currentUi.otTab === 'resumen'" class="actas-ot-summary-grid">
                      <article v-for="item in otSummaryItems" :key="item.label">
                        <span>{{ item.label }}</span>
                        <strong>{{ item.value || '-' }}</strong>
                      </article>
                    </section>

                    <section v-else-if="currentUi.otTab === 'actividades'" class="actas-activity-layout">
                      <div class="actas-subgrid-card">
                        <header><strong>Actividades Originales</strong><span>{{ originalActivities.length }}</span></header>
                        <DataTable :value="originalActivities" class="actas-inner-grid" scrollable scrollHeight="300px" showGridlines stripedRows>
                          <Column field="codActividad" header="CÓDIGO" />
                          <Column field="actividad" header="ACTIVIDAD" />
                          <Column field="cantidad" header="CANTIDAD" />
                          <Column field="codCMO" header="CMO" />
                          <Column field="validada" header="VALIDADA" />
                        </DataTable>
                      </div>
                      <div class="actas-subgrid-card">
                        <header><strong>Actividades Resultantes</strong><span>{{ resultingActivities.length }}</span></header>
                        <DataTable :value="resultingActivities" class="actas-inner-grid" scrollable scrollHeight="300px" showGridlines stripedRows>
                          <Column field="codActividad" header="CÓDIGO" />
                          <Column field="actividad" header="ACTIVIDAD" />
                          <Column field="cantidadResultante" header="CANT. RESULTANTE">
                            <template #body="{ data }">{{ data.cantidadResultante ?? data.cantidad ?? '' }}</template>
                          </Column>
                          <Column field="codCMO" header="CMO" />
                          <Column field="update" header="CAMBIO" />
                        </DataTable>
                      </div>
                    </section>

                    <section v-else-if="currentUi.otTab === 'bases'" class="actas-subgrid-card actas-subgrid-card--single">
                      <header><strong>Base Instalada</strong><span>{{ installedBases.length }}</span></header>
                      <DataTable :value="installedBases" class="actas-inner-grid" showGridlines stripedRows>
                        <Column field="baseInstalada" header="BASE INSTALADA" />
                        <Column field="modelo" header="MODELO" />
                        <Column field="nroSerie" header="NRO SERIE" />
                      </DataTable>
                    </section>

                    <section v-else-if="currentUi.otTab === 'historial'" class="actas-subgrid-card actas-subgrid-card--single">
                      <header><strong>Historial del domicilio</strong><span>{{ historyRows.length }}</span></header>
                      <DataTable
                        v-model:expandedRows="expandedHistoryRows"
                        :value="historyRows"
                        dataKey="nroOt"
                        class="actas-inner-grid"
                        showGridlines
                        stripedRows
                      >
                        <Column expander style="width: 46px" />
                        <Column field="nroOt" header="NRO OT" />
                        <Column field="fechaCierre" header="FECHA CIERRE" />
                        <Column field="nroActa" header="ACTA / NOTA" />
                        <Column field="contratista" header="CONTRATISTA" />
                        <Column field="estadoOt" header="ESTADO OT" />
                        <Column field="estadoActa" header="ESTADO ACTA" />
                        <template #expansion="slotProps">
                          <div class="actas-history-child-grid">
                            <strong>Actividades de OT {{ slotProps.data.nroOt }}</strong>
                            <DataTable :value="slotProps.data.actividades || []" class="actas-inner-grid actas-inner-grid--child" showGridlines>
                              <Column field="codActividad" header="CÓDIGO" />
                              <Column field="actividad" header="ACTIVIDAD" />
                              <Column field="nroNcNd" header="NC / ND" />
                              <Column field="estadoActa" header="ESTADO NC / ND" />
                              <Column field="activo" header="ESTADO ACTIVIDAD" />
                            </DataTable>
                          </div>
                        </template>
                      </DataTable>
                    </section>

                    <section v-else-if="currentUi.otTab === 'materiales'" class="actas-subgrid-card actas-subgrid-card--single">
                      <header><strong>Materiales</strong><span>{{ currentMaterials.length }}</span></header>
                      <FmTypingLoader
                        v-if="currentMaterialsLoading"
                        overlay
                        title="Cargando Materiales"
                        :message="`Consultando OT ${currentUi.selectedOt.numeroOT}`"
                      />
                      <div v-if="currentMaterialsError" class="actas-feedback actas-feedback--inside">
                        <i class="pi pi-exclamation-triangle" />
                        <span>{{ currentMaterialsError }}</span>
                      </div>
                      <DataTable v-else :value="currentMaterials" class="actas-inner-grid" showGridlines stripedRows>
                        <Column field="codigo" header="CÓDIGO" />
                        <Column field="descripcion" header="DESCRIPCIÓN" />
                        <Column field="cantidad" header="CANTIDAD" />
                        <Column field="accion" header="ACCIÓN" />
                        <Column field="estado" header="ESTADO" />
                      </DataTable>
                    </section>
                  </template>
                </div>
              </template>
            </section>

            <section v-else-if="currentUi.detailStep === 'reglas'" class="actas-detail-body">
              <div class="actas-phase-panel">
                <i class="pi pi-sitemap" />
                <div>
                  <h3>Actividades y Reglas</h3>
                  <p>Las actividades reales ya pueden visualizarse desde cada OT. Las acciones de validación y modificación se incorporarán en una fase controlada para no disparar cambios sobre datos productivos durante el prototipo.</p>
                </div>
              </div>
            </section>

            <section v-else-if="currentUi.detailStep === 'gestion'" class="actas-detail-body">
              <div class="actas-phase-panel">
                <i class="pi pi-directions-alt" />
                <div>
                  <h3>Gestión</h3>
                  <p>Acá se integrarán excluir/incluir OTs y el flujo de traspaso como wizard, reemplazando la cadena actual de pop-ups.</p>
                </div>
              </div>
            </section>

            <section v-else class="actas-detail-body">
              <div class="actas-phase-panel">
                <i class="pi pi-check-circle" />
                <div>
                  <h3>Cierre / Certificación</h3>
                  <p>Este paso concentrará calificación, validaciones finales, exportación y certificación con confirmaciones mínimas.</p>
                </div>
              </div>
            </section>
          </template>
        </main>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import FmGridPaginator from '@/components/shared/FmGridPaginator.vue'
import FmTypingLoader from '@/components/shared/FmTypingLoader.vue'
import {
  loadActaDetail,
  loadActasCatalogs,
  loadOtDetail,
  loadOtMaterials,
  searchActas,
} from './services/gestionActasLegacyApi'

const emptyFilters = () => ({
  provincia: '',
  contratista: '',
  sociedad: '',
  tipoContrato: '',
  periodoAnio: '',
  periodoNombre: '',
  estadoActa: '',
  nroActa: '',
  nroOt: '',
})

const filters = reactive(emptyFilters())
const catalogs = reactive({
  provincia: [],
  contratista: [],
  sociedad: [],
  tipoContrato: [],
  periodoAnio: [],
  periodoNombre: [],
  estadoActa: [],
})

const rows = ref([])
const totalElements = ref(0)
const selectedRows = ref([])
const hasSearched = ref(false)
const searchLoading = ref(false)
const searchError = ref('')
const validationMessage = ref('')
const catalogsLoading = ref(false)
const catalogsError = ref('')
const mainStep = ref(1)
const actaFirst = ref(0)
const actaRowsPerPage = ref(100)
const otFirst = ref(0)
const otRowsPerPage = ref(100)
const activeActaNumber = ref('')
const expandedHistoryRows = ref({})

const actaDetails = reactive({})
const actaDetailLoading = reactive({})
const actaDetailErrors = reactive({})
const documentUi = reactive({})
const otDetails = reactive({})
const otDetailLoading = reactive({})
const otDetailErrors = reactive({})
const materialsByOt = reactive({})
const materialsLoading = reactive({})
const materialsErrors = reactive({})

const createGridFilters = (columns) => Object.fromEntries(
  columns.map((column) => [column.field, { value: null, matchMode: 'contains' }])
)

const actaColumns = [
  { field: 'nroActa', header: 'NRO_ACTA', width: '128px', frozen: true },
  { field: 'hayND', header: 'ND ASOCIADA', width: '112px' },
  { field: 'hayNC', header: 'NC ASOCIADA', width: '112px' },
  { field: 'estadoActa', header: 'ESTADO_ACTA', width: '132px' },
  { field: 'periodo', header: 'PERIODO', width: '118px' },
  { field: 'anio', header: 'AÑO', width: '78px' },
  { field: 'fechaCreacion', header: 'FECHA_CREACIÓN', width: '142px' },
  { field: 'fechaCierre', header: 'FECHA_CIERRE', width: '136px' },
  { field: 'contratista', header: 'CONTRATISTA', width: '170px' },
  { field: 'pais', header: 'PAÍS', width: '100px' },
  { field: 'provincia', header: 'PROVINCIA', width: '132px' },
  { field: 'region', header: 'REGIÓN', width: '122px' },
  { field: 'tipoContrato', header: 'TIPO_CONTRATO', width: '150px' },
  { field: 'sociedad', header: 'SOCIEDAD', width: '122px' },
  { field: 'usuarioCierre', header: 'USUARIO_CIERRE', width: '142px' },
  { field: 'valoracion', header: 'VALORACIÓN', width: '112px' },
]

const otColumns = [
  { field: 'numeroOT', header: 'NRO_OT', width: '132px' },
  { field: 'fechaCierre', header: 'FECHA_CIERRE', width: '138px' },
  { field: 'tarea', header: 'CÓDIGO_TAREA', width: '170px' },
  { field: 'direccion', header: 'DIRECCIÓN', width: '210px' },
  { field: 'ciudad', header: 'CIUDAD', width: '140px' },
  { field: 'provincia', header: 'PROVINCIA', width: '132px' },
  { field: 'baseNombre', header: 'BASE', width: '130px' },
  { field: 'contratista', header: 'CONTRATISTA', width: '170px' },
  { field: 'contrato', header: 'CONTRATO', width: '140px' },
  { field: 'sociedad', header: 'SOCIEDAD', width: '120px' },
  { field: 'techNum', header: 'TECH_NUM', width: '122px' },
  { field: 'reglaFlujo', header: 'REGLAS', width: '120px' },
  { field: 'excluida', header: 'EXCLUIDA', width: '100px' },
]

const actaTableFilters = ref(createGridFilters(actaColumns))
const otTableFilters = ref(createGridFilters(otColumns))

const detailSteps = [
  { key: 'resumen', label: 'Resumen', description: 'Datos generales' },
  { key: 'ots', label: 'Órdenes de Trabajo', description: 'Grilla y detalle de OTs' },
  { key: 'reglas', label: 'Actividades / Reglas', description: 'Validación y cambios' },
  { key: 'gestion', label: 'Gestión', description: 'Inclusión y traspaso' },
  { key: 'cierre', label: 'Cierre / Certificación', description: 'Acciones finales' },
]

const otTabs = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'actividades', label: 'Actividades' },
  { key: 'bases', label: 'Base instalada' },
  { key: 'historial', label: 'Historial' },
  { key: 'materiales', label: 'Materiales' },
]

const periodOptions = computed(() => {
  if (!filters.periodoAnio) return []
  return catalogs.periodoNombre.filter((option) => !option.year || option.year === filters.periodoAnio)
})

watch(() => filters.periodoAnio, () => {
  const valid = periodOptions.value.some((option) => option.value === filters.periodoNombre)
  if (!valid) filters.periodoNombre = ''
})

const currentActa = computed(() => selectedRows.value.find((row) => row.nroActa === activeActaNumber.value) || selectedRows.value[0] || null)
const currentActaKey = computed(() => String(currentActa.value?.nroActa || ''))

const ensureDocumentUi = (key) => {
  if (!key) return { detailStep: 'resumen', selectedOt: null, otTab: 'resumen' }
  if (!documentUi[key]) {
    documentUi[key] = reactive({ detailStep: 'resumen', selectedOt: null, otTab: 'resumen' })
  }
  return documentUi[key]
}

const currentUi = computed(() => ensureDocumentUi(currentActaKey.value))
const currentDetail = computed(() => actaDetails[currentActaKey.value] || null)
const currentHeader = computed(() => currentDetail.value?.actaDetalleAdapter || currentActa.value || {})
const currentOtRows = computed(() => currentDetail.value?.listaOt || [])
const currentDetailLoading = computed(() => Boolean(actaDetailLoading[currentActaKey.value]))
const currentDetailError = computed(() => actaDetailErrors[currentActaKey.value] || '')
const currentStep = computed(() => detailSteps.find((step) => step.key === currentUi.value.detailStep) || detailSteps[0])

const summaryItems = computed(() => [
  { label: 'Número de Acta', value: currentActa.value?.nroActa },
  { label: 'Estado', value: currentHeader.value.estado || currentActa.value?.estadoActa },
  { label: 'Provincia', value: currentHeader.value.provincia || currentActa.value?.provincia },
  { label: 'Región', value: currentHeader.value.region || currentActa.value?.region },
  { label: 'Contratista', value: currentHeader.value.empresaContratista || currentActa.value?.contratista },
  { label: 'Sociedad', value: currentHeader.value.sociedad || currentActa.value?.sociedad },
  { label: 'Tipo de Contrato', value: currentHeader.value.tipoContrato || currentActa.value?.tipoContrato },
  { label: 'Período', value: currentHeader.value.periodo || `${currentActa.value?.periodo || ''} ${currentActa.value?.anio || ''}`.trim() },
  { label: 'Calificación', value: currentHeader.value.calificacion || currentActa.value?.valoracion },
  { label: 'Período cumplido', value: currentHeader.value.periodoCumplido === true ? 'Sí' : currentHeader.value.periodoCumplido === false ? 'No' : '' },
])

const currentOtCacheKey = computed(() => currentUi.value.selectedOt ? `${currentActaKey.value}::${currentUi.value.selectedOt.numeroOT}` : '')
const currentOtDetail = computed(() => otDetails[currentOtCacheKey.value] || null)
const currentOtDetailLoading = computed(() => Boolean(otDetailLoading[currentOtCacheKey.value]))
const currentOtDetailError = computed(() => otDetailErrors[currentOtCacheKey.value] || '')
const originalActivities = computed(() => currentOtDetail.value?.actividadesOriginales || [])
const resultingActivities = computed(() => currentOtDetail.value?.actividadesResultantes || [])
const installedBases = computed(() => currentOtDetail.value?.basesInstaladas || [])
const historyRows = computed(() => currentOtDetail.value?.historialDomicilio || [])
const currentMaterials = computed(() => materialsByOt[currentOtCacheKey.value] || [])
const currentMaterialsLoading = computed(() => Boolean(materialsLoading[currentOtCacheKey.value]))
const currentMaterialsError = computed(() => materialsErrors[currentOtCacheKey.value] || '')

const otSummaryItems = computed(() => {
  const detail = currentOtDetail.value || {}
  const selected = currentUi.value.selectedOt || {}
  return [
    { label: 'N° OT', value: selected.numeroOT },
    { label: 'Tarea', value: detail.tarea || selected.tarea },
    { label: 'Domicilio', value: detail.domicilio || selected.direccion },
    { label: 'Clase OT', value: detail.claseOt || selected.claseOT },
    { label: 'Técnico de cierre', value: detail.tecnicoCierre || selected.tecnicoCierre },
    { label: 'N° Cliente', value: detail.nroCliente || selected.nroCliente },
    { label: 'Regla / Flujo', value: detail.reglaFlujo || selected.reglaFlujo },
    { label: 'Tipo OT', value: detail.tipoOT || selected.tipoOT },
  ]
})

const columnStyle = (column) => ({ width: column.width, minWidth: column.width, maxWidth: column.width })

const clearColumnFilter = (filterModel, filterCallback, target) => {
  filterModel.value = null
  filterCallback()
  if (target === 'acta') actaFirst.value = 0
  else otFirst.value = 0
}

const normalize = (value) => String(value ?? '').trim()
const generalFilterKeys = ['provincia', 'contratista', 'sociedad', 'tipoContrato', 'periodoAnio', 'periodoNombre', 'estadoActa']

const validateSearch = () => {
  const generalActive = generalFilterKeys.some((key) => normalize(filters[key]))
  const nroActa = normalize(filters.nroActa)
  const nroOt = normalize(filters.nroOt)

  if (!generalActive && !nroActa && !nroOt) return 'Al menos un dato es obligatorio.'
  if (nroActa && (generalActive || nroOt)) return 'La búsqueda por Nro de Acta es independiente de otros filtros.'
  if (nroOt && (generalActive || nroActa)) return 'La búsqueda por Nro de OT es independiente de otros filtros.'
  return ''
}

const loadCatalogs = async () => {
  catalogsLoading.value = true
  catalogsError.value = ''
  try {
    const result = await loadActasCatalogs()
    Object.keys(catalogs).forEach((key) => {
      catalogs[key] = result[key] || []
    })
  } catch (error) {
    catalogsError.value = error instanceof Error ? error.message : String(error)
  } finally {
    catalogsLoading.value = false
  }
}

const runSearch = async () => {
  validationMessage.value = validateSearch()
  searchError.value = ''
  if (validationMessage.value) return

  searchLoading.value = true
  try {
    const result = await searchActas(filters, { page: 0, size: 500 })
    rows.value = result.elements
    totalElements.value = result.totalElements
    selectedRows.value = []
    hasSearched.value = true
    actaFirst.value = 0
  } catch (error) {
    rows.value = []
    totalElements.value = 0
    selectedRows.value = []
    hasSearched.value = true
    searchError.value = error instanceof Error ? error.message : String(error)
  } finally {
    searchLoading.value = false
  }
}

const clearSearch = () => {
  Object.assign(filters, emptyFilters())
  rows.value = []
  totalElements.value = 0
  selectedRows.value = []
  hasSearched.value = false
  validationMessage.value = ''
  searchError.value = ''
  actaFirst.value = 0
  actaTableFilters.value = createGridFilters(actaColumns)
}

const ensureActaDetail = async (nroActa) => {
  const key = String(nroActa || '')
  if (!key || actaDetails[key] || actaDetailLoading[key]) return
  actaDetailLoading[key] = true
  actaDetailErrors[key] = ''
  try {
    actaDetails[key] = await loadActaDetail(key)
  } catch (error) {
    actaDetailErrors[key] = error instanceof Error ? error.message : String(error)
  } finally {
    actaDetailLoading[key] = false
  }
}

const openActa = async (acta) => {
  if (!acta?.nroActa) return
  activeActaNumber.value = acta.nroActa
  ensureDocumentUi(String(acta.nroActa))
  await ensureActaDetail(acta.nroActa)
}

const goToWorkspace = async () => {
  if (!selectedRows.value.length) return
  mainStep.value = 2
  const first = selectedRows.value.find((row) => row.nroActa === activeActaNumber.value) || selectedRows.value[0]
  await openActa(first)
}

const ensureOtDetail = async (row) => {
  if (!row?.numeroOT || !currentActaKey.value) return
  const key = `${currentActaKey.value}::${row.numeroOT}`
  if (otDetails[key] || otDetailLoading[key]) return
  otDetailLoading[key] = true
  otDetailErrors[key] = ''
  try {
    otDetails[key] = await loadOtDetail({ nroActa: currentActaKey.value, nroOt: row.numeroOT })
  } catch (error) {
    otDetailErrors[key] = error instanceof Error ? error.message : String(error)
  } finally {
    otDetailLoading[key] = false
  }
}

const openOt = async (row) => {
  currentUi.value.selectedOt = row
  currentUi.value.otTab = 'resumen'
  expandedHistoryRows.value = {}
  await ensureOtDetail(row)
}

const ensureMaterials = async () => {
  if (!currentUi.value.selectedOt || !currentOtCacheKey.value) return
  const key = currentOtCacheKey.value
  if (materialsByOt[key] || materialsLoading[key]) return
  materialsLoading[key] = true
  materialsErrors[key] = ''
  try {
    materialsByOt[key] = await loadOtMaterials(currentUi.value.selectedOt.numeroOT)
  } catch (error) {
    materialsErrors[key] = error instanceof Error ? error.message : String(error)
  } finally {
    materialsLoading[key] = false
  }
}

const selectOtTab = async (tab) => {
  currentUi.value.otTab = tab
  if (tab === 'materiales') await ensureMaterials()
}

onMounted(loadCatalogs)
</script>

<style scoped>
.actas-v2-page {
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 12px 14px 16px;
  overflow: auto;
  box-sizing: border-box;
  background: #f5f8fa;
  color: #17212b;
  font-family: Arial, Helvetica, sans-serif;
}

.actas-v2-heading,
.actas-workspace-topbar,
.actas-grid-card__heading,
.actas-detail-panel__header,
.actas-ot-workspace-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.actas-v2-heading {
  margin-bottom: 10px;
}

.actas-v2-heading h1 {
  margin: 2px 0 0;
  font-size: 20px;
  font-weight: 700;
  color: #12202b;
}

.actas-v2-eyebrow {
  color: #0a8f98;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .07em;
}

.actas-v2-heading__status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 10px;
  border: 1px solid #cfe4e6;
  border-radius: 999px;
  background: #fff;
  color: #42606a;
  font-size: 11px;
  font-weight: 700;
}

.actas-v2-live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #0fb8bb;
  box-shadow: 0 0 0 3px #d9f5f5;
}

.actas-main-stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 66px;
  margin-bottom: 12px;
  padding: 8px 20px;
  border: 1px solid #dce5e8;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(24, 50, 61, .04);
}

.actas-main-step {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 210px;
  padding: 7px 10px;
  border: 0;
  background: transparent;
  color: #8a969d;
  text-align: left;
  cursor: pointer;
}

.actas-main-step:disabled { cursor: default; opacity: .55; }
.actas-main-step.is-active { color: #087f88; }

.actas-main-step__index {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  border: 1px solid #cbd7db;
  border-radius: 50%;
  background: #fff;
  font-size: 12px;
  font-weight: 700;
}

.actas-main-step.is-active .actas-main-step__index,
.actas-main-step.is-complete .actas-main-step__index {
  border-color: #0fb8bb;
  background: #0fb8bb;
  color: #fff;
}

.actas-main-step__copy { display: flex; flex-direction: column; gap: 2px; }
.actas-main-step__copy strong { font-size: 12px; }
.actas-main-step__copy small { font-size: 10px; font-weight: 400; }

.actas-main-step__connector {
  width: 120px;
  height: 1px;
  background: #d7e0e3;
}
.actas-main-step__connector.is-complete { background: #0fb8bb; }

.actas-selection-page,
.actas-workspace-page {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.actas-filter-card,
.actas-grid-card,
.actas-document-layout {
  border: 1px solid #dce5e8;
  background: #fff;
  box-shadow: 0 4px 14px rgba(44, 73, 84, .07);
}

.actas-filter-card {
  padding: 14px 18px 16px;
  border-radius: 10px;
}

.actas-card-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #087e91;
  font-size: 13px;
  font-weight: 700;
}

.actas-card-heading__icon,
.actas-grid-card__icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #e7f7f8;
  color: #0796a2;
}

.actas-card-divider {
  height: 1px;
  margin: 10px 0 14px;
  background: #12aeb5;
}

.actas-general-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 14px 22px;
}

.actas-reference-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 14px 28px;
  max-width: 1050px;
}

.actas-form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  color: #243440;
  font-size: 11px;
  font-weight: 700;
}

.actas-select,
.actas-input {
  width: 100%;
}

.actas-v2-page :deep(.actas-select.p-select),
.actas-v2-page :deep(.actas-input.p-inputtext) {
  min-height: 36px;
  border: 1px solid #ccd8dd !important;
  border-radius: 5px !important;
  background: #fff !important;
  box-shadow: none !important;
  font-size: 12px !important;
}

.actas-v2-page :deep(.actas-select.p-select:not(.p-disabled):hover),
.actas-v2-page :deep(.actas-input.p-inputtext:hover) {
  border-color: #8cbfc3 !important;
}

.actas-v2-page :deep(.actas-select.p-select.p-focus),
.actas-v2-page :deep(.actas-input.p-inputtext:focus) {
  border-color: #0fb8bb !important;
  box-shadow: 0 0 0 1px rgba(15, 184, 187, .12) !important;
}

.actas-search-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 2px 0;
}

.actas-v2-page :deep(.actas-primary-button.p-button),
.actas-v2-page :deep(.actas-secondary-button.p-button) {
  min-width: 122px;
  min-height: 34px;
  border-radius: 6px !important;
  font-size: 11px !important;
  font-weight: 700 !important;
}

.actas-v2-page :deep(.actas-primary-button.p-button) {
  border-color: #05aeb4 !important;
  background: #05aeb4 !important;
  color: #fff !important;
}

.actas-v2-page :deep(.actas-secondary-button.p-button) {
  border-color: #d2dde1 !important;
  background: #fff !important;
  color: #5a6d76 !important;
}

.actas-feedback {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 34px;
  padding: 7px 11px;
  border: 1px solid #efd99c;
  border-radius: 5px;
  background: #fffaf0;
  color: #80631b;
  font-size: 11px;
}

.actas-feedback--inside { margin: 12px; }

.actas-grid-card {
  min-height: 420px;
  height: min(56vh, 590px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
}

.actas-grid-card__heading {
  min-height: 48px;
  flex: 0 0 auto;
  padding: 8px 12px;
  border-bottom: 1px solid #dce5e8;
}

.actas-grid-card__heading > div {
  display: flex;
  align-items: center;
  gap: 9px;
}

.actas-grid-card__heading > div > div { display: flex; flex-direction: column; gap: 1px; }
.actas-grid-card__heading strong { color: #21323d; font-size: 12px; text-transform: uppercase; }
.actas-grid-card__heading small { color: #78868c; font-size: 10px; }

.actas-selection-count,
.actas-record-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border: 1px solid #cce8e9;
  border-radius: 999px;
  background: #effafa;
  color: #078993;
  font-size: 10px;
  font-weight: 700;
}

.actas-grid-shell,
.actas-ot-grid-shell {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.actas-main-grid,
.actas-ot-grid {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.actas-v2-page :deep(.actas-main-grid.p-datatable),
.actas-v2-page :deep(.actas-ot-grid.p-datatable) {
  display: flex;
  flex-direction: column;
  min-height: 0;
  font-size: 11px;
}

.actas-v2-page :deep(.actas-main-grid .p-datatable-table-container),
.actas-v2-page :deep(.actas-ot-grid .p-datatable-table-container) {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}

.actas-v2-page :deep(.actas-main-grid .p-datatable-thead > tr > th),
.actas-v2-page :deep(.actas-ot-grid .p-datatable-thead > tr > th) {
  padding: 5px 7px !important;
  border-color: #d8e1e5 !important;
  background: #f2f5f6 !important;
  color: #142934 !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  white-space: nowrap;
}

.actas-v2-page :deep(.actas-main-grid .p-datatable-thead > tr.p-datatable-filter-row > th),
.actas-v2-page :deep(.actas-ot-grid .p-datatable-thead > tr.p-datatable-filter-row > th) {
  position: sticky;
  top: 28px;
  z-index: 3;
  padding: 3px 5px !important;
  background: #fff !important;
}

.actas-v2-page :deep(.actas-main-grid .p-datatable-tbody > tr > td),
.actas-v2-page :deep(.actas-ot-grid .p-datatable-tbody > tr > td) {
  height: 30px;
  padding: 4px 7px !important;
  border-color: #e0e7ea !important;
  color: #26373f;
  font-size: 10.5px;
  white-space: nowrap;
}

.actas-filter-cell {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  border: 1px solid #d5dfe3;
  background: #fff;
}

.actas-v2-page :deep(.actas-column-filter.p-inputtext) {
  min-width: 0;
  width: 100%;
  height: 23px;
  padding: 2px 3px !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  font-size: 10px !important;
}

.actas-filter-clear {
  width: 18px;
  height: 22px;
  flex: 0 0 18px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #788b92;
  cursor: pointer;
}

.actas-cell-text { display: block; overflow: hidden; text-overflow: ellipsis; }
.actas-cell-text--strong { color: #07848d; font-weight: 700; }

.actas-grid-footer {
  min-height: 46px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 10px;
  border-top: 1px solid #dce5e8;
  background: #fff;
  color: #64777f;
  font-size: 10px;
}

.actas-workspace-topbar {
  min-height: 42px;
  padding: 4px 0;
  color: #536871;
  font-size: 11px;
}

.actas-document-tabs {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  padding: 2px 1px 5px;
}

.actas-document-tab {
  min-width: 142px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 8px 12px;
  border: 1px solid #d7e1e5;
  border-radius: 7px;
  background: #fff;
  color: #60727a;
  text-align: left;
  cursor: pointer;
}

.actas-document-tab span { font-size: 9px; font-weight: 700; letter-spacing: .07em; }
.actas-document-tab strong { font-size: 13px; color: #243640; }
.actas-document-tab small { font-size: 9px; }
.actas-document-tab.is-active { border-color: #0fb8bb; background: #effafa; box-shadow: inset 3px 0 0 #0fb8bb; }
.actas-document-tab.is-active strong { color: #087f88; }

.actas-document-layout {
  min-height: 600px;
  height: calc(100vh - 245px);
  display: grid;
  grid-template-columns: 236px minmax(0, 1fr);
  overflow: hidden;
  border-radius: 9px;
}

.actas-detail-stepper {
  min-height: 0;
  overflow-y: auto;
  padding: 14px 12px;
  border-right: 1px solid #dde6e9;
  background: #f9fbfc;
}

.actas-detail-stepper__document {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 14px;
  padding: 10px;
  border: 1px solid #dce7e9;
  border-radius: 7px;
  background: #fff;
}
.actas-detail-stepper__document span { color: #7b8c92; font-size: 9px; text-transform: uppercase; }
.actas-detail-stepper__document strong { color: #087f88; font-size: 15px; }
.actas-detail-stepper__document small { color: #5f727a; font-size: 9px; }

.actas-detail-step {
  width: 100%;
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr);
  gap: 7px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #718087;
  text-align: left;
  cursor: pointer;
}

.actas-detail-step__rail { display: flex; min-height: 58px; flex-direction: column; align-items: center; }
.actas-detail-step__dot {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: 1px solid #cad6da;
  border-radius: 50%;
  background: #fff;
  font-size: 10px;
  font-weight: 700;
}
.actas-detail-step__line { width: 1px; flex: 1; background: #d7e1e4; }
.actas-detail-step__label { display: flex; flex-direction: column; gap: 2px; padding-top: 4px; }
.actas-detail-step__label strong { font-size: 11px; }
.actas-detail-step__label small { font-size: 9px; font-weight: 400; }
.actas-detail-step.is-active { color: #07838c; }
.actas-detail-step.is-active .actas-detail-step__dot { border-color: #0fb8bb; background: #0fb8bb; color: #fff; }

.actas-detail-panel {
  position: relative;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
}

.actas-detail-panel__header {
  min-height: 68px;
  flex: 0 0 auto;
  padding: 10px 16px;
  border-bottom: 1px solid #dce5e8;
}
.actas-detail-panel__header span:first-child { color: #0a8d95; font-size: 10px; font-weight: 700; text-transform: uppercase; }
.actas-detail-panel__header h2 { margin: 3px 0 0; color: #20313b; font-size: 18px; }

.actas-state-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 9px;
  border: 1px solid #cfe5e7;
  border-radius: 999px;
  background: #effafa;
  color: #07838c;
  font-size: 10px;
  font-weight: 700;
}

.actas-detail-body {
  min-height: 0;
  flex: 1 1 auto;
  padding: 14px 16px;
  overflow: auto;
}
.actas-detail-body--fill { display: flex; flex-direction: column; overflow: hidden; }

.actas-summary-grid,
.actas-ot-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(150px, 1fr));
  gap: 10px;
}

.actas-summary-item,
.actas-ot-summary-grid article {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-height: 60px;
  padding: 10px 12px;
  border: 1px solid #dce5e8;
  border-radius: 7px;
  background: #fbfcfd;
}
.actas-summary-item span,
.actas-ot-summary-grid span { color: #7a8b92; font-size: 9px; text-transform: uppercase; }
.actas-summary-item strong,
.actas-ot-summary-grid strong { color: #273842; font-size: 12px; }

.actas-real-data-note {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  padding: 10px 12px;
  border: 1px solid #cfe9e9;
  border-radius: 7px;
  background: #f4fbfb;
  color: #35636a;
}
.actas-real-data-note i { color: #0da3aa; font-size: 18px; }
.actas-real-data-note div { display: flex; flex-direction: column; gap: 2px; }
.actas-real-data-note strong { font-size: 11px; }
.actas-real-data-note span { font-size: 10px; }

.actas-section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex: 0 0 auto;
  margin-bottom: 8px;
}
.actas-section-heading h3 { margin: 0; font-size: 14px; }
.actas-section-heading p { margin: 3px 0 0; color: #72838a; font-size: 10px; }

.actas-ot-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: #07848d;
  font-size: 10.5px;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

.actas-ot-workspace-heading {
  min-height: 46px;
  flex: 0 0 auto;
  padding: 2px 0 7px;
  border-bottom: 1px solid #dce5e8;
}
.actas-ot-workspace-heading > div { display: flex; flex-direction: column; align-items: center; }
.actas-ot-workspace-heading > div span { color: #7a8b92; font-size: 9px; text-transform: uppercase; }
.actas-ot-workspace-heading > div strong { color: #20343e; font-size: 14px; }

.actas-ot-stepper {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  flex: 0 0 auto;
  margin: 8px 0;
  border: 1px solid #dce5e8;
  border-radius: 7px;
  overflow: hidden;
  background: #f9fbfc;
}
.actas-ot-stepper button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 40px;
  padding: 5px 8px;
  border: 0;
  border-right: 1px solid #dce5e8;
  background: transparent;
  color: #687b83;
  cursor: pointer;
}
.actas-ot-stepper button:last-child { border-right: 0; }
.actas-ot-stepper button span {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border: 1px solid #cbd7da;
  border-radius: 50%;
  background: #fff;
  font-size: 9px;
  font-weight: 700;
}
.actas-ot-stepper button strong { font-size: 10px; }
.actas-ot-stepper button.is-active { background: #eefafa; color: #07848d; box-shadow: inset 0 -2px 0 #0fb8bb; }
.actas-ot-stepper button.is-active span { border-color: #0fb8bb; background: #0fb8bb; color: #fff; }

.actas-ot-content { position: relative; min-height: 0; flex: 1 1 auto; overflow: auto; }

.actas-activity-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.actas-subgrid-card {
  position: relative;
  min-width: 0;
  border: 1px solid #dce5e8;
  border-radius: 7px;
  overflow: hidden;
  background: #fff;
}
.actas-subgrid-card--single { width: 100%; }
.actas-subgrid-card > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 36px;
  padding: 7px 10px;
  border-bottom: 1px solid #dce5e8;
  background: #f5f8f9;
  color: #293a43;
}
.actas-subgrid-card > header strong { font-size: 10.5px; text-transform: uppercase; }
.actas-subgrid-card > header span { color: #07848d; font-size: 10px; font-weight: 700; }

.actas-v2-page :deep(.actas-inner-grid .p-datatable-thead > tr > th) {
  padding: 5px 7px !important;
  background: #f3f6f7 !important;
  color: #20343d !important;
  font-size: 9.5px !important;
  font-weight: 700 !important;
}
.actas-v2-page :deep(.actas-inner-grid .p-datatable-tbody > tr > td) {
  padding: 5px 7px !important;
  font-size: 10px !important;
}

.actas-history-child-grid {
  padding: 10px 16px;
  background: #f5fafb;
}
.actas-history-child-grid > strong { display: block; margin-bottom: 7px; color: #36616a; font-size: 10px; }

.actas-phase-panel {
  display: flex;
  gap: 14px;
  max-width: 780px;
  padding: 18px;
  border: 1px solid #d8e5e7;
  border-radius: 9px;
  background: #f8fbfc;
}
.actas-phase-panel i { color: #0ba6ad; font-size: 22px; }
.actas-phase-panel h3 { margin: 0 0 6px; font-size: 14px; }
.actas-phase-panel p { margin: 0; color: #61747c; font-size: 11px; line-height: 1.5; }

@media (max-width: 1200px) {
  .actas-general-grid { grid-template-columns: repeat(3, minmax(180px, 1fr)); }
  .actas-summary-grid, .actas-ot-summary-grid { grid-template-columns: repeat(3, minmax(140px, 1fr)); }
}

@media (max-width: 900px) {
  .actas-v2-page { padding: 8px; }
  .actas-main-stepper { justify-content: flex-start; overflow-x: auto; }
  .actas-main-step__connector { width: 50px; }
  .actas-general-grid, .actas-reference-grid { grid-template-columns: repeat(2, minmax(150px, 1fr)); }
  .actas-document-layout { grid-template-columns: 190px minmax(0, 1fr); }
  .actas-summary-grid, .actas-ot-summary-grid { grid-template-columns: repeat(2, minmax(130px, 1fr)); }
  .actas-activity-layout { grid-template-columns: 1fr; }
}
</style>
