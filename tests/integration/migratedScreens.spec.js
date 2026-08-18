import { flushPromises, shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  emulacionStore: {
    toggleLoader: true,
  },
  reporteStore: {
    loading: false,
    error: null,
    fetchRows: vi.fn(() => Promise.resolve()),
    clearStore: vi.fn(),
  },
  fallidasStore: {
    gridResetVersion: 0,
    rows: [],
    selectedRows: [],
    clearStore: vi.fn(),
  },
}))

vi.mock('@/modules/emulacion/store/emulacionStore.js', () => ({
  default: () => mocks.emulacionStore,
}))

vi.mock('@/modules/reporteSas/store/reporteSasStore', () => ({
  useReporteSasStore: () => mocks.reporteStore,
}))

vi.mock('@/modules/otFallidasCT/store/CtFallidaStore', () => ({
  useFallidasCtStore: () => mocks.fallidasStore,
}))

const exportMocks = vi.hoisted(() => ({
  exportToExcel: vi.fn(),
  parseDataFromTable: vi.fn(),
}))

vi.mock('@/composables/useExportExcel', () => ({
  useExcelExport: () => exportMocks,
}))

import Emulacion from '@/modules/emulacion/views/Emulacion.vue'
import ReporteSAS from '@/modules/reporteSas/ReporteSAS.vue'
import OtFallidasCT from '@/modules/otFallidasCT/OtFallidasCT.vue'

const primeStubs = {
  Accordion: { template: '<div class="p-accordion"><slot /></div>' },
  AccordionPanel: { template: '<section class="p-accordionpanel"><slot /></section>' },
  AccordionHeader: {
    template: '<header class="p-accordionheader"><slot class="p-accordionheader" /></header>',
  },
  AccordionContent: { template: '<div class="p-accordioncontent"><slot /></div>' },
}

const TablaStub = {
  name: 'TablaStub',
  props: ['exportToExcel', 'parseDataFromTable'],
  template: '<div class="tabla-sas-stub" />',
}

const reportStubs = {
  ...primeStubs,
  Tabla: TablaStub,
  FmGridShell: {
    name: 'FmGridShellStub',
    props: ['loading', 'loadingTitle', 'loadingMessage'],
    template: '<div class="fm-grid-shell-stub" :data-loading="String(loading)"><slot /></div>',
  },
}

const mountOtFallidas = (tableTemplate = '<div class="tabla-otf-stub" />') => shallowMount(OtFallidasCT, {
  attachTo: document.body,
  global: {
    stubs: {
      ...primeStubs,
      Filtros: { template: '<div class="filtros-otf-stub" />' },
      Table: { template: tableTemplate },
    },
  },
})

afterEach(() => {
  document.body.innerHTML = ''
  mocks.emulacionStore.toggleLoader = true
  mocks.reporteStore.loading = false
  mocks.reporteStore.error = null
  mocks.reporteStore.fetchRows.mockReset().mockResolvedValue(undefined)
  mocks.reporteStore.clearStore.mockReset()
  mocks.fallidasStore.gridResetVersion = 0
  mocks.fallidasStore.rows = []
  mocks.fallidasStore.selectedRows = []
  mocks.fallidasStore.clearStore.mockReset()
  exportMocks.exportToExcel.mockReset()
  exportMocks.parseDataFromTable.mockReset()
})

describe('Pantallas Vue migradas - integración funcional', () => {
  it('Emulación conserva su clase raíz, el filtro bloqueado y el loader compartido', () => {
    const wrapper = shallowMount(Emulacion, {
      global: {
        stubs: {
          ...primeStubs,
          CajonFiltros: { template: '<div class="cajon-filtros-stub" />' },
          ConfirmarEmulacionDialog: { template: '<div class="confirmar-emulacion-stub" />' },
          FmTypingLoader: { template: '<div class="fm-loader-stub">Cargando Información - Preparando Grilla</div>' },
        },
      },
    })

    expect(wrapper.classes()).toContain('emulation-page')
    expect(wrapper.text()).toContain('FILTROS DE BÚSQUEDA')
    expect(wrapper.find('.emulation-accordion__locked-header').exists()).toBe(true)
    expect(wrapper.find('.fm-loader-stub').exists()).toBe(true)
  })

  it('Emulación oculta el loader cuando el store deja de estar cargando', () => {
    mocks.emulacionStore.toggleLoader = false

    const wrapper = shallowMount(Emulacion, {
      global: {
        stubs: {
          ...primeStubs,
          CajonFiltros: { template: '<div class="cajon-filtros-stub" />' },
          ConfirmarEmulacionDialog: { template: '<div class="confirmar-emulacion-stub" />' },
          FmTypingLoader: { template: '<div class="fm-loader-stub" />' },
        },
      },
    })

    expect(wrapper.find('.fm-loader-stub').exists()).toBe(false)
    expect(wrapper.find('.cajon-filtros-stub').exists()).toBe(true)
  })

  it('Emulación mantiene montado el diálogo de confirmación junto al formulario', () => {
    const wrapper = shallowMount(Emulacion, {
      global: {
        stubs: {
          ...primeStubs,
          CajonFiltros: { template: '<div class="cajon-filtros-stub" />' },
          ConfirmarEmulacionDialog: { template: '<div class="confirmar-emulacion-stub" />' },
          FmTypingLoader: { template: '<div class="fm-loader-stub" />' },
        },
      },
    })

    expect(wrapper.find('.cajon-filtros-stub').exists()).toBe(true)
    expect(wrapper.find('.confirmar-emulacion-stub').exists()).toBe(true)
  })

  it('Reporte SAS solicita datos al montar y libera el store al desmontar', async () => {
    const wrapper = shallowMount(ReporteSAS, {
      global: { stubs: reportStubs },
    })
    await nextTick()

    expect(wrapper.classes()).toContain('report-sas-page')
    expect(wrapper.text()).toContain('REPORTE SAS')
    expect(mocks.reporteStore.fetchRows).toHaveBeenCalledOnce()

    wrapper.unmount()
    expect(mocks.reporteStore.clearStore).toHaveBeenCalledOnce()
  })

  it('Reporte SAS muestra el error del store sin reemplazar la estructura de la grilla', () => {
    mocks.reporteStore.error = 'No se pudo cargar el reporte'

    const wrapper = shallowMount(ReporteSAS, {
      global: { stubs: reportStubs },
    })

    expect(wrapper.get('[role="alert"]').text()).toContain('No se pudo cargar el reporte')
    expect(wrapper.find('.fm-grid-shell-stub').exists()).toBe(true)
    wrapper.unmount()
  })

  it('Reporte SAS propaga el estado loading al shell de grilla', () => {
    mocks.reporteStore.loading = true

    const wrapper = shallowMount(ReporteSAS, {
      global: { stubs: reportStubs },
    })

    expect(wrapper.get('.fm-grid-shell-stub').attributes('data-loading')).toBe('true')
    wrapper.unmount()
  })

  it('Reporte SAS entrega a Tabla las funciones reales de exportación y parseo', () => {
    const wrapper = shallowMount(ReporteSAS, {
      global: { stubs: reportStubs },
    })

    const tabla = wrapper.getComponent({ name: 'TablaStub' })
    expect(tabla.props('exportToExcel')).toBe(exportMocks.exportToExcel)
    expect(tabla.props('parseDataFromTable')).toBe(exportMocks.parseDataFromTable)
    wrapper.unmount()
  })

  it('Reporte SAS absorbe un rechazo de fetchRows y conserva montada la pantalla', async () => {
    mocks.reporteStore.fetchRows.mockRejectedValueOnce(new Error('backend no disponible'))

    const wrapper = shallowMount(ReporteSAS, {
      global: { stubs: reportStubs },
    })
    await flushPromises()

    expect(wrapper.classes()).toContain('report-sas-page')
    expect(wrapper.find('.fm-grid-shell-stub').exists()).toBe(true)
    wrapper.unmount()
  })

  it('OTs Fallidas CT conserva ambos paneles y limpia su store al salir', () => {
    const wrapper = mountOtFallidas()

    expect(wrapper.classes()).toContain('ot-fallidas-ct')
    expect(wrapper.classes()).toContain('ot-fallidas-ct--grid-expanded')
    expect(wrapper.text()).toContain('FILTROS DE BÚSQUEDA')
    expect(wrapper.text()).toContain('OTS FALLIDAS REPROCESO')

    wrapper.unmount()
    expect(mocks.fallidasStore.clearStore).toHaveBeenCalledOnce()
  })

  it('OTs Fallidas CT fuerza 500 filas como tamaño inicial cuando existe el selector', async () => {
    const wrapper = mountOtFallidas(`
      <div class="otf-grid-shell">
        <select class="otf-rows-select">
          <option value="100">100</option>
          <option value="500">500</option>
        </select>
      </div>
    `)

    await nextTick()
    const select = document.querySelector('.otf-rows-select')
    expect(select.value).toBe('500')
    expect(select.dataset.defaultRowsApplied).toBe('true')
    wrapper.unmount()
  })

  it('OTs Fallidas CT corrige title y aria-label del botón excluir', async () => {
    const wrapper = mountOtFallidas(`
      <div class="otf-grid-shell">
        <div class="fm-grid-actions-final">
          <button type="button"><i class="pi pi-trash"></i></button>
        </div>
      </div>
    `)

    await nextTick()
    const button = document.querySelector('.fm-grid-actions-final button')
    expect(button.getAttribute('title')).toBe('Excluir OTs')
    expect(button.getAttribute('aria-label')).toBe('Excluir OTs')
    wrapper.unmount()
  })

  it('OTs Fallidas CT oculta la acción incluir cuando está deshabilitada', async () => {
    const wrapper = mountOtFallidas('<button class="otf-row-action--include" disabled>Incluir</button>')

    await nextTick()
    const button = document.querySelector('.otf-row-action--include')
    expect(button.style.display).toBe('none')
    wrapper.unmount()
  })

  it('OTs Fallidas CT mantiene visible la acción incluir cuando está habilitada', async () => {
    const wrapper = mountOtFallidas('<button class="otf-row-action--include">Incluir</button>')

    await nextTick()
    const button = document.querySelector('.otf-row-action--include')
    expect(button.style.display).toBe('')
    wrapper.unmount()
  })

  it('OTs Fallidas CT muestra la nota existente de una OT seleccionada', async () => {
    mocks.fallidasStore.rows = [{ id: 9, nroOrdenTrabajo: 'OT-9', nota: '<b>Nota previa</b>' }]
    mocks.fallidasStore.selectedRows = [9]

    const wrapper = mountOtFallidas(`
      <div class="otf-exclude-content">
        <div class="otf-nota-field"></div>
      </div>
    `)

    await nextTick()
    const notes = document.querySelector('.otf-existing-notes')
    expect(notes).not.toBeNull()
    expect(notes.textContent).toContain('Nota existente')
    expect(notes.textContent).toContain('Nota previa')
    expect(notes.textContent).not.toContain('<b>')
    wrapper.unmount()
  })

  it('OTs Fallidas CT concatena las notas existentes de varias OTs seleccionadas', async () => {
    mocks.fallidasStore.rows = [
      { id: 1, nroOrdenTrabajo: '1001', nota: 'Primera' },
      { id: 2, nroOrdenTrabajo: '1002', nota: 'Segunda' },
    ]
    mocks.fallidasStore.selectedRows = [1, 2]

    const wrapper = mountOtFallidas('<div class="otf-exclude-content"><div class="otf-nota-field"></div></div>')
    await nextTick()

    const notes = document.querySelector('.otf-existing-notes__content')
    expect(notes.textContent).toContain('OT 1001: Primera')
    expect(notes.textContent).toContain('OT 1002: Segunda')
    wrapper.unmount()
  })

  it('OTs Fallidas CT no crea bloque de notas si las seleccionadas no tienen nota', async () => {
    mocks.fallidasStore.rows = [{ id: 1, nroOrdenTrabajo: '1001', nota: '   ' }]
    mocks.fallidasStore.selectedRows = [1]

    const wrapper = mountOtFallidas('<div class="otf-exclude-content"><div class="otf-nota-field"></div></div>')
    await nextTick()

    expect(document.querySelector('.otf-existing-notes')).toBeNull()
    wrapper.unmount()
  })

  it('OTs Fallidas CT actualiza dinámicamente la etiqueta del diálogo de exclusión', async () => {
    const wrapper = mountOtFallidas('<div class="otf-exclude-header"><span>Texto viejo</span></div>')
    await nextTick()

    const title = document.querySelector('.otf-exclude-header > span:first-child')
    expect(title.textContent).toBe('Excluir Orden de Trabajo')
    wrapper.unmount()
  })
})
