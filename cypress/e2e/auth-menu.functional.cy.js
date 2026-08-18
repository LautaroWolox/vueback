describe('Field Manager - autenticación y menú', () => {
  beforeEach(() => {
    cy.viewport(1440, 900)
  })

  it('autentica desde el callback y entra al home', () => {
    cy.loginAsTestUser()
    cy.get('.main-home').should('be.visible')
  })

  it('mantiene al usuario en login cuando el backend no autentica', () => {
    cy.intercept('GET', '**/pc/userData.html', {
      statusCode: 200,
      body: { autenticado: false, rutas: [] },
    }).as('userDataDenied')

    cy.visit('/UI/login2fa.html?loginCallback=true')
    cy.wait('@userDataDenied')
    cy.get('.login-page').should('be.visible')
    cy.get('.login-submit-button').should('contain.text', 'CONECTAR')
  })

  it('muestra las cinco categorías raíz vigentes', () => {
    cy.loginAsTestUser()

    const expected = [
      'Administración',
      'Gestión de Materiales',
      'GDA Operaciones DDD',
      'Reportes',
      'Certificación Contratista',
    ]

    cy.get('.p-menubar-root-list > .p-menubar-item > .p-menubar-item-content > .fm-menu-link > .fm-menu-label')
      .then(($labels) => {
        const labels = [...$labels].map((el) => el.textContent.trim())
        expect(labels).to.deep.equal(expected)
      })
  })

  it('no vuelve a mostrar Ordenes Trabajo ni el Monitoreo retirado como categorías raíz', () => {
    cy.loginAsTestUser()

    cy.get('.p-menubar-root-list > .p-menubar-item > .p-menubar-item-content > .fm-menu-link > .fm-menu-label')
      .then(($labels) => {
        const labels = [...$labels].map((el) => el.textContent.trim())
        expect(labels).not.to.include('Ordenes Trabajo')
        expect(labels).not.to.include('Órdenes Trabajo')
        expect(labels).not.to.include('Monitoreo')
      })
  })

  it('muestra nombre y apellido del usuario autenticado', () => {
    cy.loginAsTestUser({ nombre: 'Juan', apellido: 'Pérez', legajo: 'Z12345' })
    cy.get('.fm-user-v3-label').should('contain.text', 'Juan Pérez')
    cy.get('.fm-user-v3-avatar--initials').should('contain.text', 'JP')
  })

  it('abre el detalle de usuario y muestra legajo y nombre completo', () => {
    cy.loginAsTestUser({ nombre: 'Juan', apellido: 'Pérez', legajo: 'Z12345' })
    cy.get('.fm-user-v3-trigger').click()

    cy.get('#fm-user-menu-v3').should('be.visible')
    cy.get('.fm-user-v3-legajo-copy').should('contain.text', 'Z12345')
    cy.get('.fm-user-v3-person-copy').should('contain.text', 'Juan Pérez')
  })

  it('cierra el menú de usuario al hacer click fuera', () => {
    cy.loginAsTestUser()
    cy.get('.fm-user-v3-trigger').click()
    cy.get('#fm-user-menu-v3').should('be.visible')
    cy.get('.main-home').click('topLeft', { force: true })
    cy.get('#fm-user-menu-v3').should('not.exist')
  })

  it('cierra el menú de usuario con Escape', () => {
    cy.loginAsTestUser()
    cy.get('.fm-user-v3-trigger').click()
    cy.get('#fm-user-menu-v3').should('be.visible')
    cy.get('body').type('{esc}')
    cy.get('#fm-user-menu-v3').should('not.exist')
  })

  it('cierra sesión y vuelve al acceso', () => {
    cy.loginAsTestUser()
    cy.get('.fm-user-v3-trigger').click()
    cy.get('.fm-user-v3-logout').click()
    cy.location('pathname').should('match', /\/UI\/login2fa\.html$/)
    cy.get('.login-page').should('be.visible')
  })

  it('redirige a 401 si se intenta abrir una pantalla protegida sin sesión', () => {
    cy.visit('/UI/FM/emulacion.html')
    cy.location('pathname').should('match', /\/UI\/401\.html$/)
  })
})
