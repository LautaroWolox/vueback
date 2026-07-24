<template>
  <div class="fm-screen fm-screen--pad ot-fallidas-ct">
    <Accordion v-model:value="active" multiple class="fm-accordion">
      <AccordionPanel value="0">
        <AccordionHeader>FILTROS DE BÚSQUEDA</AccordionHeader>
        <AccordionContent>
          <Filtros />
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="1">
        <AccordionHeader>OTS FALLIDAS REPROCESO</AccordionHeader>
        <AccordionContent>
          <Table />
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Table from './components/Table.vue'
import Filtros from './components/Filtros.vue'
import {useFallidasCtStore} from './store/CtFallidaStore'

const active = ref(['0', '1'])
let exclusionLabelsObserver
const store = useFallidasCtStore()

const normalizeVisibleNote = (value) => String(value ?? '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;|&#160;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim()

const syncExistingNotes = () => {
  const excludeContent = document.querySelector('.otf-exclude-content')
  if (!excludeContent) return

  const selectedRows = store.rows.filter((row) => store.selectedRows.includes(row.id))
  const notes = selectedRows
    .map((row) => ({
      ot: String(row.nroOrdenTrabajo ?? '').trim(),
      note: normalizeVisibleNote(row.nota)
    }))
    .filter(({ note }) => note.length > 0)

  let notesContainer = excludeContent.querySelector('.otf-existing-notes')

  if (!notes.length) {
    notesContainer?.remove()
    return
  }

  if (!notesContainer) {
    notesContainer = document.createElement('div')
    notesContainer.className = 'otf-existing-notes'

    const noteField = excludeContent.querySelector('.otf-nota-field')
    excludeContent.insertBefore(notesContainer, noteField ?? null)
  }

  const label = notes.length === 1 ? 'Nota existente' : 'Notas existentes'
  const content = notes.length === 1
    ? notes[0].note
    : notes.map(({ ot, note }) => `${ot ? `OT ${ot}: ` : ''}${note}`).join('\n')
  const signature = `${label}\n${content}`

  if (notesContainer.dataset.signature === signature) return

  notesContainer.dataset.signature = signature
  notesContainer.replaceChildren()

  const labelElement = document.createElement('span')
  labelElement.className = 'otf-existing-notes__label'
  labelElement.textContent = label

  const contentElement = document.createElement('div')
  contentElement.className = 'otf-existing-notes__content'
  contentElement.textContent = content

  notesContainer.append(labelElement, contentElement)
}

const syncDefaultPageSize = () => {
  const select = document.querySelector('.ot-fallidas-ct .otf-rows-select')
  if (!select || select.dataset.defaultRowsApplied === 'true') return

  select.dataset.defaultRowsApplied = 'true'
  if (select.value === '500') return

  select.value = '500'
  select.dispatchEvent(new Event('change', { bubbles: true }))
}

const syncExclusionLabels = () => {
  document
    .querySelectorAll('.otf-grid-shell .fm-grid-actions-final button')
    .forEach((button) => {
      if (!button.querySelector('.pi-trash')) return

      if (button.getAttribute('title') !== 'Excluir OTs') {
        button.setAttribute('title', 'Excluir OTs')
      }

      if (button.getAttribute('aria-label') !== 'Excluir OTs') {
        button.setAttribute('aria-label', 'Excluir OTs')
      }
    })

  document
    .querySelectorAll('.otf-exclude-header > span:first-child')
    .forEach((title) => {
      if (title.textContent !== 'Excluir Orden de Trabajo') {
        title.textContent = 'Excluir Orden de Trabajo'
      }
    })

  document
    .querySelectorAll('.otf-row-action--include')
    .forEach((button) => {
      const unavailable = button.disabled || button.getAttribute('aria-disabled') === 'true'
      button.style.display = unavailable ? 'none' : ''
    })

  syncDefaultPageSize()
  syncExistingNotes()
}

onMounted(() => {
  syncExclusionLabels()

  exclusionLabelsObserver = new MutationObserver(syncExclusionLabels)
  exclusionLabelsObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['title', 'aria-label', 'disabled']
  })
})

onBeforeUnmount(() => {
  exclusionLabelsObserver?.disconnect()
  exclusionLabelsObserver = undefined
  store.clearStore()
})
</script>

<style scoped>
.ot-fallidas-ct {
  min-height: calc(100vh - 82px);
}

.ot-fallidas-ct :deep(.fm-accordion) {
  display: flex !important;
  flex-direction: column !important;
  gap: 10px !important;
}

.ot-fallidas-ct :deep(.p-accordionpanel) {
  margin: 0 !important;
  border: 1px solid #d6dde2 !important;
  border-radius: 0 !important;
  background: #fff !important;
  overflow: visible !important;
}

.ot-fallidas-ct :deep(.p-accordionpanel:first-child) {
  position: relative !important;
  z-index: 20 !important;
}

.ot-fallidas-ct :deep(.p-accordionpanel:last-child) {
  position: relative !important;
  z-index: 10 !important;
}

.ot-fallidas-ct :deep(.p-accordionheader) {
  min-height: 28px !important;
  height: 28px !important;
  padding: 5px 10px !important;
  border: 0 !important;
  border-bottom: 1px solid #dfe4e8 !important;
  border-radius: 0 !important;
  background: #f7f7f7 !important;
  color: #000 !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  line-height: 18px !important;
  box-shadow: none !important;
}

.ot-fallidas-ct :deep(.p-accordioncontent),
.ot-fallidas-ct :deep(.p-accordioncontent-content) {
  padding: 0 !important;
  border: 0 !important;
  background: #fff !important;
  overflow: visible !important;
}

.ot-fallidas-ct :deep(.otf-filters .fm-field label) {
  font-size: 12px !important;
}

.ot-fallidas-ct :deep(.otf-filters .p-inputtext),
.ot-fallidas-ct :deep(.otf-filters input),
.ot-fallidas-ct :deep(.otf-filters .p-select-label),
.ot-fallidas-ct :deep(.otf-filters .ct-date-button) {
  font-size: 13px !important;
}

.ot-fallidas-ct :deep(.ct-calendar-title),
.ot-fallidas-ct :deep(.ct-year-select .fm-compact-select__trigger),
.ot-fallidas-ct :deep(.ct-year-select .fm-compact-select__option),
.ot-fallidas-ct :deep(.ct-days button),
.ot-fallidas-ct :deep(.ct-calendar-actions button) {
  font-size: 12px !important;
}

.ot-fallidas-ct :deep(.ct-weekdays) {
  font-size: 11px !important;
}

.ot-fallidas-ct :deep(#tabla .p-datatable-thead > tr > th) {
  font-size: 12px !important;
}

.ot-fallidas-ct :deep(#tabla .p-datatable-tbody > tr > td) {
  font-size: 13px !important;
}

.ot-fallidas-ct :deep(#tabla .fm-column-filter),
.ot-fallidas-ct :deep(#tabla .fm-filter-prefix),
.ot-fallidas-ct :deep(#tabla .fm-filter-more) {
  font-size: 12px !important;
}

.ot-fallidas-ct :deep(.otf-custom-paginator),
.ot-fallidas-ct :deep(.otf-custom-paginator__navigation),
.ot-fallidas-ct :deep(.otf-page-label),
.ot-fallidas-ct :deep(.otf-page-total),
.ot-fallidas-ct :deep(.otf-page-input),
.ot-fallidas-ct :deep(.otf-rows-select),
.ot-fallidas-ct :deep(.otf-custom-paginator__counter) {
  font-size: 13px !important;
}

:global(.otf-filter-select-overlay .p-select-option),
:global(.otf-filter-select-overlay .p-select-option-label) {
  font-size: 12px !important;
}

:global(.otf-existing-notes) {
  width: 100%;
  min-width: 0;
}

:global(.otf-existing-notes__label) {
  display: block;
  margin: 0 0 4px;
  color: #202020;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.2;
}

:global(.otf-existing-notes__content) {
  width: min(620px, 100%);
  max-width: calc(100vw - 40px);
  max-height: 112px;
  padding: 8px 9px;
  overflow: auto;
  border: 1px solid #c8d8df;
  border-left: 3px solid #00a9bd;
  border-radius: 2px;
  background: #f5fbfc;
  color: #263746;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  box-sizing: border-box;
}

@media (max-width: 600px) {
  :global(.otf-existing-notes__content) {
    width: 100%;
    max-width: 100%;
  }
}
</style>
