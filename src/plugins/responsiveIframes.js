import globalCss from '@/assets/css/fm-global.css?raw'

const LEGACY_START = '/* ===== INICIO: fm-legacy-responsive.css ===== */'
const LEGACY_END = '/* ===== FIN: fm-legacy-responsive.css ===== */'

const legacyStartIndex = globalCss.indexOf(LEGACY_START)
const legacyEndIndex = globalCss.indexOf(LEGACY_END)

if (legacyStartIndex === -1 || legacyEndIndex === -1 || legacyEndIndex <= legacyStartIndex) {
  throw new Error('No se encontró la sección responsive legacy en fm-global.css')
}

const legacyResponsiveCss = globalCss
  .slice(legacyStartIndex + LEGACY_START.length, legacyEndIndex)
  .trim()

const STYLE_ID = 'fm-legacy-responsive-styles'
const NATIVE_CONTROLS_PATHS = new Set(['/gestionOperadores.html'])

const getIframePathname = (iframe) => {
  try {
    return iframe.contentWindow?.location?.pathname || new URL(iframe.src, window.location.href).pathname
  } catch {
    try {
      return new URL(iframe.src, window.location.href).pathname
    } catch {
      return ''
    }
  }
}

const applyResponsiveStyles = (iframe) => {
  try {
    const document = iframe.contentDocument || iframe.contentWindow?.document
    if (!document?.head || !document?.body) return

    document.body.classList.add('fm-responsive-legacy')
    document.body.classList.toggle(
      'fm-legacy-native-controls',
      NATIVE_CONTROLS_PATHS.has(getIframePathname(iframe))
    )

    let style = document.getElementById(STYLE_ID)
    if (!style) {
      style = document.createElement('style')
      style.id = STYLE_ID
      document.head.appendChild(style)
    }

    style.textContent = legacyResponsiveCss
  } catch {}
}

const attachIframe = (iframe) => {
  if (!(iframe instanceof HTMLIFrameElement)) return
  if (iframe.dataset.fmResponsiveAttached === 'true') return

  iframe.dataset.fmResponsiveAttached = 'true'
  iframe.addEventListener('load', () => applyResponsiveStyles(iframe))
  applyResponsiveStyles(iframe)
}

export const installResponsiveIframes = () => {
  const attachAll = (root = document) => {
    root.querySelectorAll?.('iframe').forEach(attachIframe)
  }

  attachAll()

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return
        if (node.matches('iframe')) attachIframe(node)
        attachAll(node)
      })
    })
  })

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  })

  return () => observer.disconnect()
}
