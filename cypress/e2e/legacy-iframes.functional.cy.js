const cases = [
  { route: 'busquedaOtsGcc.html', legacyPath: 'busquedaOtsGcc.html', title: 'Búsqueda de OTs' },
  { route: 'jobtypeContrato.html', legacyPath: 'jobtypeContrato.html', title: 'Jobtype - Contrato' },
  { route: 'jobtypeCMO.html', legacyPath: 'jobtypeCMO.html', title: 'CMO - Actividad' },
  { route: 'consultarActas.html', legacyPath: 'consultarActas.html', title: 'consultarActas' },
  { route: 'consultarReglas.html', legacyPath: 'consultarReglas.html', title: 'Consultar Reglas' },
  { route: 'monitoreoEjecucionreglas.html', legacyPath: 'monitoreoEjecucionreglas.html', title: 'Monitoreo y Ejecución de Reglas' },
  { route: 'pruebasMasivas.html', legacyPath: 'pruebasMasivas.html', title: 'Regla Prueba Masiva' },
]

const assertIframeRoute = ({ route, legacyPath, title }) => {
  cy.intercept('GET', `**/pc/${legacyPath}`, {
    statusCode: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
    body: `<!doctype html><html><head><title>${title}</title></head><body><main>${title}</main></body></html>`,
  }).as('legacyPage')

  cy.loginAsTestUser()
  cy.visit(`/UI/FM/${route}`)
  cy.wait('@legacyPage').its('response.statusCode').should('eq', 200)

  cy.get('iframe.legacy-iframe')
    .should('have.attr', 'src', `/pc/${legacyPath}`)
    .and('have.attr', 'title', title)
}

describe('Field Manager - navegación legacy por iframe', () => {
  beforeEach(() => {
    cy.viewport(1440, 900)
  })

  cases.forEach((testCase) => {
    it(`mantiene ${testCase.route} dentro del iframe legacy correcto`, () => {
      assertIframeRoute(testCase)
    })
  })

  it('muestra el loader mientras una pantalla legacy todavía está cargando', () => {
    cy.intercept('GET', '**/pc/busquedaOtsGcc.html', (req) => {
      req.reply({
        delay: 800,
        statusCode: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' },
        body: '<!doctype html><html><body><main>Buscador legacy</main></body></html>',
      })
    }).as('buscadorLegacyLento')

    cy.loginAsTestUser()
    cy.visit('/UI/FM/busquedaOtsGcc.html')

    cy.get('[role="status"]')
      .should('be.visible')
      .and('contain.text', 'Cargando Información')

    cy.wait('@buscadorLegacyLento')
    cy.get('iframe.legacy-iframe').should('be.visible')
    cy.get('[role="status"]').should('not.exist')
  })

  it('mantiene BUOT en legacy y nunca renderiza un módulo Vue de Buscador OTs', () => {
    cy.mockLegacyPage('busquedaOtsGcc.html')
    cy.loginAsTestUser()
    cy.visit('/UI/FM/busquedaOtsGcc.html')

    cy.get('iframe.legacy-iframe').should('exist')
    cy.get('.busqueda-ots-page').should('not.exist')
  })

  it('mantiene Jobtype y CMO como pantallas legacy independientes', () => {
    cy.mockLegacyPage('jobtypeContrato.html', '<!doctype html><html><body><main>JOCO</main></body></html>')
    cy.mockLegacyPage('jobtypeCMO.html', '<!doctype html><html><body><main>JOCM</main></body></html>')
    cy.loginAsTestUser()

    cy.visit('/UI/FM/jobtypeContrato.html')
    cy.get('iframe.legacy-iframe').should('have.attr', 'src', '/pc/jobtypeContrato.html')

    cy.visit('/UI/FM/jobtypeCMO.html')
    cy.get('iframe.legacy-iframe').should('have.attr', 'src', '/pc/jobtypeCMO.html')
  })
})
