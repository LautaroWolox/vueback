const buscarUrl = '**/pc/emulacion/buscar.html?legajo=*'
const cambiarUsuarioUrl = '**/pc/emulacion/cambiarUsuario.html?legajo=*'

const abrirEmulacion = () => {
  cy.loginAsTestUser()
  cy.visit('/UI/FM/emulacion.html')
  cy.get('.emulation-page').should('be.visible')
}

const buscarOperador = (body, legajo = '21SAD041') => {
  cy.intercept('GET', buscarUrl, {
    statusCode: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body,
  }).as('buscarOperador')

  cy.get('#legajo').clear().type(legajo)
  cy.contains('button', 'BUSCAR').click()
  cy.wait('@buscarOperador')
}

describe('Emulación - flujo funcional completo', () => {
  beforeEach(() => {
    cy.viewport(1440, 900)
    abrirEmulacion()
  })

  it('mantiene el panel de filtros visible y operativo', () => {
    cy.contains('FILTROS DE BÚSQUEDA').should('be.visible')
    cy.get('#legajo').should('be.visible').and('not.be.disabled')
    cy.contains('button', 'BUSCAR').should('be.enabled')
    cy.contains('button', 'LIMPIAR').should('be.enabled')
  })

  it('valida legajo obligatorio sin invocar backend', () => {
    let llamadas = 0
    cy.intercept('GET', buscarUrl, (req) => {
      llamadas += 1
      req.reply({ statusCode: 200, body: [] })
    })

    cy.contains('button', 'BUSCAR').click()
    cy.contains('Legajo requerido').should('be.visible')
    cy.contains('Ingrese un legajo').should('be.visible')
    cy.then(() => expect(llamadas).to.eq(0))
  })

  it('envía el legajo al endpoint de búsqueda y abre confirmación', () => {
    buscarOperador([{ legajo: '21SAD041', nombre: 'TECNICO', apellido: 'PRUEBA' }])

    cy.get('@buscarOperador').its('request.url').should('include', 'legajo=21SAD041')
    cy.get('.emulation-confirm-dialog').should('be.visible')
    cy.get('.emulation-operator-name').should('contain.text', 'TECNICO PRUEBA')
    cy.get('.emulation-operator-card').should('contain.text', '21SAD041')
  })

  it('acepta payload envuelto en data', () => {
    buscarOperador({
      data: [{ legajo: '11CP0217', nombre: 'SANCHEZ', apellido: 'CRISTIAN' }],
    }, '11CP0217')

    cy.get('.emulation-confirm-dialog').should('be.visible')
    cy.get('.emulation-operator-name').should('contain.text', 'SANCHEZ CRISTIAN')
  })

  it('acepta payload envuelto en resultados', () => {
    buscarOperador({
      resultados: [{ legajo: 'Z123', nombre: 'JUAN', apellido: 'PEREZ' }],
    }, 'Z123')

    cy.get('.emulation-confirm-dialog').should('be.visible')
    cy.get('.emulation-operator-name').should('contain.text', 'JUAN PEREZ')
  })

  it('muestra perfiles recibidos como arreglo', () => {
    buscarOperador([{
      legajo: '21SAD041',
      nombre: 'TECNICO',
      apellido: 'PRUEBA',
      perfiles: ['TECNICO CAMPO', 'SUPERVISOR'],
    }])

    cy.get('.emulation-profile-list')
      .should('contain.text', 'TECNICO CAMPO')
      .and('contain.text', 'SUPERVISOR')
  })

  it('normaliza perfiles recibidos como texto separado', () => {
    buscarOperador([{
      legajo: '21SAD041',
      nombre: 'TECNICO',
      apellido: 'PRUEBA',
      perfil: 'TECNICO CAMPO;SUPERVISOR',
    }])

    cy.get('.emulation-profile-list')
      .should('contain.text', 'TECNICO CAMPO')
      .and('contain.text', 'SUPERVISOR')
  })

  it('muestra estado sin perfil cuando backend no informa perfiles', () => {
    buscarOperador([{ legajo: '21SAD041', nombre: 'TECNICO', apellido: 'PRUEBA' }])
    cy.get('.emulation-profile-empty').should('contain.text', 'Sin perfil informado')
  })

  it('permite cancelar la confirmación y continuar en Emulación', () => {
    buscarOperador([{ legajo: '21SAD041', nombre: 'TECNICO', apellido: 'PRUEBA' }])
    cy.contains('.emulation-confirm-dialog button', 'CANCELAR').click()
    cy.get('.emulation-confirm-dialog').should('not.exist')
    cy.get('.emulation-page').should('be.visible')
    cy.get('#legajo').should('have.value', '21SAD041')
  })

  it('limpia legajo, datos y confirmación', () => {
    buscarOperador([{ legajo: '21SAD041', nombre: 'TECNICO', apellido: 'PRUEBA' }])
    cy.contains('.emulation-confirm-dialog button', 'CANCELAR').click()
    cy.contains('button', 'LIMPIAR').click()
    cy.get('#legajo').should('have.value', '')
    cy.get('.emulation-confirm-dialog').should('not.exist')
  })

  it('mantiene loader y deshabilita acciones durante búsqueda', () => {
    cy.intercept('GET', buscarUrl, (req) => {
      req.reply({
        delay: 700,
        statusCode: 200,
        body: [{ legajo: '21SAD041', nombre: 'TECNICO', apellido: 'PRUEBA' }],
      })
    }).as('buscarLento')

    cy.get('#legajo').type('21SAD041')
    cy.contains('button', 'BUSCAR').click()
    cy.get('[role="status"]').should('be.visible').and('contain.text', 'Cargando Información')
    cy.contains('button', 'BUSCAR').should('be.disabled')
    cy.contains('button', 'LIMPIAR').should('be.disabled')
    cy.wait('@buscarLento')
    cy.get('.emulation-confirm-dialog').should('be.visible')
  })

  it('informa cuando backend devuelve lista vacía', () => {
    buscarOperador([])
    cy.get('.emulation-confirm-dialog').should('not.exist')
    cy.contains('No se obtuvo información').should('be.visible')
    cy.contains('No se encontraron operadores').should('be.visible')
  })

  it('informa error HTTP de búsqueda sin romper la pantalla', () => {
    cy.intercept('GET', buscarUrl, {
      statusCode: 500,
      body: 'error controlado',
    }).as('buscarError')

    cy.get('#legajo').type('21SAD041')
    cy.contains('button', 'BUSCAR').click()
    cy.wait('@buscarError')
    cy.get('.emulation-page').should('be.visible')
    cy.get('.emulation-confirm-dialog').should('not.exist')
    cy.contains('No se obtuvo información').should('be.visible')
  })

  it('ejecuta cambio de usuario al aceptar la emulación', () => {
    buscarOperador([{ legajo: '21SAD041', nombre: 'TECNICO', apellido: 'PRUEBA' }])

    cy.intercept('GET', cambiarUsuarioUrl, {
      statusCode: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: {
        autenticado: true,
        legajo: '21SAD041',
        nombre: 'TECNICO',
        apellido: 'PRUEBA',
        rutas: ['EMUL', 'EXDA', 'ROTF', 'BUOT'],
      },
    }).as('cambiarUsuario')

    cy.contains('.emulation-confirm-dialog button', 'ACEPTAR').click()
    cy.wait('@cambiarUsuario').its('request.url').should('include', 'legajo=21SAD041')
  })

  it('muestra error si falla el cambio de usuario y permanece funcional', () => {
    buscarOperador([{ legajo: '21SAD041', nombre: 'TECNICO', apellido: 'PRUEBA' }])

    cy.intercept('GET', cambiarUsuarioUrl, {
      statusCode: 500,
      body: 'fallo emulación',
    }).as('cambiarUsuarioError')

    cy.contains('.emulation-confirm-dialog button', 'ACEPTAR').click()
    cy.wait('@cambiarUsuarioError')
    cy.contains('No se pudo emular').should('be.visible')
    cy.get('.emulation-page').should('be.visible')
  })

  it('mantiene el diálogo usable en viewport móvil', () => {
    cy.viewport(390, 844)
    buscarOperador([{
      legajo: '21SAD041',
      nombre: 'TECNICO',
      apellido: 'PRUEBA',
      perfiles: ['TECNICO CAMPO'],
    }])

    cy.get('.emulation-confirm-dialog').should('be.visible')
    cy.contains('.emulation-confirm-dialog button', 'CANCELAR').should('be.visible')
    cy.contains('.emulation-confirm-dialog button', 'ACEPTAR').should('be.visible')
  })
})
