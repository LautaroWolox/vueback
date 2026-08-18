import { beforeEach, describe, expect, it, vi } from 'vitest'

const loadPlugin = async () => {
  vi.resetModules()
  return import('@/plugins/gridPaginatorDefaults')
}

describe('gridPaginatorDefaults', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('normaliza el contador al último registro visible', async () => {
    document.body.innerHTML = '<span class="fm-custom-paginator__counter">Mostrando 1 - 50 de 320</span>'
    const { installGridPaginatorDefaults } = await loadPlugin()

    installGridPaginatorDefaults()

    expect(document.querySelector('.fm-custom-paginator__counter').textContent).toBe('Mostrando 50 de 320')
  })

  it('selecciona una sola vez la cantidad máxima de filas y dispara change', async () => {
    document.body.innerHTML = `
      <div class="fm-grid-shell">
        <select class="fm-rows-select" aria-label="Filas por página">
          <option value="100" selected>100</option>
          <option value="250">250</option>
          <option value="500">500</option>
        </select>
      </div>
    `
    const select = document.querySelector('.fm-rows-select')
    const onChange = vi.fn()
    select.addEventListener('change', onChange)
    const { installGridPaginatorDefaults } = await loadPlugin()

    installGridPaginatorDefaults()

    expect(select.value).toBe('500')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(select.closest('.fm-grid-shell').getAttribute('data-fm-max-rows-initialized')).toBe('true')
  })

  it('procesa paginadores agregados dinámicamente', async () => {
    const { installGridPaginatorDefaults } = await loadPlugin()
    installGridPaginatorDefaults()

    const counter = document.createElement('span')
    counter.className = 'p-paginator-current'
    counter.textContent = 'Mostrando 51 a 100 de 220'
    document.body.appendChild(counter)

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(counter.textContent).toBe('Mostrando 100 de 220')
  })
})
