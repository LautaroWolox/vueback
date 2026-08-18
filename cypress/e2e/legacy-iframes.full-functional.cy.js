const legacyRoutes = [
  ['gestionOperadores.html', 'gestionOperadores.html', 'Gestion de operadores'],
  ['gestionEstructuraLogica.html', 'gestionEstructuraLogica.html', 'Gestion de estructuras logisricas'],
  ['administracionPerfiles.html', 'administracionPerfiles.html', 'Administración de perfiles'],
  ['consultaEstructuraLogica.html', 'consultaEstructuraLogica.html', 'Consulta de EstructuraLogica'],
  ['gestionMaterialesOt.html', 'gestionMaterialesOt.html', 'Gestionar Materiales en OTs'],
  ['gestionErrores.html', 'gestionErrores.html', 'Errores de Gestión'],
  ['registroOTFallidas.html', 'registroOTFallidas.html', 'Registro de OTs Fallidas'],
  ['materialesDescargados.html', 'materialesDescargados.html', 'Materiales Descargados'],
  ['gestionErroresSucursal.html', 'gestionErroresSucursal.html', 'Errores de Gestión Sucursal'],
  ['validarOtRed.html', 'validarOtRed.html', 'Validación OT de Redes'],
  ['configuracionQrtz.html', 'configuracionQrtz.html', 'Configuración de Qrtz'],
  ['jobtypeContrato.html', 'jobtypeContrato.html', 'Jobtype - Contrato'],
  ['jobtypeCMO.html', 'jobtypeCMO.html', 'CMO - Actividad'],
  ['consultarActas.html', 'consultarActas.html', 'consultarActas'],
  ['ordenTrabajoSinActa.html', 'consultarOtSinACTA.html', 'consultar ots sin acta'],
  ['consultarNotaDebito.html', 'consultarNotaDebito.html', 'consultar notas debito'],
  ['consultarNotaCredito.html', 'consultarNotaCredito.html', 'consultar notas credito'],
  ['consultarReglas.html', 'consultarReglas.html', 'Consultar Reglas'],
  ['monitoreoEjecucionreglas.html', 'monitoreoEjecucionreglas.html', 'Monitoreo y Ejecución de Reglas'],
  ['pruebasMasivas.html', 'pruebasMasivas.html', 'Regla Prueba Masiva'],
  ['busquedaOtsGcc.html', 'busquedaOtsGcc.html', 'Búsqueda de OTs'],
]

const mockHtml = (label = 'Legacy OK') => `<!doctype html>
<html>
<head><meta charset="utf-8"><title>${label}</title></head>
<body>
  <main data-cy="legacy-page">
    <h1>${label}</h1>
    <label>Dato <input id="legacy-input" value=""></label>
    <button id="legacy-button" type="button" onclick="document.getElementById('legacy-result').textContent='CLICK OK'">Ejecutar</button>
    <span id="legacy-result"></span>
  </main>
</body>
</html>`

const abrirLegacy = ({ route, legacyPath, title, profile }) => {
  cy.mockLegacyPage(legacyPath, mockHtml(title))
  cy.loginAsTestUser(profile || {})
  cy.visit(`/UI/FM/${route}`)
  cy.get('iframe.legacy-iframe')
    .should('be.visible')
    .and('have.attr', 'src', `/pc/${legacyPath}`)
    .and('have.attr', 'title', title)
}

const iframeBody = () => cy.get('iframe.legacy-iframe')
  .its('0.contentDocument.body')
  .should('not.be.empty')
  .then(cy.wrap)

describe('Iframes legacy - funcionamiento completo', () => {
  beforeEach(() => {
    cy.viewport(1440, 900)
  })

  legacyRoutes.forEach(([route, legacyPath, title]) => {
    it(`mantiene ${route} encapsulada en /pc/${legacyPath}`, () => {
      abrirLegacy({ route, legacyPath, title })
      iframeBody().find('[data-cy="legacy-page"]').should('contain.text', title)
    })
  })

  it('mantiene workAround como iframe cuando el usuario tiene permiso WOAR', () => {
    abrirLegacy({
      route: 'workAround.html',
      legacyPath: 'workAround.html',
      title: 'work around',
      profile: { rutas: ['WOAR'] },
    })
    iframeBody().find('[data-cy="legacy-page"]').should('contain.text', 'work around')
  })

  it('permite interactuar con controles reales dentro del iframe', () => {
    abrirLegacy({
      route: 'busquedaOtsGcc.html',
      legacyPath: 'busquedaOtsGcc.html',
      title: 'Búsqueda de OTs',
    })

    iframeBody().find('#legacy-input').type('AA00070643').should('have.value', 'AA00070643')
    iframeBody().find('#legacy-button').click()
    iframeBody().find('#legacy-result').should('have.text', 'CLICK OK')
  })

  it('inyecta estilos responsive únicamente dentro del documento legacy', () => {
    abrirLegacy({
      route: 'busquedaOtsGcc.html',
      legacyPath: 'busquedaOtsGcc.html',
      title: 'Búsqueda de OTs',
    })

    cy.get('iframe.legacy-iframe').then(($iframe) => {
      const doc = $iframe[0].contentDocument
      expect(doc.getElementById('fm-legacy-responsive-styles')).to.exist
      expect(document.getElementById('fm-legacy-responsive-styles')).to.not.exist
    })
  })

  it('no duplica el bloque de estilos responsive en un mismo iframe', () => {
    abrirLegacy({
      route: 'consultarReglas.html',
      legacyPath: 'consultarReglas.html',
      title: 'Consultar Reglas',
    })

    cy.get('iframe.legacy-iframe').then(($iframe) => {
      const doc = $iframe[0].contentDocument
      expect(doc.querySelectorAll('#fm-legacy-responsive-styles')).to.have.length(1)
    })
  })

  it('persiste urlParam y titleParam de la pantalla activa', () => {
    abrirLegacy({
      route: 'jobtypeContrato.html',
      legacyPath: 'jobtypeContrato.html',
      title: 'Jobtype - Contrato',
    })

    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('urlParam')).to.eq('/jobtypeContrato.html')
      expect(win.sessionStorage.getItem('titleParam')).to.eq('Jobtype - Contrato')
    })
  })

  it('cambia correctamente de un iframe legacy a otro', () => {
    cy.mockLegacyPage('busquedaOtsGcc.html', mockHtml('Búsqueda de OTs'))
    cy.mockLegacyPage('jobtypeCMO.html', mockHtml('CMO - Actividad'))
    cy.loginAsTestUser()

    cy.visit('/UI/FM/busquedaOtsGcc.html')
    cy.get('iframe.legacy-iframe').should('have.attr', 'src', '/pc/busquedaOtsGcc.html')

    cy.visit('/UI/FM/jobtypeCMO.html')
    cy.get('iframe.legacy-iframe')
      .should('have.attr', 'src', '/pc/jobtypeCMO.html')
      .and('have.attr', 'title', 'CMO - Actividad')
  })

  it('muestra loader hasta que termina una carga lenta del iframe', () => {
    cy.intercept('GET', '**/pc/busquedaOtsGcc.html', (req) => {
      req.reply({
        delay: 800,
        statusCode: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' },
        body: mockHtml('Buscador lento'),
      })
    }).as('legacyLento')

    cy.loginAsTestUser()
    cy.visit('/UI/FM/busquedaOtsGcc.html')
    cy.get('[role="status"]').should('be.visible').and('contain.text', 'Cargando Información')
    cy.wait('@legacyLento')
    cy.get('iframe.legacy-iframe').should('be.visible')
    cy.get('[role="status"]').should('not.exist')
  })

  it('acepta redirect same-origin desde iframe hacia Detalle Acta', () => {
    abrirLegacy({
      route: 'consultarActas.html',
      legacyPath: 'consultarActas.html',
      title: 'consultarActas',
    })

    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen')
      win.dispatchEvent(new MessageEvent('message', {
        origin: win.location.origin,
        data: {
          type: 'redirect',
          nroActa: 'ACTA-123',
          url: '/detalleActa/detalle.html',
        },
      }))
    })

    cy.get('@windowOpen').should('have.been.calledOnce')
    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('nroActa')).to.eq('ACTA-123')
      expect(win.sessionStorage.getItem('urlDetalle')).to.eq('/detalleActa/detalle.html')
    })
  })

  it('ignora mensajes redirect de un origen externo', () => {
    abrirLegacy({
      route: 'consultarActas.html',
      legacyPath: 'consultarActas.html',
      title: 'consultarActas',
    })

    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen')
      win.dispatchEvent(new MessageEvent('message', {
        origin: 'https://externo.example.test',
        data: {
          type: 'redirect',
          nroActa: 'ACTA-MALICIOSA',
          url: '/detalleActa/detalle.html',
        },
      }))
    })

    cy.get('@windowOpen').should('not.have.been.called')
    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('nroActa')).to.not.eq('ACTA-MALICIOSA')
    })
  })

  it('construye Detalle Acta con nroActa y urlDetalle guardados', () => {
    cy.intercept('GET', '**/pc/detalleActa/detalle.html?nroActa=ACTA-456', {
      statusCode: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
      body: mockHtml('Detalle ACTA-456'),
    }).as('detalleActa')

    cy.visit('/UI/FM/detallActa.html', {
      onBeforeLoad(win) {
        win.sessionStorage.setItem('nroActa', 'ACTA-456')
        win.sessionStorage.setItem('urlDetalle', '/detalleActa/detalle.html')
      },
    })

    cy.wait('@detalleActa')
    cy.get('iframe.legacy-iframe')
      .should('have.attr', 'src')
      .and('include', '/pc/detalleActa/detalle.html?nroActa=ACTA-456')
    cy.get('iframe.legacy-iframe').should('have.attr', 'title', 'Detalle Acta - ACTA-456')
  })

  it('aplica también responsive al iframe de Detalle Acta', () => {
    cy.intercept('GET', '**/pc/detalleActa/detalle.html?nroActa=ACTA-789', {
      statusCode: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
      body: mockHtml('Detalle ACTA-789'),
    })

    cy.visit('/UI/FM/detallActa.html', {
      onBeforeLoad(win) {
        win.sessionStorage.setItem('nroActa', 'ACTA-789')
        win.sessionStorage.setItem('urlDetalle', '/detalleActa/detalle.html')
      },
    })

    cy.get('iframe.legacy-iframe').then(($iframe) => {
      expect($iframe[0].contentDocument.getElementById('fm-legacy-responsive-styles')).to.exist
    })
  })

  it('mantiene Buscador OTs exclusivamente legacy', () => {
    abrirLegacy({
      route: 'busquedaOtsGcc.html',
      legacyPath: 'busquedaOtsGcc.html',
      title: 'Búsqueda de OTs',
    })
    cy.get('.busqueda-ots-page').should('not.exist')
    cy.get('iframe.legacy-iframe').should('exist')
  })

  it('mantiene Jobtype y CMO exclusivamente legacy', () => {
    cy.mockLegacyPage('jobtypeContrato.html', mockHtml('JOCO'))
    cy.mockLegacyPage('jobtypeCMO.html', mockHtml('JOCM'))
    cy.loginAsTestUser()

    cy.visit('/UI/FM/jobtypeContrato.html')
    cy.get('iframe.legacy-iframe').should('have.attr', 'src', '/pc/jobtypeContrato.html')
    cy.get('.parametrizaciones-page').should('not.exist')

    cy.visit('/UI/FM/jobtypeCMO.html')
    cy.get('iframe.legacy-iframe').should('have.attr', 'src', '/pc/jobtypeCMO.html')
    cy.get('.parametrizaciones-page').should('not.exist')
  })

  it('rechaza una ruta legacy protegida cuando no existe sesión', () => {
    cy.visit('/UI/FM/busquedaOtsGcc.html')
    cy.location('pathname').should('match', /\/UI\/401\.html$/)
    cy.get('iframe.legacy-iframe').should('not.exist')
  })

  it('mantiene el iframe visible y ancho completo en viewport móvil', () => {
    cy.viewport(390, 844)
    abrirLegacy({
      route: 'busquedaOtsGcc.html',
      legacyPath: 'busquedaOtsGcc.html',
      title: 'Búsqueda de OTs',
    })

    cy.get('iframe.legacy-iframe')
      .should('be.visible')
      .and('have.attr', 'width', '100%')
  })
})
