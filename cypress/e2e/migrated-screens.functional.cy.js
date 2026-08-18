describe('Field Manager - pantallas Vue migradas', () => {
  beforeEach(() => {
    cy.viewport(1440, 900)
  })

  describe('Emulación', () => {
    beforeEach(() => {
      cy.loginAsTestUser()
      cy.visit('/UI/FM/emulacion.html')
      cy.get('.emulation-page').should('be.visible')
    })

    it('renderiza filtro, legajo y acciones principales', () => {
      cy.contains('FILTROS DE BÚSQUEDA').should('be.visible')
      cy.get('#legajo').should('be.visible').and('not.be.disabled')
      cy.contains('button', 'BUSCAR').should('be.visible')
      cy.contains('button', 'LIMPIAR').should('be.visible')
    })

    it('permite escribir y limpiar el legajo', () => {
      cy.get('#legajo').type('21SAD041').should('have.value', '21SAD041')
      cy.contains('button', 'LIMPIAR').click()
      cy.get('#legajo').should('have.value', '')
    })

    it('muestra confirmación con los datos devueltos por backend', () => {
      cy.intercept('GET', '**/pc/emulacion/buscar.html?legajo=21SAD041', {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: [{
          legajo: '21SAD041',
          nombre: 'TECNICO',
          apellido: 'PRUEBA',
          perfiles: ['TECNICO CAMPO', 'SUPERVISOR'],
        }],
      }).as('buscarOperador')

      cy.get('#legajo').type('21SAD041')
      cy.contains('button', 'BUSCAR').click()
      cy.wait('@buscarOperador')

      cy.get('.emulation-confirm-dialog').should('be.visible')
      cy.get('.emulation-operator-name').should('contain.text', 'TECNICO PRUEBA')
      cy.get('.emulation-operator-card').should('contain.text', '21SAD041')
      cy.get('.emulation-profile-list').should('contain.text', 'TECNICO CAMPO')
    })

    it('cancela la confirmación sin abandonar Emulación', () => {
      cy.intercept('GET', '**/pc/emulacion/buscar.html?legajo=21SAD041', {
        statusCode: 200,
        body: [{ legajo: '21SAD041', nombre: 'TECNICO', apellido: 'PRUEBA' }],
      })

      cy.get('#legajo').type('21SAD041')
      cy.contains('button', 'BUSCAR').click()
      cy.get('.emulation-confirm-dialog').should('be.visible')
      cy.contains('.emulation-confirm-dialog button', 'CANCELAR').click()
      cy.get('.emulation-confirm-dialog').should('not.exist')
      cy.get('.emulation-page').should('be.visible')
    })

    it('mantiene visible el loader mientras la búsqueda está pendiente', () => {
      cy.intercept('GET', '**/pc/emulacion/buscar.html?legajo=21SAD041', (req) => {
        req.reply({
          delay: 700,
          statusCode: 200,
          body: [{ legajo: '21SAD041', nombre: 'TECNICO', apellido: 'PRUEBA' }],
        })
      }).as('buscarLento')

      cy.get('#legajo').type('21SAD041')
      cy.contains('button', 'BUSCAR').click()
      cy.get('[role="status"]').should('be.visible').and('contain.text', 'Cargando Información')
      cy.wait('@buscarLento')
      cy.get('.emulation-confirm-dialog').should('be.visible')
    })
  })

  describe('Reporte SAS', () => {
    it('carga filas del backend y las incorpora a la grilla', () => {
      cy.intercept('GET', '**/pc/extraccionDatosGM/searchMatDescargados.html', {
        statusCode: 200,
        body: [{
          id: 1,
          nroOT: 'AA00070643',
          estadoOT: 'CERRADA',
          codTarea: 'TAREA-01',
          localidad: 'LA PLATA',
          codMaterial: 'MAT-100',
          descMaterial: 'MODEM TEST',
          cantidadMaterial: 2,
          legajoNOLDAP: 'Z001,Z002,Z003',
        }],
      }).as('reporteSas')

      cy.loginAsTestUser()
      cy.visit('/UI/FM/extraccionDatosGM.html')
      cy.wait('@reporteSas')

      cy.get('.report-sas-page').should('be.visible')
      cy.get('#tabla-reporte-sas').should('exist')
      cy.get('#tabla-reporte-sas .p-datatable-tbody')
        .should('contain.text', 'AA00070643')
        .and('contain.text', 'MODEM TEST')
    })

    it('muestra estado vacío cuando el backend no devuelve filas', () => {
      cy.intercept('GET', '**/pc/extraccionDatosGM/searchMatDescargados.html', {
        statusCode: 200,
        body: [],
      })

      cy.loginAsTestUser()
      cy.visit('/UI/FM/extraccionDatosGM.html')
      cy.contains('No hay resultados').should('be.visible')
    })

    it('muestra un error visible cuando falla el backend', () => {
      cy.intercept('GET', '**/pc/extraccionDatosGM/searchMatDescargados.html', {
        statusCode: 500,
        body: { error: 'fallo controlado' },
      })

      cy.loginAsTestUser()
      cy.visit('/UI/FM/extraccionDatosGM.html')
      cy.get('.report-sas-error').should('be.visible').and('contain.text', '500')
    })

    it('expande y contrae la lista de legajos NOLDAP', () => {
      cy.intercept('GET', '**/pc/extraccionDatosGM/searchMatDescargados.html', {
        statusCode: 200,
        body: [{ id: 7, nroOT: 'OT-LEGAJOS', legajoNOLDAP: 'Z001,Z002,Z003,Z004' }],
      })

      cy.loginAsTestUser()
      cy.visit('/UI/FM/extraccionDatosGM.html')

      cy.get('.reporte-sas-legajo-preview')
        .should('contain.text', 'Z001, Z002 (+2 más)')
        .click()
        .should('contain.text', 'Z001, Z002, Z003, Z004')
        .click()
        .should('contain.text', 'Z001, Z002 (+2 más)')
    })
  })

  describe('Registro OTs Fallidas Reproceso', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/pc/registroOTFallidasReproceso/getContratistas.html', {
        statusCode: 200,
        body: [],
      })
      cy.intercept('GET', '**/pc/detalleActa/getAllMotivos.html', {
        statusCode: 200,
        body: [],
      })

      cy.loginAsTestUser()
      cy.visit('/UI/FM/registroOTFallidasReproceso.html')
      cy.get('.ot-fallidas-ct').should('be.visible')
    })

    it('renderiza filtros y grilla principal', () => {
      cy.contains('FILTROS DE BÚSQUEDA').should('be.visible')
      cy.contains('OTS FALLIDAS REPROCESO').should('be.visible')
      cy.get('#ot').should('exist')
      cy.contains('button', 'BUSCAR').should('be.visible')
      cy.contains('button', 'LIMPIAR').should('be.visible')
    })

    it('deshabilita filtros avanzados cuando se completa Nro. OT', () => {
      cy.get('#ot').type('AA00070643')
      cy.get('.otf-filter-element--nro-ot input').should('not.be.disabled')
      cy.get('.otf-filter-grid input, .otf-filter-grid button, .otf-filter-grid .p-select')
        .filter(':disabled')
        .should('have.length.greaterThan', 0)
    })

    it('consulta el backend y muestra la OT y su error', () => {
      cy.intercept('POST', '**/pc/registroOTFallidasReproceso/searchFallidas.html', {
        statusCode: 200,
        body: [{
          id: 101,
          nroOrdenTrabajo: 'AA00070643',
          errorDescripcion: 'ERROR DE PRUEBA',
          excluida: 'N',
          nota: '',
          tieneNota: 'N',
        }],
      }).as('buscarFallidas')

      cy.get('#ot').type('AA00070643')
      cy.contains('button', 'BUSCAR').click()
      cy.wait('@buscarFallidas')
      cy.get('#tabla .p-datatable-tbody')
        .should('contain.text', 'AA00070643')
        .and('contain.text', 'ERROR DE PRUEBA')
    })

    it('limpia filtros y resultados', () => {
      cy.intercept('POST', '**/pc/registroOTFallidasReproceso/searchFallidas.html', {
        statusCode: 200,
        body: [{ id: 101, nroOrdenTrabajo: 'AA00070643', excluida: 'N', nota: '', tieneNota: 'N' }],
      })

      cy.get('#ot').type('AA00070643')
      cy.contains('button', 'BUSCAR').click()
      cy.contains('AA00070643').should('exist')
      cy.contains('button', 'LIMPIAR').click()
      cy.get('#ot').should('have.value', '')
      cy.contains('AA00070643').should('not.exist')
    })
  })
})
