describe('Field Manager - smoke de acceso', () => {
  it('renderiza la pantalla de acceso sin depender del backend', () => {
    cy.visit('/UI/')

    cy.get('.login-page').should('be.visible')
    cy.get('.login-title__field').should('have.text', 'Field')
    cy.get('.login-title__manager').should('have.text', 'Manager')
    cy.get('.login-submit-button')
      .should('be.visible')
      .and('contain.text', 'CONECTAR')
  })

  it('mantiene accesible el acceso en viewport móvil', () => {
    cy.viewport(390, 844)
    cy.visit('/UI/')

    cy.get('.login-page').should('be.visible')
    cy.get('.login-submit-button').should('be.visible')
    cy.get('.login-copyright').should('be.visible')
  })
})
