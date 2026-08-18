import { shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

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

vi.mock('@/composables/useExportExcel', () => ({
  useExcelExport: () => ({
    exportToExcel: vi.fn(),
    parseDataFromTable: vi.fn(),
  }),
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

describe('Pantallas Vue migradas - integración mínima', () => {
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

  it('Reporte SAS solicita datos al montar y libera el store al desmontar', async () => {
    mocks.reporteStore.fetchRows.mockClear()
    mocks.reporteStore.clearStore.mockClear()
    mocks.reporteStore.error = null

    const wrapper = shallowMount(ReporteSAS, {
      global: {
        stubs: {
          ...primeStubs,
          Tabla: { template: '<div class="tabla-sas-stub" />' },
          FmGridShell: { template: '<div class="fm-grid-shell-stub"><slot /></div>' },
        },
      },
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
      global: {
        stubs: {
          ...primeStubs,
          Tabla: { template: '<div class="tabla-sas-stub" />' },
          FmGridShell: { template: '<div class="fm-grid-shell-stub"><slot /></div>' },
        },
      },
    })

    expect(wrapper.get('[role="alert"]').text()).toContain('No se pudo cargar el reporte')
    expect(wrapper.find('.fm-grid-shell-stub').exists()).toBe(true)
    wrapper.unmount()
    mocks.reporteStore.error = null
  })

  it('OTs Fallidas CT conserva ambos paneles y limpia su store al salir', () => {
    mocks.fallidasStore.clearStore.mockClear()

    const wrapper = shallowMount(OtFallidasCT, {
      global: {
        stubs: {
          ...primeStubs,
          Filtros: { template: '<div class="filtros-otf-stub" />' },
          Table: { template: '<div class="tabla-otf-stub" />' },
        },
      },
    })

    expect(wrapper.classes()).toContain('ot-fallidas-ct')
    expect(wrapper.classes()).toContain('ot-fallidas-ct--grid-expanded')
    expect(wrapper.text()).toContain('FILTROS DE BÚSQUEDA')
    expect(wrapper.text()).toContain('OTS FALLIDAS REPROCESO')

    wrapper.unmount()
    expect(mocks.fallidasStore.clearStore).toHaveBeenCalledOnce()
  })
})
