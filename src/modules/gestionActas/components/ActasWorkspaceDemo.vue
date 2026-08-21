<template>
  <div class="actas-demo-workspace">
    <header class="actas-demo-topbar">
      <Button
        label="VOLVER A LA GRILLA"
        icon="pi pi-arrow-left"
        severity="secondary"
        outlined
        class="actas-demo-back"
        @click="$emit('back')"
      />

      <div class="actas-demo-documents" role="tablist" aria-label="Actas seleccionadas">
        <button
          v-for="acta in actas"
          :key="acta.nroActa"
          type="button"
          class="actas-demo-document"
          :class="{ 'is-active': activeActaNumber === acta.nroActa }"
          @click="selectActa(acta)"
        >
          <span>ACTA</span>
          <strong>{{ acta.nroActa }}</strong>
          <small :class="['actas-demo-status-dot', stateClass(acta.estadoActa)]">{{ acta.estadoActa || 'Sin estado' }}</small>
        </button>
      </div>
    </header>

    <div v-if="feedback.text" class="actas-demo-feedback" :class="`is-${feedback.type}`" role="status">
      <i class="pi" :class="feedbackIcon" aria-hidden="true" />
      <span>{{ feedback.text }}</span>
      <button type="button" aria-label="Cerrar mensaje" @click="feedback.text = ''">×</button>
    </div>

    <div v-if="currentActa" class="actas-demo-layout">
      <aside class="actas-demo-stepper">
        <div class="actas-demo-stepper__head">
          <span>Acta seleccionada</span>
          <strong>{{ currentActa.nroActa }}</strong>
          <small>{{ currentHeader.empresaContratista || currentHeader.contratista || currentActa.contratista || 'Contratista no informado' }}</small>
        </div>

        <button
          v-for="(step, index) in detailSteps"
          :key="step.key"
          type="button"
          class="actas-demo-step"
          :class="{ 'is-active': detailStep === step.key }"
          @click="detailStep = step.key"
        >
          <span class="actas-demo-step__rail">
            <span class="actas-demo-step__circle">
              <i class="pi" :class="step.icon" />
            </span>
            <span v-if="index < detailSteps.length - 1" class="actas-demo-step__line" />
          </span>
          <span class="actas-demo-step__text">
            <strong>{{ step.label }}</strong>
            <small>{{ step.description }}</small>
          </span>
        </button>
      </aside>

      <main class="actas-demo-panel">
        <FmTypingLoader
          v-if="actaLoading"
          overlay
          title="Cargando Acta"
          :message="`Consultando ${currentActa.nroActa}`"
        />

        <header class="actas-demo-panel__header">
          <div>
            <span>{{ currentStep.label }}</span>
            <h2>Acta {{ currentActa.nroActa }}</h2>
          </div>
          <span class="actas-demo-state" :class="stateClass(currentHeader.estado || currentActa.estadoActa)">
            {{ currentHeader.estado || currentActa.estadoActa || 'Sin estado' }}
          </span>
        </header>

        <section v-if="detailStep === 'resumen'" class="actas-demo-content actas-demo-summary">
          <div class="actas-demo-summary-grid">
            <article v-for="item in summaryItems" :key="item.label" class="actas-demo-summary-card">
              <span>{{ item.label }}</span>
              <strong>{{ item.value || '-' }}</strong>
            </article>
          </div>
        </section>

        <section v-else-if="detailStep === 'ots'" class="actas-demo-content actas-demo-content--fill">
          <template v-if="!selectedOt">
            <div class="actas-demo-sectionbar">
              <div>
                <h3>Órdenes de Trabajo</h3>
                <p>Seleccioná OTs para operar o tocá su número para abrir el detalle.</p>
              </div>
              <div class="actas-demo-sectionbar__actions">
                <span v-if="selectedOts.length" class="actas-demo-chip">{{ selectedOts.length }} seleccionada{{ selectedOts.length === 1 ? '' : 's' }}</span>
                <Button label="VALIDAR / VERIFICAR" icon="pi pi-check-circle" size="small" :disabled="!selectedOts.length || certified" @click="confirmRuleValidation" />
              </div>
            </div>

            <ActasWorkspaceGrid
              v-model:selection="selectedOts"
              :rows="currentOtRows"
              :columns="otColumns"
              data-key="numeroOT"
              title="Órdenes de Trabajo"
              selectable
              show-export
              :export-filename="`Acta_${currentActa.nroActa}_OTs.xlsx`"
              empty-text="No hay OTs para esta Acta"
            >
              <template #cell-numeroOT="{ data }">
                <button type="button" class="actas-demo-link" @click="openOt(data)">{{ data.numeroOT }}</button>
              </template>
              <template #cell-excluida="{ data }">
                <span class="actas-demo-mini-state" :class="data.excluida === 'S' ? 'is-danger' : 'is-success'">
                  {{ data.excluida === 'S' ? 'Excluida' : 'Incluida' }}
                </span>
              </template>
            </ActasWorkspaceGrid>
          </template>

          <template v-else>
            <div class="actas-demo-ot-head">
              <Button label="VOLVER A OTs" icon="pi pi-arrow-left" text size="small" @click="closeOt" />
              <div>
                <span>Orden de Trabajo</span>
                <strong>{{ selectedOt.numeroOT }}</strong>
              </div>
              <div class="actas-demo-ot-head__meta">
                <span>{{ selectedOt.tarea || 'Sin tarea' }}</span>
                <span>{{ selectedOt.direccion || 'Sin domicilio' }}</span>
              </div>
            </div>

            <nav class="actas-demo-ot-stepper" aria-label="Detalle de Orden de Trabajo">
              <button
                v-for="tab in otTabs"
                :key="tab.key"
                type="button"
                :class="{ 'is-active': otTab === tab.key }"
                @click="selectOtTab(tab.key)"
              >
                <i class="pi" :class="tab.icon" />
                <span>{{ tab.label }}</span>
              </button>
            </nav>

            <div class="actas-demo-ot-body">
              <FmTypingLoader v-if="otLoading" overlay title="Cargando OT" :message="`Consultando ${selectedOt.numeroOT}`" />

              <section v-if="otTab === 'resumen'" class="actas-demo-ot-summary">
                <article v-for="item in otSummaryItems" :key="item.label">
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value || '-' }}</strong>
                </article>
              </section>

              <section v-else-if="otTab === 'actividades'" class="actas-demo-activities">
                <div class="actas-demo-subgrid">
                  <ActasWorkspaceGrid
                    :rows="originalActivities"
                    :columns="originalActivityColumns"
                    data-key="codActividad"
                    title="Actividades originales"
                    show-export
                    :export-filename="`OT_${selectedOt.numeroOT}_Actividades_Originales.xlsx`"
                    empty-text="No hay actividades originales"
                  />
                </div>

                <div class="actas-demo-subgrid">
                  <ActasWorkspaceGrid
                    v-model:selection="selectedActivities"
                    :rows="resultingActivities"
                    :columns="resultActivityColumns"
                    data-key="codActividad"
                    title="Actividades resultantes"
                    selectable
                    show-export
                    :export-filename="`OT_${selectedOt.numeroOT}_Actividades_Resultantes.xlsx`"
                    empty-text="No hay actividades resultantes"
                  >
                    <template #toolbar>
                      <div class="actas-demo-inline-actions">
                        <Button icon="pi pi-plus" text rounded title="Nueva actividad" :disabled="certified" @click="openActivityCreate" />
                        <Button icon="pi pi-pen-to-square" text rounded title="Modificar actividad" :disabled="certified || selectedActivities.length !== 1" @click="openActivityEdit" />
                        <Button icon="pi pi-trash" text rounded title="Dar de baja" :disabled="certified || !selectedActivities.length" @click="openActivityDelete" />
                        <Button icon="pi pi-check-circle" text rounded title="Validar / Verificar OT" :disabled="certified" @click="confirmSingleOtValidation" />
                        <Button
                          v-if="currentOtDetail?.habilitarDomiReglas"
                          icon="pi pi-sitemap"
                          text
                          rounded
                          title="Ejecutar reglas del domicilio"
                          :disabled="certified"
                          @click="confirmDomicileRules"
                        />
                      </div>
                    </template>
                  </ActasWorkspaceGrid>
                </div>
              </section>

              <section v-else-if="otTab === 'bases'" class="actas-demo-single-grid">
                <div class="actas-demo-readonly-note"><i class="pi pi-eye" /> Base instalada es de solo consulta en el flujo actual.</div>
                <ActasWorkspaceGrid
                  :rows="installedBases"
                  :columns="baseColumns"
                  data-key="nroSerie"
                  title="Base instalada"
                  show-export
                  :export-filename="`OT_${selectedOt.numeroOT}_Base_Instalada.xlsx`"
                  empty-text="No hay base instalada"
                />
              </section>

              <section v-else-if="otTab === 'historial'" class="actas-demo-single-grid">
                <ActasWorkspaceGrid
                  v-model:expanded-rows="expandedHistoryRows"
                  :rows="historyRows"
                  :columns="historyColumns"
                  data-key="nroOt"
                  title="Historial del domicilio"
                  expandable
                  show-export
                  :export-filename="`OT_${selectedOt.numeroOT}_Historial.xlsx`"
                  empty-text="No hay historial del domicilio"
                >
                  <template #toolbar>
                    <Button label="EXPORTAR HISTORIAL COMPLETO" icon="pi pi-download" size="small" outlined @click="exportFullHistory" />
                  </template>
                  <template #expansion="{ data }">
                    <div class="actas-demo-history-child">
                      <span>Actividades de OT {{ data.nroOt }}</span>
                      <ActasWorkspaceGrid
                        :rows="data.actividades || []"
                        :columns="historyActivityColumns"
                        data-key="codActividad"
                        :filterable="false"
                        empty-text="Sin actividades para esta OT"
                      />
                    </div>
                  </template>
                </ActasWorkspaceGrid>
              </section>

              <section v-else class="actas-demo-single-grid">
                <div class="actas-demo-readonly-note"><i class="pi pi-info-circle" /> Materiales se consulta y actualiza; este detalle legacy no permite alta desde esta sección.</div>
                <ActasWorkspaceGrid
                  :rows="materials"
                  :columns="materialColumns"
                  data-key="codigo"
                  title="Materiales"
                  show-export
                  show-refresh
                  :refresh-disabled="materialsLoading"
                  refresh-title="Consultar materiales nuevamente"
                  :export-filename="`OT_${selectedOt.numeroOT}_Materiales.xlsx`"
                  empty-text="No hay materiales"
                  @refresh="refreshMaterials"
                />
              </section>
            </div>
          </template>
        </section>

        <section v-else-if="detailStep === 'reglas'" class="actas-demo-content actas-demo-content--fill">
          <div class="actas-demo-sectionbar">
            <div>
              <h3>Actividades / Reglas</h3>
              <p>Validación masiva de las OTs seleccionadas, usando el mismo endpoint del detalle legacy.</p>
            </div>
            <Button label="VALIDAR / VERIFICAR" icon="pi pi-check-circle" :disabled="!selectedOts.length || certified" @click="confirmRuleValidation" />
          </div>
          <ActasWorkspaceGrid
            v-model:selection="selectedOts"
            :rows="currentOtRows"
            :columns="rulesColumns"
            data-key="numeroOT"
            title="OTs y estado de reglas"
            selectable
            show-export
            :export-filename="`Acta_${currentActa.nroActa}_Reglas.xlsx`"
          >
            <template #cell-numeroOT="{ data }"><button type="button" class="actas-demo-link" @click="openOtFromStep(data)">{{ data.numeroOT }}</button></template>
            <template #cell-reglaFlujo="{ data }"><span class="actas-demo-mini-state is-info">{{ data.reglaFlujo || '-' }}</span></template>
          </ActasWorkspaceGrid>
        </section>

        <section v-else-if="detailStep === 'gestion'" class="actas-demo-content actas-demo-management">
          <div class="actas-demo-sectionbar">
            <div>
              <h3>Gestión de OTs</h3>
              <p>Inclusión, exclusión y traspaso sin encadenar pop-ups.</p>
            </div>
            <span class="actas-demo-chip">{{ selectedOts.length }} seleccionada{{ selectedOts.length === 1 ? '' : 's' }}</span>
          </div>

          <div class="actas-demo-management-actions">
            <button type="button" :disabled="!selectedOts.length || certified" @click="openManagement('exclude')">
              <i class="pi pi-minus-circle" /><strong>Excluir OTs</strong><span>Motivo, nota e impacto histórico</span>
            </button>
            <button type="button" :disabled="selectedOts.length !== 1 || certified" @click="openManagement('include')">
              <i class="pi pi-plus-circle" /><strong>Incluir OT</strong><span>Reincorporar una OT excluida</span>
            </button>
            <button type="button" :disabled="!selectedOts.length || certified" @click="startTransfer">
              <i class="pi pi-arrow-right-arrow-left" /><strong>Gestionar traspaso</strong><span>Wizard de destino y validación</span>
            </button>
          </div>

          <div v-if="transfer.active" class="actas-demo-transfer">
            <nav class="actas-demo-transfer-steps">
              <button v-for="step in 4" :key="step" type="button" :class="{ 'is-active': transfer.step === step, 'is-complete': transfer.step > step }" disabled>
                <span>{{ step }}</span><strong>{{ transferStepLabels[step - 1] }}</strong>
              </button>
            </nav>

            <div v-if="transfer.step === 1" class="actas-demo-transfer-body">
              <h4>OTs a traspasar</h4>
              <div class="actas-demo-token-list"><span v-for="ot in selectedOts" :key="ot.numeroOT">{{ ot.numeroOT }}</span></div>
              <div class="actas-demo-wizard-actions"><Button label="CANCELAR" severity="secondary" outlined @click="cancelTransfer" /><Button label="SIGUIENTE" icon="pi pi-arrow-right" icon-pos="right" @click="transfer.step = 2" /></div>
            </div>

            <div v-else-if="transfer.step === 2" class="actas-demo-transfer-body">
              <div class="actas-demo-form-grid">
                <label><span>Región</span><Select v-model="transfer.form.region" :options="transferOptions.regiones" optionLabel="label" optionValue="value" placeholder="Seleccione..." @change="onTransferRegion" /></label>
                <label><span>Subregión</span><Select v-model="transfer.form.subregion" :options="transferOptions.subregiones" optionLabel="label" optionValue="value" placeholder="Seleccione..." /></label>
                <label><span>Base Técnica</span><Select v-model="transfer.form.base" :options="transferOptions.bases" optionLabel="label" optionValue="value" placeholder="Seleccione..." /></label>
                <label><span>Provincia</span><InputText v-model="transfer.form.provincia" /></label>
                <label><span>Tipo de Contrato</span><Select v-model="transfer.form.tipoContrato" :options="transferOptions.contratos" optionLabel="label" optionValue="value" placeholder="Seleccione..." /></label>
                <label><span>Sociedad</span><Select v-model="transfer.form.sociedad" :options="transferOptions.sociedades" optionLabel="label" optionValue="value" placeholder="Seleccione..." /></label>
                <label><span>Contratista</span><Select v-model="transfer.form.contratista" :options="transferOptions.contratistas" optionLabel="label" optionValue="value" placeholder="Seleccione..." /></label>
                <label class="is-wide"><span>Nota *</span><Textarea v-model="transfer.form.nota" rows="3" maxlength="200" autoResize /></label>
              </div>
              <div class="actas-demo-wizard-actions"><Button label="ATRÁS" severity="secondary" outlined @click="transfer.step = 1" /><Button label="VALIDAR DESTINO" icon="pi pi-shield" :disabled="!canValidateTransfer" @click="runTransferValidation" /></div>
            </div>

            <div v-else-if="transfer.step === 3" class="actas-demo-transfer-body">
              <div class="actas-demo-validation-card" :class="transfer.hasNotes ? 'is-warning' : 'is-success'">
                <i class="pi" :class="transfer.hasNotes ? 'pi-exclamation-triangle' : 'pi-check-circle'" />
                <div><strong>{{ transfer.hasNotes ? 'Hay notas relacionadas' : 'Validación correcta' }}</strong><span>{{ transfer.hasNotes ? 'El legacy permite continuar con confirmación explícita.' : 'Las OTs pueden avanzar al resumen final.' }}</span></div>
              </div>
              <div class="actas-demo-wizard-actions"><Button label="ATRÁS" severity="secondary" outlined @click="transfer.step = 2" /><Button label="CONTINUAR" icon="pi pi-arrow-right" icon-pos="right" @click="transfer.step = 4" /></div>
            </div>

            <div v-else class="actas-demo-transfer-body">
              <div class="actas-demo-transfer-summary">
                <h4>Confirmar traspaso</h4>
                <p><strong>{{ selectedOts.length }}</strong> OTs seleccionadas</p>
                <p>Región: <strong>{{ optionLabel(transferOptions.regiones, transfer.form.region) || '-' }}</strong></p>
                <p>Base: <strong>{{ optionLabel(transferOptions.bases, transfer.form.base) || '-' }}</strong></p>
                <p>Contrato: <strong>{{ optionLabel(transferOptions.contratos, transfer.form.tipoContrato) || '-' }}</strong></p>
                <p>Nota: <strong>{{ transfer.form.nota }}</strong></p>
              </div>
              <div class="actas-demo-wizard-actions"><Button label="ATRÁS" severity="secondary" outlined @click="transfer.step = 3" /><Button label="CONFIRMAR TRASPASO" icon="pi pi-check" :loading="actionLoading" @click="confirmTransfer" /></div>
            </div>
          </div>

          <div v-else class="actas-demo-management-grid">
            <ActasWorkspaceGrid v-model:selection="selectedOts" :rows="currentOtRows" :columns="managementColumns" data-key="numeroOT" title="OTs del Acta" selectable show-export :export-filename="`Acta_${currentActa.nroActa}_Gestion.xlsx`" />
          </div>
        </section>

        <section v-else class="actas-demo-content actas-demo-close">
          <div class="actas-demo-close-grid">
            <article class="actas-demo-close-card">
              <span class="actas-demo-close-card__icon"><i class="pi pi-star" /></span>
              <div><h3>Calificación</h3><p>La certificación requiere una calificación previa cuando corresponde.</p></div>
              <Rating v-model="rating" :stars="5" :cancel="false" :disabled="certified" />
              <Button label="CALIFICAR" icon="pi pi-star-fill" :disabled="certified || !rating" :loading="actionLoading" @click="confirmRating" />
            </article>

            <article class="actas-demo-close-card">
              <span class="actas-demo-close-card__icon"><i class="pi pi-file-excel" /></span>
              <div><h3>Exportar Acta</h3><p>Usa el exportador ExcelJS que ya utilizan las pantallas Vue migradas.</p></div>
              <label class="actas-demo-check"><Checkbox v-model="includeExcludedExport" binary /><span>Incluir OTs excluidas</span></label>
              <Button label="EXPORTAR EXCEL" icon="pi pi-download" outlined :loading="exportLoading" @click="exportActa" />
            </article>

            <article class="actas-demo-close-card is-primary">
              <span class="actas-demo-close-card__icon"><i class="pi pi-verified" /></span>
              <div><h3>Certificación</h3><p>Antes de certificar se consulta si existen OTs fallidas pendientes.</p></div>
              <span class="actas-demo-state" :class="stateClass(currentHeader.estado || currentActa.estadoActa)">{{ currentHeader.estado || currentActa.estadoActa || '-' }}</span>
              <Button label="CERTIFICAR ACTA" icon="pi pi-check-circle" :disabled="certified" :loading="actionLoading" @click="prepareCertification" />
            </article>
          </div>
        </section>
      </main>
    </div>

    <Dialog v-model:visible="activityDialog.visible" modal :header="activityDialogTitle" :style="{ width: '520px' }" :draggable="false">
      <div class="actas-demo-dialog-form">
        <label v-if="activityDialog.mode === 'create'"><span>Código de actividad</span><InputText v-model="activityForm.codActividad" placeholder="Ingrese el código" /></label>
        <label v-if="activityDialog.mode === 'create'"><span>Descripción</span><InputText v-model="activityForm.descripcion" /></label>
        <label v-if="activityDialog.mode === 'edit'"><span>Cantidad</span><InputNumber v-model="activityForm.cantidad" :min="0.01" :max="3000000" :maxFractionDigits="2" /></label>
        <label><span>Motivo</span><InputText v-model="activityForm.motivo" /></label>
        <label v-if="activityDialog.mode === 'edit'"><span>Comentario</span><Textarea v-model="activityForm.comentario" rows="3" maxlength="200" autoResize /></label>
        <label class="actas-demo-check"><Checkbox v-model="activityForm.modificarHistorico" binary /><span>Resetear reglas B en OTs históricas relacionadas</span></label>
      </div>
      <template #footer><Button label="CANCELAR" severity="secondary" outlined @click="activityDialog.visible = false" /><Button :label="activityDialogConfirmLabel" icon="pi pi-check" :loading="actionLoading" @click="submitActivityAction" /></template>
    </Dialog>

    <Dialog v-model:visible="managementDialog.visible" modal :header="managementDialog.mode === 'exclude' ? 'Excluir OTs' : 'Incluir OT'" :style="{ width: '520px' }" :draggable="false">
      <div class="actas-demo-dialog-form">
        <div class="actas-demo-token-list"><span v-for="ot in selectedOts" :key="ot.numeroOT">{{ ot.numeroOT }}</span></div>
        <label><span>Motivo</span><Select v-model="managementForm.motivo" :options="motivoOptions" optionLabel="label" optionValue="value" placeholder="Seleccione..." filter /></label>
        <label><span>Nota</span><Textarea v-model="managementForm.nota" rows="3" maxlength="200" autoResize /></label>
        <label class="actas-demo-check"><Checkbox v-model="managementForm.modificarHistorico" binary /><span>Resetear reglas B en OTs históricas relacionadas</span></label>
      </div>
      <template #footer><Button label="CANCELAR" severity="secondary" outlined @click="managementDialog.visible = false" /><Button label="CONFIRMAR" icon="pi pi-check" :loading="actionLoading" :disabled="!managementForm.motivo" @click="submitManagement" /></template>
    </Dialog>

    <Dialog v-model:visible="confirmDialog.visible" modal :header="confirmDialog.title" :style="{ width: '500px' }" :draggable="false">
      <div class="actas-demo-confirm"><i class="pi pi-exclamation-triangle" /><p>{{ confirmDialog.message }}</p></div>
      <template #footer><Button label="CANCELAR" severity="secondary" outlined @click="confirmDialog.visible = false" /><Button label="CONFIRMAR" icon="pi pi-check" :loading="actionLoading" @click="runConfirmedAction" /></template>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import Rating from 'primevue/rating'
import FmTypingLoader from '@/components/shared/FmTypingLoader.vue'
import ActasWorkspaceGrid from './ActasWorkspaceGrid.vue'
import { useExcelExport } from '@/composables/useExportExcel'
import { loadActaDetail, loadOtDetail, loadOtMaterials } from '../services/gestionActasLegacyApi'
import {
  certifyActa,
  checkFailedOts,
  createActivity,
  deleteActivity,
  executeDomicileRules,
  executeTransfer,
  includeOt,
  loadActaExportRows,
  loadMotivos,
  loadSubregions,
  loadTransferOptions,
  rateActa,
  saveResultingActivities,
  validateOtRules,
  validateTransfer,
  excludeOts,
} from '../services/gestionActasOperationsApi'

const props = defineProps({
  actas: { type: Array, default: () => [] },
  initialActa: { type: String, default: '' },
})
defineEmits(['back'])

const { exportToExcel } = useExcelExport()
const activeActaNumber = ref(props.initialActa || props.actas[0]?.nroActa || '')
const detailStep = ref('resumen')
const actaLoading = ref(false)
const actaDetails = reactive({})
const selectedOts = ref([])
const selectedOt = ref(null)
const otTab = ref('resumen')
const otLoading = ref(false)
const otDetails = reactive({})
const selectedActivities = ref([])
const expandedHistoryRows = ref({})
const materialsByOt = reactive({})
const materialsLoading = ref(false)
const actionLoading = ref(false)
const exportLoading = ref(false)
const rating = ref(0)
const includeExcludedExport = ref(false)
const feedback = reactive({ type: 'info', text: '' })

const detailSteps = [
  { key: 'resumen', label: 'Resumen', description: 'Datos generales del Acta', icon: 'pi-id-card' },
  { key: 'ots', label: 'Órdenes de Trabajo', description: 'Detalle completo por OT', icon: 'pi-list-check' },
  { key: 'reglas', label: 'Actividades / Reglas', description: 'Validar y verificar', icon: 'pi-sitemap' },
  { key: 'gestion', label: 'Gestión', description: 'Inclusión, exclusión y traspaso', icon: 'pi-arrow-right-arrow-left' },
  { key: 'cierre', label: 'Cierre / Certificación', description: 'Calificar, exportar y certificar', icon: 'pi-verified' },
]
const otTabs = [
  { key: 'resumen', label: 'Resumen', icon: 'pi-id-card' },
  { key: 'actividades', label: 'Actividades', icon: 'pi-list-check' },
  { key: 'bases', label: 'Base instalada', icon: 'pi-server' },
  { key: 'historial', label: 'Historial', icon: 'pi-history' },
  { key: 'materiales', label: 'Materiales', icon: 'pi-box' },
]
const transferStepLabels = ['OTs', 'Destino', 'Validación', 'Confirmar']

const currentActa = computed(() => props.actas.find((item) => item.nroActa === activeActaNumber.value) || props.actas[0] || null)
const currentActaKey = computed(() => String(currentActa.value?.nroActa || ''))
const currentDetail = computed(() => actaDetails[currentActaKey.value] || null)
const currentHeader = computed(() => currentDetail.value?.actaDetalleAdapter || currentActa.value || {})
const currentOtRows = computed(() => currentDetail.value?.listaOt || [])
const currentStep = computed(() => detailSteps.find((item) => item.key === detailStep.value) || detailSteps[0])
const certified = computed(() => normalizeState(currentHeader.value.estado || currentActa.value?.estadoActa).includes('CERTIFIC'))
const currentOtKey = computed(() => selectedOt.value ? `${currentActaKey.value}::${selectedOt.value.numeroOT}` : '')
const currentOtDetail = computed(() => otDetails[currentOtKey.value] || null)
const originalActivities = computed(() => currentOtDetail.value?.actividadesOriginales || [])
const resultingActivities = computed(() => currentOtDetail.value?.actividadesResultantes || [])
const installedBases = computed(() => currentOtDetail.value?.basesInstaladas || [])
const historyRows = computed(() => currentOtDetail.value?.historialDomicilio || [])
const fullHistoryRows = computed(() => currentOtDetail.value?.historialDomicilioCompleto || historyRows.value)
const materials = computed(() => materialsByOt[currentOtKey.value] || [])

const summaryItems = computed(() => [
  { label: 'Número de Acta', value: currentActa.value?.nroActa },
  { label: 'Estado', value: currentHeader.value.estado || currentActa.value?.estadoActa },
  { label: 'Provincia', value: currentHeader.value.provincia || currentActa.value?.provincia },
  { label: 'Región', value: currentHeader.value.region || currentActa.value?.region },
  { label: 'Contratista', value: currentHeader.value.empresaContratista || currentHeader.value.contratista || currentActa.value?.contratista },
  { label: 'Sociedad', value: currentHeader.value.sociedad || currentActa.value?.sociedad },
  { label: 'Tipo de Contrato', value: currentHeader.value.tipoContrato || currentActa.value?.tipoContrato },
  { label: 'Período', value: currentHeader.value.periodo || `${currentActa.value?.periodo || ''} ${currentActa.value?.anio || ''}`.trim() },
  { label: 'Calificación', value: currentHeader.value.calificacion || currentActa.value?.valoracion },
  { label: 'Período cumplido', value: currentHeader.value.periodoCumplido === true ? 'Sí' : currentHeader.value.periodoCumplido === false ? 'No' : '' },
])
const otSummaryItems = computed(() => {
  const detail = currentOtDetail.value || {}
  const row = selectedOt.value || {}
  return [
    { label: 'N° OT', value: row.numeroOT }, { label: 'Tarea', value: detail.tarea || row.tarea },
    { label: 'Domicilio', value: detail.domicilio || row.direccion }, { label: 'Clase OT', value: detail.claseOt || row.claseOT },
    { label: 'Técnico de cierre', value: detail.tecnicoCierre || row.tecnicoCierre }, { label: 'N° Cliente', value: detail.nroCliente || row.nroCliente },
    { label: 'Regla / Flujo', value: detail.reglaFlujo || row.reglaFlujo }, { label: 'Tipo OT', value: detail.tipoOT || row.tipoOT },
  ]
})

const otColumns = [
  { field: 'numeroOT', header: 'NRO_OT', width: '128px' }, { field: 'fechaCierre', header: 'FECHA_CIERRE', width: '138px' },
  { field: 'tarea', header: 'CÓDIGO_TAREA', width: '150px' }, { field: 'direccion', header: 'DIRECCIÓN', width: '210px' },
  { field: 'ciudad', header: 'CIUDAD', width: '140px' }, { field: 'provincia', header: 'PROVINCIA', width: '132px' },
  { field: 'baseNombre', header: 'BASE', width: '130px' }, { field: 'contratista', header: 'CONTRATISTA', width: '170px' },
  { field: 'contrato', header: 'CONTRATO', width: '140px' }, { field: 'sociedad', header: 'SOCIEDAD', width: '130px' },
  { field: 'techNum', header: 'TECH_NUM', width: '120px' }, { field: 'reglaFlujo', header: 'REGLAS', width: '120px' },
  { field: 'excluida', header: 'EXCLUIDA', width: '100px' },
]
const rulesColumns = otColumns.filter((column) => ['numeroOT','tarea','direccion','techNum','reglaFlujo','excluida'].includes(column.field))
const managementColumns = otColumns.filter((column) => ['numeroOT','tarea','direccion','baseNombre','contratista','contrato','excluida'].includes(column.field))
const originalActivityColumns = [
  { field: 'codActividad', header: 'CÓDIGO', width: '120px' }, { field: 'actividad', header: 'ACTIVIDAD', width: '260px' },
  { field: 'cantidadOriginal', header: 'CANTIDAD', width: '110px' }, { field: 'codCMO', header: 'CMO', width: '100px' }, { field: 'cmo', header: 'DESCRIPCIÓN CMO', width: '190px' },
]
const resultActivityColumns = [
  { field: 'codActividad', header: 'CÓDIGO', width: '120px' }, { field: 'actividad', header: 'ACTIVIDAD', width: '230px' },
  { field: 'cantidadResultante', header: 'CANTIDAD', width: '110px' }, { field: 'codCMO', header: 'CMO', width: '100px' },
  { field: 'reglaTipo', header: 'TIPO REGLA', width: '110px' }, { field: 'reglaAplicada', header: 'REGLA', width: '120px' },
  { field: 'comentario', header: 'COMENTARIO', width: '180px' }, { field: 'motivo', header: 'MOTIVO', width: '150px' }, { field: 'activo', header: 'ACTIVO', width: '90px' },
]
const baseColumns = [ { field: 'baseInstalada', header: 'BASE INSTALADA', width: '220px' }, { field: 'modelo', header: 'MODELO', width: '180px' }, { field: 'nroSerie', header: 'NRO SERIE', width: '180px' } ]
const historyColumns = [
  { field: 'nroOt', header: 'NRO OT', width: '130px' }, { field: 'fechaCreacion', header: 'FECHA CREACIÓN', width: '150px' },
  { field: 'fechaCierre', header: 'FECHA CIERRE', width: '150px' }, { field: 'cantidad', header: 'CANTIDAD', width: '100px' },
  { field: 'nroActa', header: 'ACTA / NOTA', width: '130px' }, { field: 'estadoActa', header: 'ESTADO ACTA', width: '130px' },
  { field: 'contratista', header: 'CONTRATISTA', width: '190px' }, { field: 'esOtRed', header: 'OT RED', width: '90px' },
]
const historyActivityColumns = [ { field: 'codActividad', header: 'CÓDIGO', width: '120px' }, { field: 'actividad', header: 'ACTIVIDAD', width: '260px' }, { field: 'nroNcNd', header: 'NC / ND', width: '120px' }, { field: 'estadoActa', header: 'ESTADO NC / ND', width: '140px' }, { field: 'activo', header: 'ESTADO ACTIVIDAD', width: '140px' } ]
const materialColumns = [ { field: 'codigo', header: 'CÓDIGO', width: '130px' }, { field: 'descripcion', header: 'DESCRIPCIÓN', width: '300px' }, { field: 'cantidad', header: 'CANTIDAD', width: '110px' }, { field: 'accion', header: 'ACCIÓN', width: '130px' }, { field: 'estado', header: 'ESTADO', width: '130px' } ]

const normalizeState = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase()
const stateClass = (value) => {
  const state = normalizeState(value)
  if (state.includes('CERTIFIC') || state.includes('CERRAD')) return 'is-success'
  if (state.includes('CURSO') || state.includes('PROCES')) return 'is-info'
  if (state.includes('PENDIENT') || state.includes('ABIERT')) return 'is-warning'
  if (state.includes('ANUL') || state.includes('ERROR') || state.includes('FALL')) return 'is-danger'
  return 'is-neutral'
}
const feedbackIcon = computed(() => feedback.type === 'success' ? 'pi-check-circle' : feedback.type === 'error' ? 'pi-times-circle' : feedback.type === 'warning' ? 'pi-exclamation-triangle' : 'pi-info-circle')
const notify = (type, text) => { feedback.type = type; feedback.text = text }

const loadCurrentActa = async (force = false) => {
  const key = currentActaKey.value
  if (!key || (!force && actaDetails[key])) return
  actaLoading.value = true
  try {
    actaDetails[key] = await loadActaDetail(key)
    const currentRating = Number(actaDetails[key]?.actaDetalleAdapter?.calificacion || currentActa.value?.valoracion || 0)
    rating.value = Number.isFinite(currentRating) ? currentRating : 0
  } catch (error) { notify('error', error instanceof Error ? error.message : String(error)) }
  finally { actaLoading.value = false }
}
const selectActa = async (acta) => { activeActaNumber.value = acta.nroActa; detailStep.value = 'resumen'; selectedOts.value = []; closeOt(); await loadCurrentActa() }
const reloadActa = async () => { await loadCurrentActa(true); if (selectedOt.value) await reloadOt() }
const openOt = async (row) => { selectedOt.value = row; otTab.value = 'resumen'; selectedActivities.value = []; expandedHistoryRows.value = {}; await loadCurrentOt() }
const openOtFromStep = async (row) => { detailStep.value = 'ots'; await openOt(row) }
const closeOt = () => { selectedOt.value = null; otTab.value = 'resumen'; selectedActivities.value = []; expandedHistoryRows.value = {} }
const loadCurrentOt = async (force = false) => {
  if (!selectedOt.value) return
  const key = currentOtKey.value
  if (!key || (!force && otDetails[key])) return
  otLoading.value = true
  try { otDetails[key] = await loadOtDetail({ nroActa: currentActaKey.value, nroOt: selectedOt.value.numeroOT }) }
  catch (error) { notify('error', error instanceof Error ? error.message : String(error)) }
  finally { otLoading.value = false }
}
const reloadOt = async () => { if (selectedOt.value) await loadCurrentOt(true) }
const selectOtTab = async (tab) => { otTab.value = tab; if (tab === 'materiales') await refreshMaterials(false) }
const refreshMaterials = async (showMessage = true) => {
  if (!selectedOt.value) return
  materialsLoading.value = true
  try { materialsByOt[currentOtKey.value] = await loadOtMaterials(selectedOt.value.numeroOT); if (showMessage) notify('success', 'Materiales actualizados.') }
  catch (error) { notify('error', error instanceof Error ? error.message : String(error)) }
  finally { materialsLoading.value = false }
}

watch(currentActaKey, () => { loadCurrentActa() })
onMounted(loadCurrentActa)

const activityDialog = reactive({ visible: false, mode: 'create' })
const activityForm = reactive({ codActividad: '', descripcion: '', cantidad: null, motivo: '', comentario: '', modificarHistorico: false })
const activityDialogTitle = computed(() => activityDialog.mode === 'create' ? 'Nueva actividad' : activityDialog.mode === 'edit' ? 'Modificar actividad' : 'Dar de baja actividades')
const activityDialogConfirmLabel = computed(() => activityDialog.mode === 'delete' ? 'CONFIRMAR BAJA' : 'APLICAR')
const resetActivityForm = () => Object.assign(activityForm, { codActividad: '', descripcion: '', cantidad: null, motivo: '', comentario: '', modificarHistorico: false })
const openActivityCreate = () => { resetActivityForm(); activityDialog.mode = 'create'; activityDialog.visible = true }
const openActivityEdit = () => { if (selectedActivities.value.length !== 1) return; const row = selectedActivities.value[0]; resetActivityForm(); Object.assign(activityForm, { codActividad: row.codActividad, descripcion: row.actividad, cantidad: Number(row.cantidadResultante ?? row.cantidad ?? 1), motivo: row.motivo || '', comentario: row.comentario || '' }); activityDialog.mode = 'edit'; activityDialog.visible = true }
const openActivityDelete = () => { if (!selectedActivities.value.length) return; resetActivityForm(); activityDialog.mode = 'delete'; activityDialog.visible = true }
const submitActivityAction = async () => {
  if (!selectedOt.value) return
  actionLoading.value = true
  try {
    if (activityDialog.mode === 'create') {
      if (!activityForm.codActividad.trim()) throw new Error('Ingresá un código de actividad.')
      await createActivity({ nroOt: selectedOt.value.numeroOT, codActividad: activityForm.codActividad, descripcion: activityForm.descripcion, motivo: activityForm.motivo, modificarHistorico: activityForm.modificarHistorico })
      notify('success', 'Actividad agregada correctamente.')
    } else if (activityDialog.mode === 'edit') {
      const target = selectedActivities.value[0]
      const updated = resultingActivities.value.map((row) => row === target || row.codActividad === target.codActividad ? { ...row, cantidadResultante: activityForm.cantidad, comentario: activityForm.comentario, motivo: activityForm.motivo, update: 'M' } : row)
      await saveResultingActivities({ nroOT: selectedOt.value.numeroOT, actividadesResultantes: updated, reset: activityForm.modificarHistorico })
      notify('success', 'Actividad modificada correctamente.')
    } else {
      for (const row of selectedActivities.value) {
        await deleteActivity({ nroActa: currentActaKey.value, nroOt: selectedOt.value.numeroOT, codActividad: row.codActividad, descripcion: row.actividad || '', motivo: activityForm.motivo, modificarHistorico: activityForm.modificarHistorico })
      }
      notify('success', 'Actividad/es dadas de baja correctamente.')
    }
    activityDialog.visible = false
    selectedActivities.value = []
    await reloadOt()
  } catch (error) { notify('error', error instanceof Error ? error.message : String(error)) }
  finally { actionLoading.value = false }
}

const confirmDialog = reactive({ visible: false, title: '', message: '', action: '' })
const openConfirm = (action, title, message) => Object.assign(confirmDialog, { visible: true, action, title, message })
const confirmRuleValidation = () => { if (selectedOts.value.length) openConfirm('validateRules', 'Validar / Verificar OTs', `Se validarán ${selectedOts.value.length} OT(s) seleccionadas. ¿Continuar?`) }
const confirmSingleOtValidation = () => { if (selectedOt.value) { selectedOts.value = [selectedOt.value]; confirmRuleValidation() } }
const confirmDomicileRules = () => selectedOt.value && openConfirm('domicileRules', 'Ejecutar reglas del domicilio', `Se ejecutarán las reglas para la OT ${selectedOt.value.numeroOT}. ¿Continuar?`)
const confirmRating = () => openConfirm('rate', 'Calificar Acta', `Se guardará una calificación de ${rating.value} estrella(s) para el Acta ${currentActaKey.value}.`)
const prepareCertification = async () => {
  actionLoading.value = true
  try {
    const warning = await checkFailedOts(currentActaKey.value)
    const message = warning && String(warning).trim() ? `${warning}\n\n¿Desea continuar con la certificación?` : `Se certificará el Acta ${currentActaKey.value}. Esta acción modifica su estado. ¿Continuar?`
    openConfirm('certify', 'Certificar Acta', message)
  } catch (error) { notify('error', error instanceof Error ? error.message : String(error)) }
  finally { actionLoading.value = false }
}
const runConfirmedAction = async () => {
  actionLoading.value = true
  try {
    if (confirmDialog.action === 'validateRules') {
      await validateOtRules(selectedOts.value.map((row) => row.numeroOT)); notify('success', 'Validación / verificación ejecutada.'); await reloadActa()
    } else if (confirmDialog.action === 'domicileRules') {
      await executeDomicileRules(selectedOt.value.numeroOT); notify('success', 'Reglas del domicilio ejecutadas.'); await reloadOt()
    } else if (confirmDialog.action === 'rate') {
      await rateActa({ nroActa: currentActaKey.value, calificacion: rating.value }); notify('success', 'Calificación guardada.'); await reloadActa()
    } else if (confirmDialog.action === 'certify') {
      await certifyActa(currentActaKey.value); notify('success', 'Acta certificada.'); await reloadActa()
    }
    confirmDialog.visible = false
  } catch (error) { notify('error', error instanceof Error ? error.message : String(error)) }
  finally { actionLoading.value = false }
}

const motivos = ref([])
const motivoOptions = computed(() => motivos.value.map((item) => ({ label: item.descripcion || item.nombre || item.textContent || item.nombreCorto || item.codigo || 'Motivo', value: item.nombreCorto || item.codigo || item.value || item.descripcion || item.nombre })).filter((item) => item.value))
const managementDialog = reactive({ visible: false, mode: 'exclude' })
const managementForm = reactive({ motivo: '', nota: '', modificarHistorico: false })
const ensureMotivos = async () => { if (!motivos.value.length) motivos.value = await loadMotivos() }
const openManagement = async (mode) => { try { await ensureMotivos(); Object.assign(managementForm, { motivo: '', nota: '', modificarHistorico: false }); managementDialog.mode = mode; managementDialog.visible = true } catch (error) { notify('error', error instanceof Error ? error.message : String(error)) } }
const submitManagement = async () => {
  if (!managementForm.motivo) return
  actionLoading.value = true
  try {
    if (managementDialog.mode === 'exclude') {
      await excludeOts({ nroOts: selectedOts.value.map((row) => row.numeroOT), nota: managementForm.nota, modificarHistorico: managementForm.modificarHistorico, motivoNombreCorto: managementForm.motivo })
      notify('success', 'Exclusión ejecutada correctamente.')
    } else {
      const row = selectedOts.value[0]
      await includeOt({ nroOT: row.numeroOT, nota: managementForm.nota, motivoNombreCorto: managementForm.motivo, modificarHistorico: managementForm.modificarHistorico, reseteo: managementForm.modificarHistorico })
      notify('success', 'OT incluida correctamente.')
    }
    managementDialog.visible = false
    selectedOts.value = []
    await reloadActa()
  } catch (error) { notify('error', error instanceof Error ? error.message : String(error)) }
  finally { actionLoading.value = false }
}

const transfer = reactive({ active: false, step: 1, hasNotes: false, form: { region: '', subregion: '', base: '', provincia: '', tipoContrato: '', sociedad: '', contratista: '', nota: '' } })
const transferOptions = reactive({ regiones: [], subregiones: [], bases: [], contratos: [], sociedades: [], contratistas: [] })
const normalizeCombo = (items) => (Array.isArray(items) ? items : []).map((item) => ({ label: item.textContent || item.nombre || item.label || item.codigo || item.value || '', value: String(item.value ?? item.codigo ?? item.idLogiEstruc ?? item.nombreCorto ?? ''), raw: item })).filter((item) => item.value)
const optionLabel = (options, value) => options.find((item) => item.value === value)?.label || ''
const startTransfer = async () => {
  actionLoading.value = true
  try {
    const payload = await loadTransferOptions()
    transferOptions.regiones = normalizeCombo(payload?.regiones)
    transferOptions.contratos = normalizeCombo(payload?.contratos)
    transferOptions.sociedades = normalizeCombo(payload?.sociedades)
    transferOptions.contratistas = normalizeCombo(payload?.contratistas)
    transferOptions.subregiones = []
    transferOptions.bases = normalizeCombo(payload?.basesTecnicas)
    Object.assign(transfer.form, { region: '', subregion: '', base: '', provincia: payload?.provincia || '', tipoContrato: '', sociedad: '', contratista: '', nota: '' })
    transfer.active = true; transfer.step = 1; transfer.hasNotes = false
  } catch (error) { notify('error', error instanceof Error ? error.message : String(error)) }
  finally { actionLoading.value = false }
}
const cancelTransfer = () => { transfer.active = false; transfer.step = 1 }
const onTransferRegion = async () => {
  const region = transferOptions.regiones.find((item) => item.value === transfer.form.region)
  if (!region) return
  try {
    const payload = await loadSubregions({ nombre: region.raw?.nombre || region.label, codigo: region.raw?.codigo || region.value })
    const all = normalizeCombo(payload)
    transferOptions.subregiones = all.filter((item) => String(item.raw?.tipoEstructura || '').toUpperCase().includes('SUB'))
    transferOptions.bases = all.filter((item) => String(item.raw?.tipoEstructura || '').toUpperCase().includes('BASE'))
  } catch (error) { notify('error', error instanceof Error ? error.message : String(error)) }
}
const canValidateTransfer = computed(() => Boolean(transfer.form.nota.trim() && (transfer.form.region || transfer.form.base || transfer.form.tipoContrato || transfer.form.sociedad || transfer.form.contratista)))
const runTransferValidation = async () => {
  actionLoading.value = true
  try { const result = await validateTransfer(selectedOts.value.map((row) => row.numeroOT)); transfer.hasNotes = String(result?.hayNotas || '').toLowerCase() === 'true'; transfer.step = 3 }
  catch (error) { notify('error', error instanceof Error ? error.message : String(error)) }
  finally { actionLoading.value = false }
}
const confirmTransfer = async () => {
  actionLoading.value = true
  try {
    const base = transferOptions.bases.find((item) => item.value === transfer.form.base)
    const region = transferOptions.regiones.find((item) => item.value === transfer.form.region)
    await executeTransfer({
      nroOrdenTrabajo: selectedOts.value.map((row) => row.numeroOT),
      codigoRegion: region?.raw?.codigo || region?.value || '', provincia: transfer.form.provincia,
      empresaContratistaCodigo: transfer.form.contratista, tipoContratoNombreCorto: transfer.form.tipoContrato,
      sociedadNombreCorto: transfer.form.sociedad, nota: transfer.form.nota,
      baseTecnicaCodigo: base?.raw?.codigo || base?.value || '', baseTecnicaNombre: base?.raw?.nombre || base?.label || '',
    })
    notify('success', 'Traspaso ejecutado correctamente.'); cancelTransfer(); selectedOts.value = []; await reloadActa()
  } catch (error) { notify('error', error instanceof Error ? error.message : String(error)) }
  finally { actionLoading.value = false }
}

const exportFullHistory = async () => {
  if (!fullHistoryRows.value.length) return
  const fields = Object.keys(fullHistoryRows.value[0] || {}).filter((field) => typeof fullHistoryRows.value[0]?.[field] !== 'object')
  const columns = fields.map((field) => ({ field, header: field }))
  await exportToExcel({ rows: fullHistoryRows.value, fields, columns, filename: `OT_${selectedOt.value.numeroOT}_Historial_Completo.xlsx`, columnTypes: {}, valueTransformers: {} })
}
const exportActa = async () => {
  exportLoading.value = true
  try {
    let rows = await loadActaExportRows(currentActaKey.value)
    if (!includeExcludedExport.value) rows = rows.filter((row) => String(row.excluida || 'N').toUpperCase() !== 'S')
    if (!rows.length) throw new Error('No hay datos para exportar.')
    const fields = Object.keys(rows[0]).filter((field) => typeof rows[0]?.[field] !== 'object')
    const columns = fields.map((field) => ({ field, header: field.replaceAll('_', ' ').toUpperCase() }))
    const suffix = certified.value ? 'Acta_Certificada' : 'Preliminar'
    const excluded = includeExcludedExport.value ? '_Excluidas' : ''
    await exportToExcel({ rows, fields, columns, filename: `${currentActaKey.value}_${suffix}${excluded}.xlsx`, columnTypes: {}, valueTransformers: {} })
    notify('success', 'Excel generado correctamente.')
  } catch (error) { notify('error', error instanceof Error ? error.message : String(error)) }
  finally { exportLoading.value = false }
}
</script>

<style scoped>
.actas-demo-workspace { width:100%; height:calc(100dvh - 82px); min-height:0; display:flex; flex-direction:column; overflow:hidden; background:#f4f7f9; color:#23343d; font-family:Arial,Helvetica,sans-serif; }
.actas-demo-topbar { min-height:58px; flex:0 0 58px; display:flex; align-items:center; gap:12px; padding:7px 12px; border-bottom:1px solid #d7e1e5; background:#fff; }
.actas-demo-back { flex:0 0 auto; }
.actas-demo-documents { min-width:0; flex:1 1 auto; display:flex; gap:6px; overflow-x:auto; padding:1px 2px; }
.actas-demo-document { min-width:132px; height:42px; display:grid; grid-template-columns:auto 1fr; grid-template-rows:15px 17px; align-items:center; gap:0 7px; padding:4px 9px; border:1px solid #d5e0e4; border-radius:6px; background:#fff; color:#667982; text-align:left; cursor:pointer; }
.actas-demo-document>span { grid-row:1/3; font-size:9px; font-weight:800; letter-spacing:.08em; color:#779099; }
.actas-demo-document>strong { font-size:13px; color:#243c46; }.actas-demo-document>small { font-size:8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.actas-demo-document.is-active { border-color:#00a9bd; background:#effbfc; box-shadow:inset 3px 0 0 #00a9bd; }.actas-demo-document.is-active>strong { color:#007f91; }
.actas-demo-feedback { min-height:36px; flex:0 0 auto; display:flex; align-items:center; gap:8px; padding:6px 12px; border-bottom:1px solid; font-size:11px; }.actas-demo-feedback>span { flex:1; }.actas-demo-feedback>button{border:0;background:transparent;font-size:18px;cursor:pointer;}.actas-demo-feedback.is-success{background:#effaf2;color:#24773b;border-color:#c6e9d0}.actas-demo-feedback.is-error{background:#fff2f3;color:#a62e38;border-color:#efcbd0}.actas-demo-feedback.is-warning{background:#fff9ec;color:#956a16;border-color:#ecdba9}.actas-demo-feedback.is-info{background:#eff8fc;color:#28728e;border-color:#c9e3ef}
.actas-demo-layout { min-height:0; flex:1 1 auto; display:grid; grid-template-columns:245px minmax(0,1fr); overflow:hidden; }
.actas-demo-stepper { min-height:0; overflow-y:auto; padding:12px 10px; border-right:1px solid #d5e0e4; background:#f9fbfc; }
.actas-demo-stepper__head { margin-bottom:12px; padding:11px 12px; border:1px solid #d6e4e7; border-left:3px solid #00a9bd; border-radius:5px; background:#fff; display:flex; flex-direction:column; gap:2px; }.actas-demo-stepper__head span{font-size:9px;text-transform:uppercase;color:#7a9099;font-weight:700}.actas-demo-stepper__head strong{font-size:17px;color:#007f91}.actas-demo-stepper__head small{font-size:9px;color:#677b84;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.actas-demo-step { width:100%; min-height:62px; display:grid; grid-template-columns:34px minmax(0,1fr); gap:6px; padding:0; border:0; background:transparent; color:#64777f; text-align:left; cursor:pointer; }.actas-demo-step__rail{height:100%;display:flex;flex-direction:column;align-items:center}.actas-demo-step__circle{width:27px;height:27px;display:grid;place-items:center;flex:0 0 27px;border:1px solid #c8d5da;border-radius:50%;background:#fff;color:#73868f;font-size:11px}.actas-demo-step__line{width:1px;flex:1;background:#d5e0e4}.actas-demo-step__text{display:flex;flex-direction:column;gap:3px;padding:4px 7px 7px;border-radius:5px}.actas-demo-step__text strong{font-size:11px}.actas-demo-step__text small{font-size:9px;line-height:1.25}.actas-demo-step.is-active .actas-demo-step__circle{border-color:#00a9bd;background:#00a9bd;color:#fff;box-shadow:0 0 0 3px #dff7fa}.actas-demo-step.is-active .actas-demo-step__text{background:#eaf9fb;color:#007f91}.actas-demo-step.is-active .actas-demo-step__text strong{font-size:12px}
.actas-demo-panel { position:relative; min-width:0; min-height:0; display:flex; flex-direction:column; overflow:hidden; background:#fff; }.actas-demo-panel__header{min-height:62px;flex:0 0 62px;display:flex;align-items:center;justify-content:space-between;padding:8px 15px;border-bottom:1px solid #d7e1e5;background:#fff}.actas-demo-panel__header>div>span{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#008b9d}.actas-demo-panel__header h2{margin:3px 0 0;font-size:18px;color:#243840}
.actas-demo-state,.actas-demo-status-dot,.actas-demo-mini-state{display:inline-flex;align-items:center;justify-content:center;border:1px solid transparent;border-radius:999px;font-weight:700;white-space:nowrap}.actas-demo-state{min-width:82px;padding:4px 9px;font-size:9px}.actas-demo-status-dot{width:fit-content;padding:1px 5px;font-size:8px}.actas-demo-mini-state{padding:2px 6px;font-size:8px}.is-success{border-color:#bfe7ca!important;background:#ebf8ee!important;color:#20783b!important}.is-info{border-color:#bcdff1!important;background:#ebf6fc!important;color:#1977a5!important}.is-warning{border-color:#f0d39b!important;background:#fff6df!important;color:#a56b08!important}.is-danger{border-color:#efbdc2!important;background:#fdebed!important;color:#ae303b!important}.is-neutral{border-color:#d7e0e3!important;background:#f2f5f6!important;color:#60727a!important}
.actas-demo-content { min-height:0; flex:1 1 auto; padding:12px 14px; overflow:auto; }.actas-demo-content--fill{display:flex;flex-direction:column;overflow:hidden;padding:10px 12px}.actas-demo-summary-grid{display:grid;grid-template-columns:repeat(4,minmax(180px,1fr));gap:10px}.actas-demo-summary-card{min-height:82px;padding:12px;border:1px solid #d8e3e7;border-radius:7px;background:#fbfdfe;box-shadow:0 2px 8px rgba(32,62,74,.04);display:flex;flex-direction:column;gap:7px}.actas-demo-summary-card span{font-size:9px;text-transform:uppercase;font-weight:700;color:#778b94}.actas-demo-summary-card strong{font-size:13px;color:#273e48}
.actas-demo-sectionbar{min-height:49px;flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:3px 2px 8px}.actas-demo-sectionbar h3{margin:0;font-size:14px;color:#263b44}.actas-demo-sectionbar p{margin:3px 0 0;font-size:9px;color:#72858e}.actas-demo-sectionbar__actions{display:flex;align-items:center;gap:8px}.actas-demo-chip{display:inline-flex;align-items:center;padding:4px 8px;border:1px solid #cce5e8;border-radius:999px;background:#effafa;color:#008591;font-size:9px;font-weight:700}.actas-demo-link{border:0;background:transparent;padding:0;color:#00899a;font-size:11px;font-weight:700;cursor:pointer;text-decoration:none}.actas-demo-link:hover{text-decoration:underline;color:#006e7b}
.actas-demo-ot-head{min-height:48px;flex:0 0 auto;display:grid;grid-template-columns:auto auto minmax(0,1fr);align-items:center;gap:12px;padding:4px 7px;border:1px solid #d7e1e5;border-bottom:0;background:#f8fafb}.actas-demo-ot-head>div:nth-child(2){display:flex;flex-direction:column}.actas-demo-ot-head>div:nth-child(2)>span{font-size:8px;text-transform:uppercase;color:#7b8e96}.actas-demo-ot-head>div:nth-child(2)>strong{font-size:14px;color:#008595}.actas-demo-ot-head__meta{min-width:0;display:flex;gap:8px;justify-content:flex-end}.actas-demo-ot-head__meta span{max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:3px 7px;border:1px solid #d8e3e7;border-radius:4px;background:#fff;font-size:9px;color:#5f747d}
.actas-demo-ot-stepper{min-height:54px;flex:0 0 54px;display:grid;grid-template-columns:repeat(5,minmax(110px,1fr));border:1px solid #d7e1e5;background:#fff}.actas-demo-ot-stepper button{display:flex;align-items:center;justify-content:center;gap:7px;border:0;border-right:1px solid #e1e8eb;background:#fff;color:#687b84;font-size:10px;font-weight:700;cursor:pointer}.actas-demo-ot-stepper button:last-child{border-right:0}.actas-demo-ot-stepper button i{font-size:12px}.actas-demo-ot-stepper button.is-active{position:relative;background:#eaf9fb;color:#007e90}.actas-demo-ot-stepper button.is-active::after{content:'';position:absolute;left:12px;right:12px;bottom:0;height:3px;background:#00a9bd}.actas-demo-ot-body{position:relative;min-height:0;flex:1 1 auto;display:flex;flex-direction:column;overflow:hidden;border:1px solid #d7e1e5;border-top:0}.actas-demo-ot-summary{padding:13px;display:grid;grid-template-columns:repeat(4,minmax(160px,1fr));gap:9px;overflow:auto}.actas-demo-ot-summary article{padding:10px;border:1px solid #dce5e8;border-radius:5px;background:#fbfdfe;display:flex;flex-direction:column;gap:5px}.actas-demo-ot-summary span{font-size:8px;text-transform:uppercase;color:#7c8e95}.actas-demo-ot-summary strong{font-size:11px;color:#263c45}
.actas-demo-activities{min-height:0;flex:1 1 auto;display:grid;grid-template-rows:1fr 1fr;gap:8px;padding:8px;overflow:hidden}.actas-demo-subgrid,.actas-demo-single-grid{min-height:0;display:flex;flex-direction:column;overflow:hidden}.actas-demo-single-grid{flex:1;padding:8px}.actas-demo-inline-actions{display:flex;align-items:center;gap:2px}.actas-demo-inline-actions :deep(.p-button){width:26px;height:26px;padding:0;color:#263238}.actas-demo-inline-actions :deep(.p-button:hover){color:#00a9bd!important;background:#eafafa!important}.actas-demo-readonly-note{min-height:32px;flex:0 0 auto;display:flex;align-items:center;gap:7px;padding:5px 8px;border:1px solid #d7e5ea;border-bottom:0;background:#f4fafc;color:#54717d;font-size:9px}.actas-demo-history-child{height:250px;padding:8px 10px 10px;background:#f6f9fa}.actas-demo-history-child>span{display:block;margin-bottom:6px;font-size:10px;font-weight:700;color:#3a5661}
.actas-demo-management{display:flex;flex-direction:column;overflow:hidden}.actas-demo-management-actions{display:grid;grid-template-columns:repeat(3,minmax(190px,1fr));gap:10px;flex:0 0 auto}.actas-demo-management-actions button{min-height:78px;display:grid;grid-template-columns:34px 1fr;grid-template-rows:auto auto;gap:2px 7px;padding:10px;border:1px solid #d5e2e6;border-radius:6px;background:#fff;color:#31505b;text-align:left;cursor:pointer}.actas-demo-management-actions button i{grid-row:1/3;align-self:center;font-size:22px;color:#00a1b4}.actas-demo-management-actions button strong{font-size:11px}.actas-demo-management-actions button span{font-size:9px;color:#71858d}.actas-demo-management-actions button:hover:not(:disabled){border-color:#00a9bd;background:#f2fbfc}.actas-demo-management-actions button:disabled{opacity:.45;cursor:not-allowed}.actas-demo-management-grid{min-height:0;flex:1;margin-top:10px;overflow:hidden}
.actas-demo-transfer{min-height:0;flex:1;margin-top:10px;display:flex;flex-direction:column;border:1px solid #d5e1e5;background:#fff;overflow:auto}.actas-demo-transfer-steps{min-height:54px;display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid #d8e2e6}.actas-demo-transfer-steps button{display:flex;align-items:center;justify-content:center;gap:6px;border:0;border-right:1px solid #e0e7ea;background:#f7f9fa;color:#84939a}.actas-demo-transfer-steps button span{width:23px;height:23px;display:grid;place-items:center;border:1px solid #cbd6da;border-radius:50%;background:#fff;font-size:9px}.actas-demo-transfer-steps button strong{font-size:9px}.actas-demo-transfer-steps button.is-active{background:#ebf9fb;color:#008597}.actas-demo-transfer-steps button.is-active span,.actas-demo-transfer-steps button.is-complete span{border-color:#00a9bd;background:#00a9bd;color:#fff}.actas-demo-transfer-body{padding:14px;display:flex;flex-direction:column;gap:12px}.actas-demo-transfer-body h4{margin:0;font-size:13px}.actas-demo-token-list{display:flex;flex-wrap:wrap;gap:5px}.actas-demo-token-list span{padding:4px 7px;border:1px solid #cee2e7;border-radius:4px;background:#f5fafb;color:#34616e;font-size:9px;font-weight:700}.actas-demo-form-grid{display:grid;grid-template-columns:repeat(3,minmax(180px,1fr));gap:10px}.actas-demo-form-grid label,.actas-demo-dialog-form label{display:flex;flex-direction:column;gap:4px;font-size:9px;font-weight:700;color:#405b66}.actas-demo-form-grid label.is-wide{grid-column:1/-1}.actas-demo-form-grid :deep(.p-select),.actas-demo-form-grid :deep(.p-inputtext),.actas-demo-form-grid :deep(.p-textarea),.actas-demo-dialog-form :deep(.p-select),.actas-demo-dialog-form :deep(.p-inputtext),.actas-demo-dialog-form :deep(.p-inputnumber),.actas-demo-dialog-form :deep(.p-textarea){width:100%;font-size:11px}.actas-demo-wizard-actions{display:flex;justify-content:flex-end;gap:8px}.actas-demo-validation-card{min-height:72px;display:flex;align-items:center;gap:12px;padding:12px;border:1px solid;border-radius:6px}.actas-demo-validation-card i{font-size:24px}.actas-demo-validation-card>div{display:flex;flex-direction:column;gap:3px}.actas-demo-validation-card strong{font-size:11px}.actas-demo-validation-card span{font-size:9px}.actas-demo-transfer-summary{padding:12px;border:1px solid #dbe4e7;border-radius:5px;background:#fafcfd}.actas-demo-transfer-summary h4{margin:0 0 8px}.actas-demo-transfer-summary p{margin:5px 0;font-size:10px}
.actas-demo-close{background:#f7fafb}.actas-demo-close-grid{display:grid;grid-template-columns:repeat(3,minmax(220px,1fr));gap:12px}.actas-demo-close-card{min-height:250px;display:flex;flex-direction:column;align-items:flex-start;gap:12px;padding:16px;border:1px solid #d5e1e5;border-radius:8px;background:#fff;box-shadow:0 3px 12px rgba(35,66,78,.06)}.actas-demo-close-card.is-primary{border-top:3px solid #00a9bd}.actas-demo-close-card__icon{width:38px;height:38px;display:grid;place-items:center;border-radius:8px;background:#e5f8fa;color:#008fa1;font-size:18px}.actas-demo-close-card h3{margin:0;font-size:14px;color:#273e48}.actas-demo-close-card p{margin:5px 0 0;font-size:9px;line-height:1.4;color:#6d8189}.actas-demo-close-card :deep(.p-rating){font-size:20px;color:#00a9bd}
.actas-demo-dialog-form{display:flex;flex-direction:column;gap:11px;padding:4px}.actas-demo-check{display:flex!important;flex-direction:row!important;align-items:center;gap:7px!important;font-size:9px!important}.actas-demo-confirm{display:flex;align-items:flex-start;gap:12px;padding:8px}.actas-demo-confirm i{font-size:24px;color:#d58a00}.actas-demo-confirm p{margin:2px 0;white-space:pre-line;font-size:11px;line-height:1.4}
@media(max-width:1100px){.actas-demo-layout{grid-template-columns:210px minmax(0,1fr)}.actas-demo-summary-grid,.actas-demo-ot-summary{grid-template-columns:repeat(3,minmax(150px,1fr))}.actas-demo-close-grid{grid-template-columns:1fr}.actas-demo-form-grid{grid-template-columns:repeat(2,minmax(160px,1fr))}}
</style>
