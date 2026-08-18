const reporteUrl = '**/pc/extraccionDatosGM/searchMatDescargados.html'

const mockReporte = (body, options = {}) => {
  cy.intercept('GET', reporteUrl, {
    statusCode: options.statusCode ?? 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body,
    delay: options.delay,
  }).as('reporteSas')
}

const abrirReporte = () => {
  cy.loginAsTestUser()
  cy.visit('/UI/FM/extraccionDatosGM.html')
  cy.get('.report-sas-page').should('be.visible')
}

const row = (overrides = {}) => ({
  id: 1,
  nroOT: 'AA00070643',
  estadoOT: 'CERRADA',
  gestionada: 'SI',
  codTarea: 'TAREA-01',
  localidad: 'LA PLATA',
  codPostal: '1900',
  legajoOperadorDescarga: 'Z001',
  nomApeOperadorDescarga: 'OPERADOR DESCARGA',
  fechaDescarga: '18/08/2026',
  legajoCierreOT: 'Z002',
  nomApeCierreOT: 'OPERADOR CIERRE',
  legajoNOLDAP: 'Z003,Z004,Z005',
  fechaCierreOT: '18/08/2026',
  centro: 'C001',
  almacen: 'A001',
  serialCodMaterial: 'SERIAL-001',
  codMaterial: 'MAT-100',
  descMaterial: 'MODEM TEST',
  cantidadMaterial: 2,
  tipoDescarga: 'AUTOMATICA',
  mensajeSAP: 'OK',
  fechaNotificacionSAP: '18/08/2026',
  ...overrides,
})

describe('Reporte SAS - flujo funcional completo', () => {
  beforeEach(() => {
    cy.viewport(1440, 900)
  })

  it('carga automáticamente el reporte al ingresar', () => {
    mockReporte([row()])
    abrirReporte()
    cy.wait('@reporteSas').its('response.statusCode').should('eq', 200)
    cy.get('#tabla-reporte-sas .p-datatable-tbody')
      .should('contain.text', 'AA00070643')
      .and('contain.text', 'MODEM TEST')
  })

  it('mantiene loader visible mientras el backend responde', () => {
    mockReporte([row()], { delay: 700 })
    abrirReporte()
    cy.get('[role="status"]').should('be.visible').and('contain.text', 'Cargando Información')
    cy.wait('@reporteSas')
    cy.get('[role="status"]').should('not.exist')
  })

  it('acepta payload envuelto en data', () => {
    mockReporte({ data: [row({ nroOT: 'OT-DATA' })] })
    abrirReporte()
    cy.wait('@reporteSas')
    cy.get('#tabla-reporte-sas .p-datatable-tbody').should('contain.text', 'OT-DATA')
  })

  it('acepta payload envuelto en rows', () => {
    mockReporte({ rows: [row({ nroOT: 'OT-ROWS' })] })
    abrirReporte()
    cy.wait('@reporteSas')
    cy.get('#tabla-reporte-sas .p-datatable-tbody').should('contain.text', 'OT-ROWS')
  })

  it('normaliza alias históricos del backend', () => {
    mockReporte([{
      materialDescargadoId: 9,
      nroOt: 'OT-ALIAS',
      estado: 'ABIERTA',
      codigoTarea: 'TAREA-ALIAS',
      codigoPostal: '1901',
      legajoDescarga: 'ZD01',
      nombreOperadorDescarga: 'OPERADOR ALIAS',
      legajoCierreOt: 'ZC01',
      nombreOperadorCierreOt: 'CIERRE ALIAS',
      legajosNOLDAP: ['ZN1', 'ZN2', 'ZN3'],
      almacen: 'DEP01',
      numeroSerie: 'SER-ALIAS',
      codigoMaterial: 'MAT-ALIAS',
      descripcionMaterial: 'MATERIAL ALIAS',
      cantidad: 7,
      mensajeSap: 'OK ALIAS',
    }])

    abrirReporte()
    cy.wait('@reporteSas')
    cy.get('#tabla-reporte-sas .p-datatable-tbody')
      .should('contain.text', 'OT-ALIAS')
      .and('contain.text', 'TAREA-ALIAS')
      .and('contain.text', 'MAT-ALIAS')
      .and('contain.text', 'MATERIAL ALIAS')
  })

  it('normaliza y previsualiza legajos NOLDAP', () => {
    mockReporte([row({ legajoNOLDAP: ' Z001, Z002 , Z003 , Z004 ' })])
    abrirReporte()
    cy.wait('@reporteSas')
    cy.get('.reporte-sas-legajo-preview').should('contain.text', 'Z001, Z002 (+2 más)')
  })

  it('expande y contrae legajos NOLDAP', () => {
    mockReporte([row({ legajoNOLDAP: 'Z001,Z002,Z003,Z004' })])
    abrirReporte()
    cy.wait('@reporteSas')

    cy.get('.reporte-sas-legajo-preview')
      .click()
      .should('contain.text', 'Z001, Z002, Z003, Z004')
      .click()
      .should('contain.text', 'Z001, Z002 (+2 más)')
  })

  it('muestra estado vacío cuando no hay registros', () => {
    mockReporte([])
    abrirReporte()
    cy.wait('@reporteSas')
    cy.contains('No hay resultados').should('be.visible')
    cy.get('.fm-custom-paginator__counter').should('contain.text', 'No hay resultados')
  })

  it('muestra error HTTP y mantiene la pantalla estable', () => {
    mockReporte({ error: 'fallo controlado' }, { statusCode: 500 })
    abrirReporte()
    cy.wait('@reporteSas')
    cy.get('.report-sas-error')
      .should('be.visible')
      .and('contain.text', 'No se pudo cargar Reporte SAS (500)')
    cy.get('.report-sas-page').should('be.visible')
  })

  it('filtra por Nro OT desde la fila de filtros', () => {
    mockReporte([
      row({ id: 1, nroOT: 'OT-UNO' }),
      row({ id: 2, nroOT: 'OT-DOS' }),
    ])
    abrirReporte()
    cy.wait('@reporteSas')

    cy.get('.reporte-sas-filter-input').eq(0).type('OT-DOS')
    cy.get('#tabla-reporte-sas .p-datatable-tbody')
      .should('contain.text', 'OT-DOS')
      .and('not.contain.text', 'OT-UNO')
  })

  it('limpia un filtro de columna y recupera resultados', () => {
    mockReporte([
      row({ id: 1, nroOT: 'OT-UNO' }),
      row({ id: 2, nroOT: 'OT-DOS' }),
    ])
    abrirReporte()
    cy.wait('@reporteSas')

    cy.get('.reporte-sas-filter-input').eq(0).type('OT-DOS')
    cy.get('#tabla-reporte-sas .p-datatable-tbody').should('not.contain.text', 'OT-UNO')
    cy.get('.reporte-sas-filter-clear').eq(0).click()
    cy.get('#tabla-reporte-sas .p-datatable-tbody')
      .should('contain.text', 'OT-UNO')
      .and('contain.text', 'OT-DOS')
  })

  it('permite cambiar cantidad de filas y navegar entre páginas', () => {
    const rows = Array.from({ length: 101 }, (_, index) => row({
      id: index + 1,
      nroOT: `OT-${String(index + 1).padStart(3, '0')}`,
    }))

    mockReporte(rows)
    abrirReporte()
    cy.wait('@reporteSas')

    cy.get('.fm-rows-select').select('100')
    cy.get('.fm-page-total').should('contain.text', 'de 2')
    cy.get('button[aria-label="Página siguiente"]').click()
    cy.get('.fm-page-input').should('have.value', '2')
    cy.get('#tabla-reporte-sas .p-datatable-tbody').should('contain.text', 'OT-101')
  })

  it('normaliza el número de página fuera de rango', () => {
    const rows = Array.from({ length: 101 }, (_, index) => row({
      id: index + 1,
      nroOT: `OT-${String(index + 1).padStart(3, '0')}`,
    }))

    mockReporte(rows)
    abrirReporte()
    cy.wait('@reporteSas')

    cy.get('.fm-rows-select').select('100')
    cy.get('.fm-page-input').clear().type('99').blur()
    cy.get('.fm-page-input').should('have.value', '2')
  })

  it('mantiene disponibles las 22 columnas contractuales', () => {
    mockReporte([row()])
    abrirReporte()
    cy.wait('@reporteSas')
    cy.get('#tabla-reporte-sas .p-datatable-thead > tr').first().find('th').should('have.length', 22)
  })

  it('mantiene acción de descarga disponible cuando hay datos', () => {
    mockReporte([row()])
    abrirReporte()
    cy.wait('@reporteSas')
    cy.get('button[aria-label="Descargar reporte"]').should('be.visible').and('not.be.disabled')
  })

  it('se mantiene usable en viewport pequeño', () => {
    cy.viewport(390, 844)
    mockReporte([row()])
    abrirReporte()
    cy.wait('@reporteSas')
    cy.get('.report-sas-page').should('be.visible')
    cy.get('#tabla-reporte-sas').should('exist')
    cy.get('.fm-custom-paginator').should('exist')
    cy.get('.fm-custom-paginator__navigation').should('exist')
  })
})
