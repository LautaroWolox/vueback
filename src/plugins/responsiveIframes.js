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

const applyResponsiveStyles = (iframe) => {
  try {
    const document = iframe.contentDocument || iframe.contentWindow?.document
    if (!document?.head || !document?.body) return

    document.body.classList.add('fm-responsive-legacy')

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
