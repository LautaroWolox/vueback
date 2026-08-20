import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'

vi.mock('@/composables/useExportExcel', () => ({
  useExcelExport: () => ({
    exportToExcel: vi.fn(),
  }),
}))

vi.mock('@/components/shared/FmButton.vue', () => ({
  default: {
    name: 'FmButton',
    props: ['label'],
    emits: ['click'],
    template: '<button type="button" data-test="fm-button" @click="$emit(\'click\')">{{ label }}</button>',
  },
}))

vi.mock('@/components/shared/FmGridShell.vue', () => ({
  default: {
    name: 'FmGridShell',
    props: ['loading', 'loadingTitle', 'loadingMessage'],
    template: '<section data-test="grid-shell" :data-loading="String(loading)"><span v-if="loading">Cargando Información - Preparando Grilla</span><slot /></section>',
  },
}))

vi.mock('@/components/shared/FmAlertDialog.vue', () => ({
  default: {
    name: 'FmAlertDialog',
    template: '<div data-test="alert-dialog" />',
  },
}))

vi.mock('@/modules/gestionMateriales/abmMateriales/components/TablaMateriales.vue', () => ({
  default: {
    name: 'TablaMateriales',
    template: '<div data-test="tabla-materiales" />',
  },
}))

vi.mock('@/modules/gestionMateriales/abmMateriales/components/EditarMaterialDialog.vue', () => ({
  default: {
    name: 'EditarMaterialDialog',
    template: '<div data-test="editar-material" />',
  },
}))

vi.mock('@/modules/gestionMateriales/abmMateriales/components/AltaMaterialDialog.vue', () => ({
  default: {
    name: 'AltaMaterialDialog',
    template: '<div data-test="alta-material" />',
  },
}))

import AbmMateriales from '@/modules/gestionMateriales/abmMateriales/AbmMateriales.vue'
import { useAbmMaterialesStore } from '@/modules/gestionMateriales/abmMateriales/store/abmMaterialesStore.js'

const mountScreen = () => mount(AbmMateriales, {
  global: {
    components: {
      Accordion,
      AccordionPanel,
      AccordionHeader,
      AccordionContent,
    },
  },
})

describe('ABM Materiales - integración de pantalla', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('entra con filtros abiertos, resultados cerrados y sin expandir la grilla', () => {
    const wrapper = mountScreen()
    const headers = wrapper.findAll('.p-accordionheader')

    expect(wrapper.text()).toContain('FILTROS DE BÚSQUEDA')
    expect(wrapper.text()).toContain('MATERIALES')
    expect(wrapper.get('[data-test="fm-button"]').text()).toBe('BUSCAR')
    expect(headers).toHaveLength(2)
    expect(headers[0].attributes('aria-expanded')).toBe('true')
    expect(headers[1].attributes('aria-expanded')).toBe('false')
    expect(wrapper.classes()).not.toContain('abm-materiales-page--grid-expanded')
  })

  it('al buscar cierra filtros, abre resultados, expande la grilla y activa el spinner compartido', async () => {
    const wrapper = mountScreen()
    const store = useAbmMaterialesStore()

    await wrapper.get('[data-test="fm-button"]').trigger('click')
    await wrapper.vm.$nextTick()

    const headers = wrapper.findAll('.p-accordionheader')
    expect(headers[0].attributes('aria-expanded')).toBe('false')
    expect(headers[1].attributes('aria-expanded')).toBe('true')
    expect(wrapper.classes()).toContain('abm-materiales-page--grid-expanded')
    expect(wrapper.get('[data-test="grid-shell"]').attributes('data-loading')).toBe('true')
    expect(wrapper.text()).toContain('Cargando Información - Preparando Grilla')

    await vi.runAllTimersAsync()
    await wrapper.vm.$nextTick()

    expect(store.materiales).toHaveLength(5)
    expect(wrapper.get('[data-test="grid-shell"]').attributes('data-loading')).toBe('false')
  })

  it('permite volver a abrir los filtros manualmente sin cerrar el acordeón de resultados', async () => {
    const wrapper = mountScreen()

    await wrapper.get('[data-test="fm-button"]').trigger('click')
    await wrapper.vm.$nextTick()

    let headers = wrapper.findAll('.p-accordionheader')
    expect(headers[0].attributes('aria-expanded')).toBe('false')
    expect(headers[1].attributes('aria-expanded')).toBe('true')

    await headers[0].trigger('click')
    await wrapper.vm.$nextTick()

    headers = wrapper.findAll('.p-accordionheader')
    expect(headers[0].attributes('aria-expanded')).toBe('true')
    expect(headers[1].attributes('aria-expanded')).toBe('true')
    expect(wrapper.classes()).toContain('abm-materiales-page--grid-expanded')
  })
})
