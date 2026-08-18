import { mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  logout: vi.fn(),
  auth: null as any,
}))

vi.mock('@/router', () => ({
  default: {
    push: mocks.push,
  },
}))

vi.mock('@/store/auth', () => ({
  useAuthStore: () => mocks.auth,
}))

import CustomMenu from '@/components/CustomMenu.vue'

const MenubarStub = {
  props: ['model'],
  template: '<nav class="menubar-stub"><slot name="end" /></nav>',
}

const ButtonStub = {
  inheritAttrs: false,
  props: ['label', 'icon'],
  emits: ['click'],
  template: `
    <button type="button" v-bind="$attrs" @click="$emit('click', $event)">
      <slot />
      <span v-if="label">{{ label }}</span>
    </button>
  `,
}

const mountMenu = () => mount(CustomMenu, {
  global: {
    stubs: {
      Menubar: MenubarStub,
      Button: ButtonStub,
    },
  },
})

describe('CustomMenu - identidad y cierre de sesión', () => {
  beforeEach(() => {
    mocks.push.mockReset()
    mocks.logout.mockReset()
    mocks.auth = reactive({
      autenticado: true,
      rutas: ['ABMV', 'EMUL'],
      nombre: 'Ana',
      apellido: 'Pérez',
      legajo: 'A100',
      usuario: {
        nombre: 'Ana',
        apellido: 'Pérez',
        legajo: 'A100',
        email: 'ana.perez@example.com',
      },
      logout: mocks.logout,
    })
  })

  it('muestra nombre y apellido en el trigger y genera iniciales humanas', () => {
    const wrapper = mountMenu()

    expect(wrapper.get('.fm-user-v3-label').text()).toBe('Ana Pérez')
    expect(wrapper.get('.fm-user-v3-avatar--initials').text()).toBe('AP')
    expect(wrapper.get('.fm-user-v3-trigger').classes()).toContain('fm-user-v3-trigger--named')
  })

  it('abre el panel y conserva separados legajo y Nombre y Apellido', async () => {
    const wrapper = mountMenu()

    await wrapper.get('.fm-user-v3-trigger').trigger('click')

    const dropdown = wrapper.get('#fm-user-menu-v3')
    expect(dropdown.text()).toContain('Legajo')
    expect(dropdown.text()).toContain('A100')
    expect(dropdown.text()).toContain('Nombre y Apellido')
    expect(dropdown.text()).toContain('Ana Pérez')
  })

  it('cierra el panel con Escape', async () => {
    const wrapper = mountMenu()
    await wrapper.get('.fm-user-v3-trigger').trigger('click')
    expect(wrapper.find('#fm-user-menu-v3').exists()).toBe(true)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('#fm-user-menu-v3').exists()).toBe(false)
  })

  it('al cerrar sesión limpia el store y vuelve al login', async () => {
    const wrapper = mountMenu()
    await wrapper.get('.fm-user-v3-trigger').trigger('click')

    const logoutButton = wrapper.findAll('button').find((button) => button.text().includes('Cerrar sesión'))
    expect(logoutButton).toBeTruthy()
    await logoutButton!.trigger('click')

    expect(mocks.logout).toHaveBeenCalledOnce()
    expect(mocks.push).toHaveBeenCalledOnce()
    expect(mocks.push).toHaveBeenCalledWith({ name: 'login2fa' })
    expect(wrapper.find('#fm-user-menu-v3').exists()).toBe(false)
  })

  it('usa el legajo como fallback cuando no existe identidad personal completa', () => {
    mocks.auth.nombre = 'A100'
    mocks.auth.apellido = ''
    mocks.auth.usuario = {
      nombre: 'A100',
      apellido: '',
      legajo: 'A100',
      email: '',
    }

    const wrapper = mountMenu()

    expect(wrapper.get('.fm-user-v3-label').text()).toBe('A100')
    expect(wrapper.find('.fm-user-v3-avatar--initials').exists()).toBe(false)
  })
})
