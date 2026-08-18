import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installMenuSubmenuBehavior } from '@/plugins/menuSubmenuBehavior'

let stop = null

const createIframe = () => {
  const iframe = document.createElement('iframe')
  document.body.appendChild(iframe)
  return iframe
}

const withJsdomCompatibleMouseEvent = (callback) => {
  const NativeMouseEvent = window.MouseEvent
  vi.stubGlobal('MouseEvent', function MouseEvent(type, init = {}) {
    return new NativeMouseEvent(type, { ...init, view: null })
  })

  try {
    callback()
  } finally {
    vi.unstubAllGlobals()
  }
}

describe('menuSubmenuBehavior', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.getElementById('fm-menu-video-runtime-v2')?.remove()
    stop = null
  })

  afterEach(() => {
    stop?.()
    stop = null
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
    document.getElementById('fm-menu-video-runtime-v2')?.remove()
  })

  it('inyecta el contrato visual aprobado del menú sin duplicar estilos', () => {
    stop = installMenuSubmenuBehavior()

    const style = document.getElementById('fm-menu-video-runtime-v2')
    expect(style).not.toBeNull()
    expect(style.textContent).toContain('#0fb8bb')
    expect(style.textContent).toContain('#0b9d9e')
    expect(style.textContent).toContain('left: calc(100% - 1px)')
    expect(document.querySelectorAll('#fm-menu-video-runtime-v2')).toHaveLength(1)
  })

  it('reenvía al documento padre el click ocurrido dentro de un iframe cuando el menú está abierto', () => {
    document.body.innerHTML = '<div class="main-menu"><div class="p-menubar-item-active"></div></div>'
    const iframe = createIframe()
    const parentClick = vi.fn()
    document.body.addEventListener('click', parentClick)

    stop = installMenuSubmenuBehavior()
    withJsdomCompatibleMouseEvent(() => {
      iframe.contentDocument.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    })

    expect(parentClick).toHaveBeenCalledTimes(1)
    document.body.removeEventListener('click', parentClick)
  })

  it('no genera clicks sintéticos si ningún menú está abierto', () => {
    const iframe = createIframe()
    const parentClick = vi.fn()
    document.body.addEventListener('click', parentClick)

    stop = installMenuSubmenuBehavior()
    withJsdomCompatibleMouseEvent(() => {
      iframe.contentDocument.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    })

    expect(parentClick).not.toHaveBeenCalled()
    document.body.removeEventListener('click', parentClick)
  })

  it('limpia el style y listeners al desmontar el comportamiento', () => {
    stop = installMenuSubmenuBehavior()
    expect(document.getElementById('fm-menu-video-runtime-v2')).not.toBeNull()

    stop()
    stop = null

    expect(document.getElementById('fm-menu-video-runtime-v2')).toBeNull()
  })
})
