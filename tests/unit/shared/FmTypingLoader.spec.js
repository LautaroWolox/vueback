import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FmTypingLoader from '@/components/shared/FmTypingLoader.vue'

describe('FmTypingLoader', () => {
  it('muestra siempre el texto estándar de Field Manager', () => {
    const wrapper = mount(FmTypingLoader, {
      props: {
        title: 'Texto contextual que no debe mostrarse',
        message: 'Otro mensaje',
      },
    })

    expect(wrapper.find('.fm-loader__title').text()).toBe('Cargando Información')
    expect(wrapper.find('.fm-loader__message').text()).toContain('Preparando Grilla')
    expect(wrapper.text()).not.toContain('Texto contextual que no debe mostrarse')
    expect(wrapper.text()).not.toContain('Otro mensaje')
  })

  it('expone un estado accesible coherente con los textos visibles', () => {
    const wrapper = mount(FmTypingLoader)
    const status = wrapper.get('[role="status"]')

    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.attributes('aria-label')).toBe('Cargando Información. Preparando Grilla')
  })

  it.each([
    [{ fullscreen: true }, 'fm-loader--fullscreen'],
    [{ overlay: true }, 'fm-loader--overlay'],
    [{ inline: true }, 'fm-loader--inline'],
  ])('aplica correctamente el modo visual solicitado', (props, expectedClass) => {
    const wrapper = mount(FmTypingLoader, { props })
    expect(wrapper.classes()).toContain(expectedClass)
  })

  it('usa modo inline cuando no se solicita fullscreen ni overlay', () => {
    const wrapper = mount(FmTypingLoader)
    expect(wrapper.classes()).toContain('fm-loader--inline')
  })

  it('mantiene el subtítulo estándar incluso si un consumidor intenta ocultarlo', () => {
    const wrapper = mount(FmTypingLoader, {
      props: { showMessage: false },
    })

    expect(wrapper.find('.fm-loader__message').exists()).toBe(true)
    expect(wrapper.find('.fm-loader__message').text()).toContain('Preparando Grilla')
  })

  it('una variante contextual no puede modificar el contenido estándar del spinner', () => {
    const base = mount(FmTypingLoader)
    const contextual = mount(FmTypingLoader, {
      props: {
        variant: 'emulation',
        title: 'Buscando operador',
        message: 'Consultando legajo',
      },
    })

    expect(contextual.find('.fm-loader__title').text()).toBe(base.find('.fm-loader__title').text())
    expect(contextual.find('.fm-loader__message').text()).toBe(base.find('.fm-loader__message').text())
    expect(contextual.text()).not.toContain('Buscando operador')
    expect(contextual.text()).not.toContain('Consultando legajo')
  })

  it('mantiene la estructura visual mínima del spinner', () => {
    const wrapper = mount(FmTypingLoader)

    expect(wrapper.find('.fm-loader__card').exists()).toBe(true)
    expect(wrapper.find('.fm-loader__spinner').exists()).toBe(true)
    expect(wrapper.find('.fm-loader__ring--outer').exists()).toBe(true)
    expect(wrapper.find('.fm-loader__ring--middle').exists()).toBe(true)
    expect(wrapper.find('.fm-loader__ring--inner').exists()).toBe(true)
    expect(wrapper.find('.fm-loader__core').exists()).toBe(true)
  })
})
