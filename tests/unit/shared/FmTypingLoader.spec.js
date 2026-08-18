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
  ])('aplica correctamente el modo visual %s', (props, expectedClass) => {
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

  it('mantiene aisladas las variantes sin cambiar el contenido del spinner', () => {
    const wrapper = mount(FmTypingLoader, {
      props: { variant: 'emulation' },
    })

    expect(wrapper.classes()).toContain('fm-loader--emulation')
    expect(wrapper.find('.fm-loader__title').text()).toBe('Cargando Información')
    expect(wrapper.find('.fm-loader__message').text()).toContain('Preparando Grilla')
  })
})
