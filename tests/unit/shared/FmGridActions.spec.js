import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FmGridActions from '@/components/shared/FmGridActions.vue'

const ButtonStub = {
  props: ['disabled', 'title', 'ariaLabel', 'icon'],
  emits: ['click'],
  template: `
    <button
      type="button"
      class="button-stub"
      :disabled="disabled"
      :title="title"
      :aria-label="ariaLabel"
      @click="$emit('click')"
    >{{ icon }}</button>
  `,
}

const mountActions = (props = {}) => mount(FmGridActions, {
  props,
  global: {
    stubs: {
      Button: ButtonStub,
    },
  },
})

describe('FmGridActions', () => {
  it('muestra solamente las acciones habilitadas por configuración', () => {
    const wrapper = mountActions({
      showExport: true,
      showDelete: false,
      showEdit: true,
      showRefresh: false,
      showAdd: true,
    })

    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(3)
    expect(buttons.map((button) => button.attributes('title'))).toEqual([
      'Exportar',
      'Editar',
      'Agregar',
    ])
  })

  it('emite una única acción por click', async () => {
    const wrapper = mountActions({
      showExport: true,
      showDelete: true,
      showEdit: true,
      showRefresh: true,
      showAdd: true,
    })

    const buttons = wrapper.findAll('button')
    for (const button of buttons) await button.trigger('click')

    expect(wrapper.emitted('export')).toHaveLength(1)
    expect(wrapper.emitted('delete')).toHaveLength(1)
    expect(wrapper.emitted('edit')).toHaveLength(1)
    expect(wrapper.emitted('refresh')).toHaveLength(1)
    expect(wrapper.emitted('add')).toHaveLength(1)
  })

  it('no emite acciones deshabilitadas y expone un mensaje accesible', async () => {
    const wrapper = mountActions({
      exportDisabled: true,
      deleteDisabled: true,
      refreshDisabled: true,
      exportDisabledTitle: 'Sin exportación',
      deleteDisabledTitle: 'Seleccione una fila',
      refreshDisabledTitle: 'Seleccione una fila',
    })

    const [exportButton, deleteButton, refreshButton] = wrapper.findAll('button')
    expect(exportButton.attributes()).toHaveProperty('disabled')
    expect(deleteButton.attributes()).toHaveProperty('disabled')
    expect(refreshButton.attributes()).toHaveProperty('disabled')
    expect(exportButton.attributes('aria-label')).toBe('Sin exportación')
    expect(deleteButton.attributes('aria-label')).toBe('Seleccione una fila')

    await exportButton.trigger('click')
    await deleteButton.trigger('click')
    await refreshButton.trigger('click')

    expect(wrapper.emitted('export')).toBeUndefined()
    expect(wrapper.emitted('delete')).toBeUndefined()
    expect(wrapper.emitted('refresh')).toBeUndefined()
  })

  it('activa el tamaño grande sin alterar las acciones disponibles', () => {
    const wrapper = mountActions({ size: 'large' })

    expect(wrapper.classes()).toContain('fm-grid-actions-final--large')
    expect(wrapper.findAll('button')).toHaveLength(3)
  })
})
