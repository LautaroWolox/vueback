const searchUrl = '**/pc/registroOTFallidasReproceso/searchFallidas.html'
const motivosUrl = '**/pc/detalleActa/getAllMotivos.html'
const contratistasUrl = '**/pc/registroOTFallidasReproceso/getContratistas.html'

const motivos = [
  { nombre: 'Motivo prueba', nombreCorto: 'MOTIVO_PRUEBA' },
  { nombre: 'Segundo motivo', nombreCorto: 'SEGUNDO' },
]

const row = (overrides = {}) => ({
  id: 101,
  nroOrdenTrabajo: 'AA00070643',
  fechaCierre: '18/08/2026',
  tareaCodigo: 'TAREA-01',
  direccion: 'CALLE 123',
  ciudad: 'LA PLATA',
  provincia: 'BUENOS AIRES',
  region: 'CENTRO',
  pais: 'ARGENTINA',
  contratista: 'CONTRATISTA TEST',
  tecnicoCierre: '21SAD041',
  actividades: 'ACT-01',
  sistemaOrigen: 'FM',
  errorDescripcion: 'ERROR DE PRUEBA',
  excluida: 'N',
  motivoExclusion: '',
  nota: '',
  tieneNota: 'N',
  ...overrides,
})

const baseIntercepts = () => {
  cy.intercept('GET', motivosUrl, {
    statusCode: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: motivos,
  }).as('motivos')

  cy.intercept('GET', contratistasUrl, {
    statusCode: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: [{ id: 1, nombre: 'CONTRATISTA TEST' }],
  }).as('contratistas')
}

const abrirPantalla = () => {
  baseIntercepts()
  cy.loginAsTestUser()
  cy.visit('/UI/FM/registroOTFallidasReproceso.html')
  cy.get('.ot-fallidas-ct').should('be.visible')
}

const buscar = (rows, ot = 'AA00070643', options = {}) => {
  cy.intercept('POST', searchUrl, {
    statusCode: options.statusCode ?? 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: rows,
    delay: options.delay,
  }).as('buscarFallidas')

  if (ot) cy.get('#ot').clear().type(ot)
  cy.contains('button', 'BUSCAR').click()
  cy.wait('@buscarFallidas')
}

const seleccionarPrimeraFila = () => {
  cy.get('#tabla .p-datatable-tbody > tr')
    .first()
    .find('input[type="checkbox"]')
    .first()
    .check({ force: true })

  cy.get('#tabla .p-datatable-tbody > tr')
    .first()
    .should('have.class', 'fm-selected-row')
}

describe('Registro OTs Fallidas Reproceso - flujo funcional completo', () => {
  beforeEach(() => {
    cy.viewport(1440, 900)
    abrirPantalla()
  })

  it('renderiza filtros, grilla y acciones principales', () => {
    cy.contains('FILTROS DE BÚSQUEDA').should('be.visible')
    cy.contains('OTS FALLIDAS REPROCESO').should('be.visible')
    cy.get('#ot').should('be.visible')
    cy.contains('button', 'BUSCAR').should('be.visible')
    cy.contains('button', 'LIMPIAR').should('be.visible')
    cy.get('#tabla').should('exist')
  })

  it('envía Nro OT al backend mediante POST y muestra resultado', () => {
    buscar([row()])
    cy.get('@buscarFallidas').its('request.body').should('deep.include', { nroOT: 'AA00070643' })
    cy.get('#tabla .p-datatable-tbody')
      .should('contain.text', 'AA00070643')
      .and('contain.text', 'ERROR DE PRUEBA')
  })

  it('deshabilita filtros avanzados cuando se informa Nro OT', () => {
    cy.get('#ot').type('AA00070643')
    cy.get('.otf-filter-element--nro-ot input').should('not.be.disabled')
    cy.get('.otf-filter-grid .otf-filter-element--disabled').should('have.length.greaterThan', 0)
  })

  it('mantiene loader y botones deshabilitados durante la consulta', () => {
    cy.intercept('POST', searchUrl, (req) => {
      req.reply({ delay: 700, statusCode: 200, body: [row()] })
    }).as('buscarLento')

    cy.get('#ot').type('AA00070643')
    cy.contains('button', 'BUSCAR').click()
    cy.get('[role="status"]').should('be.visible').and('contain.text', 'Cargando Información')
    cy.contains('button', 'BUSCAR').should('be.disabled')
    cy.contains('button', 'LIMPIAR').should('be.disabled')
    cy.wait('@buscarLento')
    cy.get('#tabla .p-datatable-tbody').should('contain.text', 'AA00070643')
  })

  it('muestra estado vacío cuando no existen OTs', () => {
    buscar([])
    cy.contains('No hay resultados').should('be.visible')
    cy.get('.otf-custom-paginator__counter').should('contain.text', 'Mostrando 0 de 0')
  })

  it('limpia filtros, resultados y selección', () => {
    buscar([row()])
    seleccionarPrimeraFila()
    cy.contains('button', 'LIMPIAR').click()
    cy.get('#ot').should('have.value', '')
    cy.get('#tabla .p-datatable-tbody').should('not.contain.text', 'AA00070643')
    cy.get('button[aria-label="Excluir OTs"]').should('be.disabled')
  })

  it('usa 500 filas por página como valor predeterminado', () => {
    cy.get('.otf-rows-select').should('have.value', '500')
  })

  it('habilita excluir y reprocesar al seleccionar una OT válida', () => {
    buscar([row()])
    seleccionarPrimeraFila()
    cy.get('button[aria-label="Excluir OTs"]').should('not.be.disabled')
    cy.get('button[aria-label="Reprocesar"]').should('not.be.disabled')
  })

  it('no permite seleccionar una OT ya excluida y ofrece acción incluir', () => {
    buscar([row({ excluida: 'S', motivoExclusion: 'MOTIVO ANTERIOR' })])
    cy.get('#tabla .p-datatable-tbody > tr').first().should('have.class', 'fm-disabled-row')
    cy.get('.otf-row-action--include').should('exist').and('not.be.disabled')
    cy.get('button[aria-label="Excluir OTs"]').should('be.disabled')
  })

  it('abre y cierra el detalle de una nota existente', () => {
    buscar([row({ nota: 'Nota funcional de prueba', tieneNota: 'S' })])
    cy.get('.otf-row-action--note').click()
    cy.get('.otf-note-dialog').should('be.visible').and('contain.text', 'Nota funcional de prueba')
    cy.contains('.otf-note-dialog button', 'CERRAR').click()
    cy.get('.otf-note-dialog').should('not.exist')
  })

  it('normaliza como sin nota los valores vacíos del backend', () => {
    buscar([row({ nota: 'sin nota', tieneNota: 'S' })])
    cy.get('.otf-row-action--note').should('not.exist')
  })

  it('filtra resultados desde la fila de filtros de la grilla', () => {
    buscar([
      row({ id: 101, nroOrdenTrabajo: 'OT-UNO', errorDescripcion: 'ERROR UNO' }),
      row({ id: 102, nroOrdenTrabajo: 'OT-DOS', errorDescripcion: 'ERROR DOS' }),
    ])

    cy.get('#tabla .fm-column-filter').eq(0).type('OT-DOS')
    cy.get('#tabla .p-datatable-tbody')
      .should('contain.text', 'OT-DOS')
      .and('not.contain.text', 'OT-UNO')
  })

  it('limpia un filtro de grilla y recupera las filas', () => {
    buscar([
      row({ id: 101, nroOrdenTrabajo: 'OT-UNO' }),
      row({ id: 102, nroOrdenTrabajo: 'OT-DOS' }),
    ])

    cy.get('#tabla .fm-column-filter').eq(0).type('OT-DOS')
    cy.get('#tabla .fm-icon-button[aria-label="Limpiar filtro"]').eq(0).click()
    cy.get('#tabla .p-datatable-tbody')
      .should('contain.text', 'OT-UNO')
      .and('contain.text', 'OT-DOS')
  })

  it('abre exclusión, exige motivo y envía payload correcto', () => {
    buscar([row({ nota: 'Nota previa', tieneNota: 'S' })])
    seleccionarPrimeraFila()

    cy.get('button[aria-label="Excluir OTs"]').click()
    cy.get('.otf-exclude-dialog').should('be.visible')
    cy.get('.otf-exclude-dialog .otf-existing-notes__content').should('contain.text', 'Nota previa')
    cy.get('.otf-exclude-accept').should('be.disabled')

    cy.get('.otf-motivo-select .fm-compact-select__trigger').click()
    cy.contains('.otf-motivo-select .fm-compact-select__option', 'Motivo prueba').click()
    cy.get('#comentario-exclusion').type('Comentario exclusión')
    cy.get('.otf-exclude-accept').should('not.be.disabled')

    cy.intercept('POST', '**/pc/registroOTFallidasReproceso/excluirOTFallida.html', {
      statusCode: 200,
      body: { status: true, respuesta: 'OK' },
    }).as('excluirOt')
    cy.intercept('POST', searchUrl, { statusCode: 200, body: [] }).as('refrescarTrasExcluir')

    cy.get('.otf-exclude-accept').click()
    cy.wait('@excluirOt').then(({ request }) => {
      expect(request.body).to.deep.equal({
        idOts: ['101'],
        nota: 'Comentario exclusión',
        motivoNombreCorto: 'MOTIVO_PRUEBA',
      })
    })
    cy.wait('@refrescarTrasExcluir')
  })

  it('permite cancelar exclusión sin enviar cambios', () => {
    buscar([row()])
    seleccionarPrimeraFila()
    let llamadas = 0
    cy.intercept('POST', '**/pc/registroOTFallidasReproceso/excluirOTFallida.html', (req) => {
      llamadas += 1
      req.reply({ statusCode: 200, body: { status: true } })
    })

    cy.get('button[aria-label="Excluir OTs"]').click()
    cy.get('.otf-exclude-dialog').should('be.visible')
    cy.get('.otf-exclude-cancel').click()
    cy.get('.otf-exclude-dialog').should('not.exist')
    cy.then(() => expect(llamadas).to.eq(0))
  })

  it('incluye una OT excluida y envía motivo, nota y número de OT', () => {
    buscar([row({ excluida: 'S', nota: 'Nota exclusión previa', tieneNota: 'S' })])
    cy.get('.otf-row-action--include').click({ force: true })
    cy.get('.otf-include-dialog').should('be.visible')
    cy.get('.otf-include-dialog .otf-existing-notes__content').should('contain.text', 'Nota exclusión previa')

    cy.get('.otf-include-motivo-select .fm-compact-select__trigger').click()
    cy.contains('.otf-include-motivo-select .fm-compact-select__option', 'Motivo prueba').click()
    cy.get('#nota-inclusion').type('Comentario inclusión')

    cy.intercept('POST', '**/pc/registroOTFallidasReproceso/incluirOTFallidaExcluida.html', {
      statusCode: 200,
      body: { status: true, respuesta: 'OK' },
    }).as('incluirOt')
    cy.intercept('POST', searchUrl, {
      statusCode: 200,
      body: [row({ excluida: 'N', nota: 'Comentario inclusión', tieneNota: 'S' })],
    }).as('refrescarTrasIncluir')

    cy.get('.otf-include-accept').click()
    cy.wait('@incluirOt').then(({ request }) => {
      expect(request.body).to.deep.equal({
        nroOts: ['AA00070643'],
        nota: 'Comentario inclusión',
        motivoNombreCorto: 'MOTIVO_PRUEBA',
      })
    })
    cy.wait('@refrescarTrasIncluir')
    cy.get('#tabla .p-datatable-tbody > tr').first().should('have.class', 'fm-enabled-row')
  })

  it('reprocesa la OT seleccionada y confirma cantidad', () => {
    buscar([row()])
    seleccionarPrimeraFila()

    cy.intercept('POST', '**/pc/registroOTFallidasReproceso/reprocesar.html', {
      statusCode: 200,
      body: { status: true },
    }).as('reprocesar')

    cy.get('button[aria-label="Reprocesar"]').click()
    cy.wait('@reprocesar').its('request.body').should('deep.equal', [101])
    cy.get('.otf-reprocess-dialog').should('be.visible').and('contain.text', 'Se enviaron a reprocesar (1) OT')
    cy.contains('.otf-reprocess-dialog button', 'CERRAR').click()
    cy.get('#tabla .p-datatable-tbody > tr').first().should('have.class', 'fm-reprocessed-row')
  })

  it('muestra error de reproceso cuando backend falla', () => {
    buscar([row()])
    seleccionarPrimeraFila()

    cy.intercept('POST', '**/pc/registroOTFallidasReproceso/reprocesar.html', {
      statusCode: 500,
      body: 'fallo reproceso',
    }).as('reprocesarError')

    cy.get('button[aria-label="Reprocesar"]').click()
    cy.wait('@reprocesarError')
    cy.get('.otf-reprocess-dialog')
      .should('be.visible')
      .and('contain.text', 'No se pudo completar el reproceso')
  })

  it('permite cambiar cantidad de filas por página', () => {
    const rows = Array.from({ length: 101 }, (_, index) => row({
      id: index + 1,
      nroOrdenTrabajo: `OT-${String(index + 1).padStart(3, '0')}`,
    }))
    buscar(rows)

    cy.get('.otf-rows-select').select('100')
    cy.get('.otf-page-total').should('contain.text', 'de 2')
    cy.get('button[aria-label="Página siguiente"]').click()
    cy.get('.otf-page-input').should('have.value', '2')
    cy.get('#tabla .p-datatable-tbody').should('contain.text', 'OT-101')
  })

  it('normaliza página fuera de rango', () => {
    const rows = Array.from({ length: 101 }, (_, index) => row({
      id: index + 1,
      nroOrdenTrabajo: `OT-${String(index + 1).padStart(3, '0')}`,
    }))
    buscar(rows)

    cy.get('.otf-rows-select').select('100')
    cy.get('.otf-page-input').clear().type('99').blur()
    cy.get('.otf-page-input').should('have.value', '2')
  })

  it('mantiene la pantalla operativa en viewport móvil', () => {
    cy.viewport(390, 844)
    buscar([row()])
    cy.get('.ot-fallidas-ct').should('be.visible')
    cy.get('#tabla').should('exist')
    cy.get('.otf-custom-paginator').should('exist')
  })
})
