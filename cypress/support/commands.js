const defaultRoutes = [
  'ABMV', 'GEOP', 'ESLO', 'ABMP', 'CESL', 'EMUL',
  'GEMA', 'VARE', 'ERGS', 'GEOT', 'ERGE', 'REFA', 'MADE',
  'GDAO', 'QRTZ', 'REPO', 'EXDA',
  'CECO', 'BUOT', 'GERE', 'CORE', 'MORE', 'PUMA',
  'GEAC', 'COAC', 'COSA', 'NODE', 'NOCR',
  'PARA', 'JOCO', 'JOCM', 'ROTF'
]

Cypress.Commands.add('loginAsTestUser', (overrides = {}) => {
  const profile = {
    autenticado: true,
    rutas: defaultRoutes,
    nombre: 'Lautaro',
    apellido: 'Prueba',
    legajo: 'ZTEST01',
    email: 'lautaro.prueba@example.test',
    ...overrides,
  }

  cy.intercept('GET', '**/pc/userData.html', {
    statusCode: 200,
    body: profile,
  }).as('userData')

  cy.visit('/UI/login2fa.html?loginCallback=true')
  cy.wait('@userData')
  cy.location('pathname').should('match', /\/UI\/FM\/?$/)
  cy.get('.main-menu').should('be.visible')
})

Cypress.Commands.add('visitProtected', (path, options = {}) => {
  cy.loginAsTestUser(options.profile)
  cy.visit(`/UI/FM/${path}`)
  cy.location('pathname').should('include', `/UI/FM/${path}`)
})

Cypress.Commands.add('mockLegacyPage', (path, body = '<!doctype html><html><head></head><body><main data-cy="legacy-page">Legacy OK</main></body></html>') => {
  cy.intercept('GET', `**/pc/${path}`, {
    statusCode: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
    body,
  }).as(`legacy-${path.replace(/[^a-z0-9]/gi, '-')}`)
})
