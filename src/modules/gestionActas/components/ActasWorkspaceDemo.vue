<template>
  <div class="gestion-actas-module actas-demo-workspace">
    <header class="actas-demo-topbar">
      <FmButton
        label="VOLVER A LA GRILLA"
        icon="pi-arrow-left"
        variant="outline"
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
            <span class="actas-demo-step__circle"><i class="pi" :class="step.icon" /></span>
            <span v-if="index < detailSteps.length - 1" class="actas-demo-step__line" />
          </span>
          <span class="actas-demo-step__text">
            <strong>{{ step.label }}</strong>
            <small>{{ step.description }}</small>
          </span>
        </button>
      </aside>

      <main class="actas-demo-panel">
        <FmTypingLoader v-if="actaLoading" overlay title="Cargando Acta" :message="`Consultando ${currentActa.nroActa}`" />

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
              <span>{{ item.label }}</span><strong>{{ item.value || '-' }}</strong>
            </article>
          </div>
        </section>

        <section v-else-if="detailStep === 'ots'" class="actas-demo-content actas-demo-content--fill">
          <template v-if="!selectedOt">
            <div class="actas-demo-sectionbar">
              <div>
                <h3>Órdenes de Trabajo</h3>
                <p>Seleccioná varias OTs para operar y abrí sus detalles sin perder el trabajo de las demás.</p>
              </div>
              <div class="actas-demo-sectionbar__actions">
                <span v-if="selectedOts.length" class="actas-demo-chip">{{ selectedOts.length }} seleccionada{{ selectedOts.length === 1 ? '' : 's' }}</span>
                <FmButton label="VALIDAR / VERIFICAR" icon="pi-check-circle" :disabled="!selectedOts.length || certified" @click="confirmRuleValidation" />
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
                <span class="actas-demo-mini-state" :class="data.excluida === 'S' ? 'is-danger' : 'is-success'">{{ data.excluida === 'S' ? 'Excluida' : 'Incluida' }}</span>
              </template>
            </ActasWorkspaceGrid>
          </template>

          <template v-else>
            <div class="actas-demo-ot-head">
              <FmButton label="VOLVER A OTs" icon="pi-arrow-left" variant="outline" @click="closeOt" />
              <div><span>Orden de Trabajo</span><strong>{{ selectedOt.numeroOT }}</strong></div>
              <div class="actas-demo-ot-head__meta">
                <span>{{ selectedOt.tarea || 'Sin tarea' }}</span><span>{{ selectedOt.direccion || 'Sin domicilio' }}</span>
              </div>
            </div>

            <div class="actas-demo-documents" style="flex:0 0 44px;min-height:44px;width:100%" role="tablist" aria-label="OTs abiertas">
              <button
                v-for="ot in openedOts"
                :key="String(ot.numeroOT)"
                type="button"
                class="actas-demo-document"
                :class="{ 'is-active': String(selectedOt?.numeroOT || '') === String(ot.numeroOT) }"
                @click="activateOpenedOt(ot)"
              >
                <span>OT</span>
                <strong>{{ ot.numeroOT }}</strong>
                <small @click.stop="closeOpenedOt(ot)">× Cerrar</small>
              </button>
            </div>

            <nav class="actas-demo-ot-stepper" aria-label="Detalle de Orden de Trabajo">
              <button v-for="tab in otTabs" :key="tab.key" type="button" :class="{ 'is-active': otTab === tab.key }" @click="selectOtTab(tab.key)">
                <i class="pi" :class="tab.icon" /><span>{{ tab.label }}</span>
              </button>
            </nav>

            <div class="actas-demo-ot-body">
              <FmTypingLoader v-if="otLoading" overlay title="Cargando OT" :message="`Consultando ${selectedOt.numeroOT}`" />

              <section v-if="otTab === 'resumen'" class="actas-demo-ot-summary">
                <article v-for="item in otSummaryItems" :key="item.label"><span>{{ item.label }}</span><strong>{{ item.value || '-' }}</strong></article>
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
                        <Button icon="pi pi-plus" text rounded class="fm-icon-button" title="Nueva actividad" :disabled="certified" @click="openActivityCreate" />
                        <Button icon="pi pi-pen-to-square" text rounded class="fm-icon-button" title="Modificar actividad" :disabled="certified || selectedActivities.length !== 1" @click="openActivityEdit" />
                        <Button icon="pi pi-trash" text rounded class="fm-icon-button" title="Dar de baja" :disabled="certified || !selectedActivities.length" @click="openActivityDelete" />
                        <Button icon="pi pi-check-circle" text rounded class="fm-icon-button" title="Validar / Verificar OT" :disabled="certified" @click="confirmSingleOtValidation" />
                        <Button
                          v-if="currentOtDetail?.habilitarDomiReglas"
                          icon="pi pi-sitemap"
                          text
                          rounded
                          class="fm-icon-button"
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
                <ActasWorkspaceGrid :rows="installedBases" :columns="baseColumns" data-key="nroSerie" title="Base instalada" show-export :export-filename="`OT_${selectedOt.numeroOT}_Base_Instalada.xlsx`" empty-text="No hay base instalada" />
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
                  <template #toolbar><FmButton label="EXPORTAR HISTORIAL COMPLETO" icon="pi-download" variant="outline" @click="exportFullHistory" /></template>
                  <template #expansion="{ data }">
                    <div class="actas-demo-history-child">
                      <span>Actividades de OT {{ data.nroOt }}</span>
                      <ActasWorkspaceGrid :rows="data.actividades || []" :columns="historyActivityColumns" data-key="codActividad" :filterable="false" empty-text="Sin actividades para esta OT" />
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
            <div><h3>Actividades / Reglas</h3><p>Validación masiva de las OTs seleccionadas, usando el mismo endpoint del detalle legacy.</p></div>
            <FmButton label="VALIDAR / VERIFICAR" icon="pi-check-circle" :disabled="!selectedOts.length || certified" @click="confirmRuleValidation" />
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
            <div><h3>Gestión de OTs</h3><p>Inclusión, exclusión y traspaso sin encadenar pop-ups.</p></div>
            <span class="actas-demo-chip">{{ selectedOts.length }} seleccionada{{ selectedOts.length === 1 ? '' : 's' }}</span>
          </div>

          <div class="actas-demo-management-actions">
            <button type="button" :disabled="!selectedOts.length || certified" @click="openManagement('exclude')"><i class="pi pi-minus-circle" /><strong>Excluir OTs</strong><span>Motivo, nota e impacto histórico</span></button>
            <button type="button" :disabled="selectedOts.length !== 1 || certified" @click="openManagement('include')"><i class="pi pi-plus-circle" /><strong>Incluir OT</strong><span>Reincorporar una OT excluida</span></button>
            <button type="button" :disabled="!selectedOts.length || certified" @click="startTransfer"><i class="pi pi-arrow-right-arrow-left" /><strong>Gestionar traspaso</strong><span>Wizard de destino y validación</span></button>
          </div>

          <div v-if="transfer.active" class="actas-demo-transfer">
            <nav class="actas-demo-transfer-steps">
              <button v-for="step in 4" :key="step" type="button" :class="{ 'is-active': transfer.step === step, 'is-complete': transfer.step > step }" disabled><span>{{ step }}</span><strong>{{ transferStepLabels[step - 1] }}</strong></button>
            </nav>

            <div v-if="transfer.step === 1" class="actas-demo-transfer-body">
              <h4>OTs a traspasar</h4>
              <div class="actas-demo-token-list"><span v-for="ot in selectedOts" :key="ot.numeroOT">{{ ot.numeroOT }}</span></div>
              <div class="actas-demo-wizard-actions"><FmButton label="CANCELAR" variant="outline" @click="cancelTransfer" /><FmButton label="SIGUIENTE" icon="pi-arrow-right" @click="transfer.step = 2" /></div>
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
              <div class="actas-demo-wizard-actions"><FmButton label="ATRÁS" variant="outline" @click="transfer.step = 1" /><FmButton label="VALIDAR DESTINO" icon="pi-shield" :disabled="!canValidateTransfer" @click="runTransferValidation" /></div>
            </div>

            <div v-else-if="transfer.step === 3" class="actas-demo-transfer-body">
              <div class="actas-demo-validation-card" :class="transfer.hasNotes ? 'is-warning' : 'is-success'">
                <i class="pi" :class="transfer.hasNotes ? 'pi-exclamation-triangle' : 'pi-check-circle'" />
                <div><strong>{{ transfer.hasNotes ? 'Hay notas relacionadas' : 'Validación correcta' }}</strong><span>{{ transfer.hasNotes ? 'El legacy permite continuar con confirmación explícita.' : 'Las OTs pueden avanzar al resumen final.' }}</span></div>
              </div>
              <div class="actas-demo-wizard-actions"><FmButton label="ATRÁS" variant="outline" @click="transfer.step = 2" /><FmButton label="CONTINUAR" icon="pi-arrow-right" @click="transfer.step = 4" /></div>
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
              <div class="actas-demo-wizard-actions"><FmButton label="ATRÁS" variant="outline" @click="transfer.step = 3" /><FmButton label="CONFIRMAR TRASPASO" icon="pi-check" :loading="actionLoading" @click="confirmTransfer" /></div>
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
              <FmButton label="CALIFICAR" icon="pi-star-fill" :disabled="certified || !rating" :loading="actionLoading" @click="confirmRating" />
            </article>

            <article class="actas-demo-close-card">
              <span class="actas-demo-close-card__icon"><i class="pi pi-file-excel" /></span>
              <div><h3>Exportar Acta</h3><p>Usa el exportador ExcelJS que ya utilizan las pantallas Vue migradas.</p></div>
              <label class="actas-demo-check"><Checkbox v-model="includeExcludedExport" binary /><span>Incluir OTs excluidas</span></label>
              <FmButton label="EXPORTAR EXCEL" icon="pi-download" variant="outline" :loading="exportLoading" @click="exportActa" />
            </article>

            <article class="actas-demo-close-card is-primary">
              <span class="actas-demo-close-card__icon"><i class="pi pi-verified" /></span>
              <div><h3>Certificación</h3><p>Antes de certificar se consulta si existen OTs fallidas pendientes.</p></div>
              <span class="actas-demo-state" :class="stateClass(currentHeader.estado || currentActa.estadoActa)">{{ currentHeader.estado || currentActa.estadoActa || '-' }}</span>
              <FmButton label="CERTIFICAR ACTA" icon="pi-check-circle" :disabled="certified" :loading="actionLoading" @click="prepareCertification" />
            </article>
          </div>
        </section>
      </main>
    </div>

    <Dialog v-model:visible="activityDialog.visible" modal :header="activityDialogTitle" :style="{ '--fm-dialog-width': '32rem' }" :draggable="false" class="fm-dialog gestion-actas-dialog">
      <div style="display:grid;grid-template-columns:1fr;gap:10px">
        <label v-if="activityDialog.mode === 'create'" class="gestion-field"><span>Código de actividad</span><InputText v-model="activityForm.codActividad" placeholder="Ingrese el código" /></label>
        <label v-if="activityDialog.mode === 'create'" class="gestion-field"><span>Descripción</span><InputText v-model="activityForm.descripcion" /></label>
        <label v-if="activityDialog.mode === 'edit'" class="gestion-field"><span>Cantidad</span><InputNumber v-model="activityForm.cantidad" :min="0.01" :max="3000000" :maxFractionDigits="2" style="width:100%" /></label>
        <label class="gestion-field"><span>Motivo</span><InputText v-model="activityForm.motivo" /></label>
        <label v-if="activityDialog.mode === 'edit'" class="gestion-field"><span>Comentario</span><Textarea v-model="activityForm.comentario" rows="3" maxlength="200" autoResize style="width:100%" /></label>
        <label class="actas-demo-check"><Checkbox v-model="activityForm.modificarHistorico" binary /><span>Resetear reglas B en OTs históricas relacionadas</span></label>
      </div>
      <template #footer><FmButton label="CANCELAR" variant="outline" @click="activityDialog.visible = false" /><FmButton :label="activityDialogConfirmLabel" icon="pi-check" :loading="actionLoading" @click="submitActivityAction" /></template>
    </Dialog>

    <Dialog v-model:visible="managementDialog.visible" modal :header="managementDialog.mode === 'exclude' ? 'Excluir OTs' : 'Incluir OT'" :style="{ '--fm-dialog-width': '32rem' }" :draggable="false" class="fm-dialog gestion-actas-dialog">
      <div style="display:grid;grid-template-columns:1fr;gap:10px">
        <div class="actas-demo-token-list"><span v-for="ot in selectedOts" :key="ot.numeroOT">{{ ot.numeroOT }}</span></div>
        <label class="gestion-field"><span>Motivo</span><Select v-model="managementForm.motivo" :options="motivoOptions" optionLabel="label" optionValue="value" placeholder="Seleccione..." filter /></label>
        <label class="gestion-field"><span>Nota</span><Textarea v-model="managementForm.nota" rows="3" maxlength="200" autoResize style="width:100%" /></label>
        <label class="actas-demo-check"><Checkbox v-model="managementForm.modificarHistorico" binary /><span>Resetear reglas B en OTs históricas relacionadas</span></label>
      </div>
      <template #footer><FmButton label="CANCELAR" variant="outline" @click="managementDialog.visible = false" /><FmButton label="CONFIRMAR" icon="pi-check" :loading="actionLoading" :disabled="!managementForm.motivo" @click="submitManagement" /></template>
    </Dialog>

    <Dialog v-model:visible="confirmDialog.visible" modal :header="confirmDialog.title" :style="{ '--fm-dialog-width': '31rem' }" :draggable="false" class="fm-dialog gestion-actas-dialog">
      <div class="gestion-actas-confirm"><i class="pi pi-exclamation-triangle" /><p>{{ confirmDialog.message }}</p></div>
      <template #footer><FmButton label="CANCELAR" variant="outline" @click="confirmDialog.visible = false" /><FmButton label="CONFIRMAR" icon="pi-check" :loading="actionLoading" @click="runConfirmedAction" /></template>
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
import FmButton from '@/components/shared/FmButton.vue'
import FmTypingLoader from '@/components/shared/FmTypingLoader.vue'
import ActasWorkspaceGrid from './ActasWorkspaceGrid.vue'
import { useExcelExport } from '@/composables/useExportExcel'
import { useGestionActasStore } from '@/store/gestionActas'

const props = defineProps({
  actas: { type: Array, default: () => [] },
  initialActa: { type: String, default: '' },
})
defineEmits(['back'])

const store = useGestionActasStore()
const { exportToExcel } = useExcelExport()
const activeActaNumber = ref(props.initialActa || props.actas[0]?.nroActa || '')
const detailStep = ref('resumen')
const actaLoading = ref(false)
const actaDetails = reactive({})
const selectedOts = ref([])
const selectedOt = ref(null)
const openedOts = ref([])
const otLoading = ref(false)
const otDetails = reactive({})
const otUiState = reactive({})
const materialsByOt = reactive({})
const materialsLoading = ref(false)
const actionLoading = ref(false)
const exportLoading = ref(false)
const rating = ref(0)
const includeExcludedExport = ref(false)
const feedback = reactive({ type: 'info', text: '' })
const validationOtNumbers = ref([])

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
const ensureOtUi = (key) => {
  if (!otUiState[key]) otUiState[key] = { tab: 'resumen', selectedActivities: [], expandedHistoryRows: {} }
  return otUiState[key]
}
const emptyOtUi = { tab: 'resumen', selectedActivities: [], expandedHistoryRows: {} }
const currentOtUi = computed(() => currentOtKey.value ? ensureOtUi(currentOtKey.value) : emptyOtUi)
const otTab = computed({
  get: () => currentOtUi.value.tab,
  set: (value) => { if (currentOtKey.value) ensureOtUi(currentOtKey.value).tab = value },
})
const selectedActivities = computed({
  get: () => currentOtUi.value.selectedActivities,
  set: (value) => { if (currentOtKey.value) ensureOtUi(currentOtKey.value).selectedActivities = value },
})
const expandedHistoryRows = computed({
  get: () => currentOtUi.value.expandedHistoryRows,
  set: (value) => { if (currentOtKey.value) ensureOtUi(currentOtKey.value).expandedHistoryRows = value },
})
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
    actaDetails[key] = await store.loadActaDetail(key)
    const currentRating = Number(actaDetails[key]?.actaDetalleAdapter?.calificacion || currentActa.value?.valoracion || 0)
    rating.value = Number.isFinite(currentRating) ? currentRating : 0
  } catch (error) { notify('error', error instanceof Error ? error.message : String(error)) }
  finally { actaLoading.value = false }
}
const selectActa = async (acta) => {
  activeActaNumber.value = acta.nroActa
  detailStep.value = 'resumen'
  selectedOts.value = []
  openedOts.value = []
  closeOt()
  await loadCurrentActa()
}
const reloadActa = async () => { await loadCurrentActa(true); if (selectedOt.value) await reloadOt() }
const activateOpenedOt = async (row) => { selectedOt.value = row; ensureOtUi(`${currentActaKey.value}::${row.numeroOT}`); await loadCurrentOt() }
const openOt = async (row) => {
  if (!openedOts.value.some((item) => String(item.numeroOT) === String(row.numeroOT))) openedOts.value.push(row)
  await activateOpenedOt(row)
}
const closeOpenedOt = (row) => {
  const key = String(row.numeroOT)
  const index = openedOts.value.findIndex((item) => String(item.numeroOT) === key)
  if (index < 0) return
  const wasActive = String(selectedOt.value?.numeroOT || '') === key
  openedOts.value.splice(index, 1)
  if (wasActive) {
    selectedOt.value = openedOts.value[index] || openedOts.value[index - 1] || null
    if (selectedOt.value) loadCurrentOt()
  }
}
const openOtFromStep = async (row) => { detailStep.value = 'ots'; await openOt(row) }
const closeOt = () => { selectedOt.value = null }
const loadCurrentOt = async (force = false) => {
  if (!selectedOt.value) return
  const key = currentOtKey.value
  if (!key || (!force && otDetails[key])) return
  otLoading.value = true
  try { otDetails[key] = await store.loadOtDetail({ nroActa: currentActaKey.value, nroOt: selectedOt.value.numeroOT }) }
  catch (error) { notify('error', error instanceof Error ? error.message : String(error)) }
  finally { otLoading.value = false }
}
const reloadOt = async () => { if (selectedOt.value) await loadCurrentOt(true) }
const selectOtTab = async (tab) => { otTab.value = tab; if (tab === 'materiales') await refreshMaterials(false) }
const refreshMaterials = async (showMessage = true) => {
  if (!selectedOt.value) return
  materialsLoading.value = true
  try { materialsByOt[currentOtKey.value] = await store.loadOtMaterials(selectedOt.value.numeroOT); if (showMessage) notify('success', 'Materiales actualizados.') }
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
      await store.createActivity({ nroOt: selectedOt.value.numeroOT, codActividad: activityForm.codActividad, descripcion: activityForm.descripcion, motivo: activityForm.motivo, modificarHistorico: activityForm.modificarHistorico })
      notify('success', 'Actividad agregada correctamente.')
    } else if (activityDialog.mode === 'edit') {
      const target = selectedActivities.value[0]
      const updated = resultingActivities.value.map((row) => row === target || row.codActividad === target.codActividad ? { ...row, cantidadResultante: activityForm.cantidad, comentario: activityForm.comentario, motivo: activityForm.motivo, update: 'M' } : row)
      await store.saveResultingActivities({ nroOT: selectedOt.value.numeroOT, actividadesResultantes: updated, reset: activityForm.modificarHistorico })
      notify('success', 'Actividad modificada correctamente.')
    } else {
      for (const row of selectedActivities.value) {
        await store.deleteActivity({ nroActa: currentActaKey.value, nroOt: selectedOt.value.numeroOT, codActividad: row.codActividad, descripcion: row.actividad || '', motivo: activityForm.motivo, modificarHistorico: activityForm.modificarHistorico })
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
const confirmRuleValidation = () => {
  validationOtNumbers.value = selectedOts.value.map((row) => row.numeroOT)
  if (validationOtNumbers.value.length) openConfirm('validateRules', 'Validar / Verificar OTs', `Se validarán ${validationOtNumbers.value.length} OT(s) seleccionadas. ¿Continuar?`)
}
const confirmSingleOtValidation = () => {
  if (!selectedOt.value) return
  validationOtNumbers.value = [selectedOt.value.numeroOT]
  openConfirm('validateRules', 'Validar / Verificar OT', `Se validará la OT ${selectedOt.value.numeroOT}. ¿Continuar?`)
}
const confirmDomicileRules = () => selectedOt.value && openConfirm('domicileRules', 'Ejecutar reglas del domicilio', `Se ejecutarán las reglas para la OT ${selectedOt.value.numeroOT}. ¿Continuar?`)
const confirmRating = () => openConfirm('rate', 'Calificar Acta', `Se guardará una calificación de ${rating.value} estrella(s) para el Acta ${currentActaKey.value}.`)
const prepareCertification = async () => {
  actionLoading.value = true
  try {
    const warning = await store.checkFailedOts(currentActaKey.value)
    const message = warning && String(warning).trim() ? `${warning}\n\n¿Desea continuar con la certificación?` : `Se certificará el Acta ${currentActaKey.value}. Esta acción modifica su estado. ¿Continuar?`
    openConfirm('certify', 'Certificar Acta', message)
  } catch (error) { notify('error', error instanceof Error ? error.message : String(error)) }
  finally { actionLoading.value = false }
}
const runConfirmedAction = async () => {
  actionLoading.value = true
  try {
    if (confirmDialog.action === 'validateRules') {
      await store.validateOtRules(validationOtNumbers.value); notify('success', 'Validación / verificación ejecutada.'); await reloadActa()
    } else if (confirmDialog.action === 'domicileRules') {
      await store.executeDomicileRules(selectedOt.value.numeroOT); notify('success', 'Reglas del domicilio ejecutadas.'); await reloadOt()
    } else if (confirmDialog.action === 'rate') {
      await store.rateActa({ nroActa: currentActaKey.value, calificacion: rating.value }); notify('success', 'Calificación guardada.'); await reloadActa()
    } else if (confirmDialog.action === 'certify') {
      await store.certifyActa(currentActaKey.value); notify('success', 'Acta certificada.'); await reloadActa()
    }
    confirmDialog.visible = false
  } catch (error) { notify('error', error instanceof Error ? error.message : String(error)) }
  finally { actionLoading.value = false }
}

const motivos = ref([])
const motivoOptions = computed(() => motivos.value.map((item) => ({ label: item.descripcion || item.nombre || item.textContent || item.nombreCorto || item.codigo || 'Motivo', value: item.nombreCorto || item.codigo || item.value || item.descripcion || item.nombre })).filter((item) => item.value))
const managementDialog = reactive({ visible: false, mode: 'exclude' })
const managementForm = reactive({ motivo: '', nota: '', modificarHistorico: false })
const ensureMotivos = async () => { if (!motivos.value.length) motivos.value = await store.loadMotivos() }
const openManagement = async (mode) => { try { await ensureMotivos(); Object.assign(managementForm, { motivo: '', nota: '', modificarHistorico: false }); managementDialog.mode = mode; managementDialog.visible = true } catch (error) { notify('error', error instanceof Error ? error.message : String(error)) } }
const submitManagement = async () => {
  if (!managementForm.motivo) return
  actionLoading.value = true
  try {
    if (managementDialog.mode === 'exclude') {
      await store.excludeOts({ nroOts: selectedOts.value.map((row) => row.numeroOT), nota: managementForm.nota, modificarHistorico: managementForm.modificarHistorico, motivoNombreCorto: managementForm.motivo })
      notify('success', 'Exclusión ejecutada correctamente.')
    } else {
      const row = selectedOts.value[0]
      await store.includeOt({ nroOT: row.numeroOT, nota: managementForm.nota, motivoNombreCorto: managementForm.motivo, modificarHistorico: managementForm.modificarHistorico, reseteo: managementForm.modificarHistorico })
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
    const payload = await store.loadTransferOptions()
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
    const payload = await store.loadSubregions({ nombre: region.raw?.nombre || region.label, codigo: region.raw?.codigo || region.value })
    const all = normalizeCombo(payload)
    transferOptions.subregiones = all.filter((item) => String(item.raw?.tipoEstructura || '').toUpperCase().includes('SUB'))
    transferOptions.bases = all.filter((item) => String(item.raw?.tipoEstructura || '').toUpperCase().includes('BASE'))
  } catch (error) { notify('error', error instanceof Error ? error.message : String(error)) }
}
const canValidateTransfer = computed(() => Boolean(transfer.form.nota.trim() && (transfer.form.region || transfer.form.base || transfer.form.tipoContrato || transfer.form.sociedad || transfer.form.contratista)))
const runTransferValidation = async () => {
  actionLoading.value = true
  try { const result = await store.validateTransfer(selectedOts.value.map((row) => row.numeroOT)); transfer.hasNotes = String(result?.hayNotas || '').toLowerCase() === 'true'; transfer.step = 3 }
  catch (error) { notify('error', error instanceof Error ? error.message : String(error)) }
  finally { actionLoading.value = false }
}
const confirmTransfer = async () => {
  actionLoading.value = true
  try {
    const base = transferOptions.bases.find((item) => item.value === transfer.form.base)
    const region = transferOptions.regiones.find((item) => item.value === transfer.form.region)
    await store.executeTransfer({
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
    let rows = await store.loadActaExportRows(currentActaKey.value)
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
