import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

describe('ABM Materiales - integración de pantalla', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('muestra filtros al entrar y mantiene resultados cerrados hasta buscar', () => {
    const wrapper = mount(AbmMateriales)

    expect(wrapper.text()).toContain('FILTROS DE BÚSQUEDA')
    expect(wrapper.text()).toContain('MATERIALES')
    expect(wrapper.get('[data-test="fm-button"]').text()).toBe('BUSCAR')
    expect(wrapper.get('.abm-materiales-panel--filters').find('.abm-materiales-panel__body').isVisible()).toBe(true)
    expect(wrapper.get('.abm-materiales-results-body').isVisible()).toBe(false)
  })

  it('al buscar abre resultados, activa el spinner compartido y carga materiales', async () => {
    const wrapper = mount(AbmMateriales)
    const store = useAbmMaterialesStore()

    await wrapper.get('[data-test="fm-button"]').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.get('.abm-materiales-results-body').isVisible()).toBe(true)
    expect(wrapper.get('[data-test="grid-shell"]').attributes('data-loading')).toBe('true')
    expect(wrapper.text()).toContain('Cargando Información - Preparando Grilla')

    await vi.runAllTimersAsync()
    await wrapper.vm.$nextTick()

    expect(store.materiales).toHaveLength(5)
    expect(wrapper.get('[data-test="grid-shell"]').attributes('data-loading')).toBe('false')
  })

  it('permite contraer y volver a abrir los filtros sin perder la pantalla de resultados', async () => {
    const wrapper = mount(AbmMateriales)
    const headers = wrapper.findAll('.abm-materiales-panel__header')

    await headers[0].trigger('click')
    expect(wrapper.get('.abm-materiales-panel--filters').find('.abm-materiales-panel__body').isVisible()).toBe(false)

    await headers[1].trigger('click')
    expect(wrapper.get('.abm-materiales-results-body').isVisible()).toBe(true)
  })
})
