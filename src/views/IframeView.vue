<template>
  <div class="fm-screen fm-screen--pad iframe-page" :class="profileClass">
    <FmPanel :title="titulo" accent class="iframe-panel">
      <div class="iframe-stage">
        <iframe
          ref="iframeRef"
          :src="iframeSrc"
          :title="titulo"
          class="fm-legacy-frame"
          frameborder="0"
          allowfullscreen
          @load="onIframeLoad"
        />

        <FmTypingLoader
          v-if="loading"
          overlay
          variant="grid"
          title="Cargando pantalla"
          :message="titulo"
        />
      </div>
    </FmPanel>
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref, watch, watchEffect } from 'vue'
import router from '@/router'

const props = defineProps({
  urlParam: { type: String, required: true },
  titleParam: { type: String, required: true }
})

const iframeRef = ref(null)
const loading = ref(true)
let legacyObserver = null

const titulo = computed(() => props.titleParam || sessionStorage.getItem('titleParam') || '')
const profileName = computed(() => {
  const value = String(props.urlParam || '').toLowerCase()
  if (value.includes('busquedaots')) return 'busqueda-ots'
  if (value.includes('jobtypecontrato')) return 'jobtype'
  if (value.includes('configuracmoactividad')) return 'cmo'
  return 'generic'
})
const profileClass = computed(() => `iframe-page--${profileName.value}`)

watchEffect(() => {
  sessionStorage.setItem('urlParam', props.urlParam)
  sessionStorage.setItem('titleParam', props.titleParam)
})

const iframeSrc = computed(() => `/pc${props.urlParam || sessionStorage.getItem('urlParam') || ''}`)

watch(iframeSrc, () => {
  loading.value = true
  legacyObserver?.disconnect()
  legacyObserver = null
})

const legacyCss = `
  :root{--fm-cyan:#00a9bd;--fm-cyan-strong:#008fa1;--fm-cyan-soft:#e4f9fc;--fm-text:#263746;--fm-muted:#607887;--fm-border:#d4dde2;font-size:13px}
  *,*::before,*::after{box-sizing:border-box}
  html,body{width:100%;min-height:100%;margin:0}
  body.fm-legacy-skin{background:#fff!important;color:var(--fm-text)!important;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif!important;font-size:13px!important}
  body.fm-legacy-skin h1,body.fm-legacy-skin h2,body.fm-legacy-skin h3,body.fm-legacy-skin h4{color:#203947!important}
  body.fm-legacy-skin fieldset,body.fm-legacy-skin .panel,body.fm-legacy-skin .card,body.fm-legacy-skin .ui-panel,body.fm-legacy-skin .p-panel,body.fm-legacy-skin .accordion-group,body.fm-legacy-skin .ui-accordion-content{border:1px solid var(--fm-border)!important;border-left:3px solid var(--fm-cyan)!important;border-radius:0!important;background:#fff!important;box-shadow:none!important}
  body.fm-legacy-skin legend,body.fm-legacy-skin .panel-heading,body.fm-legacy-skin .card-header,body.fm-legacy-skin .ui-panel-titlebar,body.fm-legacy-skin .p-panel-header,body.fm-legacy-skin .ui-accordion-header{min-height:31px!important;padding:6px 10px!important;border:0!important;border-bottom:1px solid var(--fm-border)!important;border-radius:0!important;background:#f7f9fa!important;color:#111!important;font-size:13px!important;font-weight:500!important}
  body.fm-legacy-skin label{color:#111!important;font-size:12px!important;font-weight:700!important}
  body.fm-legacy-skin input:not([type=checkbox]):not([type=radio]),body.fm-legacy-skin select,body.fm-legacy-skin textarea,body.fm-legacy-skin .ui-inputfield,body.fm-legacy-skin .p-inputtext,body.fm-legacy-skin .p-select,body.fm-legacy-skin .ui-selectonemenu{min-height:30px!important;border:1px solid #c5d1d8!important;border-radius:3px!important;background:#fff!important;color:var(--fm-text)!important;font-size:12px!important;box-shadow:none!important}
  body.fm-legacy-skin textarea{min-height:76px!important}
  body.fm-legacy-skin input:focus,body.fm-legacy-skin select:focus,body.fm-legacy-skin textarea:focus,body.fm-legacy-skin .ui-state-focus,body.fm-legacy-skin .p-focus{border-color:var(--fm-cyan)!important;outline:0!important;box-shadow:0 0 0 2px rgba(0,169,189,.14)!important}
  body.fm-legacy-skin button,body.fm-legacy-skin input[type=button],body.fm-legacy-skin input[type=submit],body.fm-legacy-skin .btn,body.fm-legacy-skin .ui-button,body.fm-legacy-skin .p-button{min-height:32px!important;padding:0 14px!important;border:1px solid var(--fm-cyan)!important;border-radius:6px!important;background:var(--fm-cyan)!important;color:#fff!important;font-size:12px!important;font-weight:700!important;box-shadow:0 4px 11px rgba(0,73,84,.14)!important;text-shadow:none!important}
  body.fm-legacy-skin button:hover,body.fm-legacy-skin .btn:hover,body.fm-legacy-skin .ui-button:hover,body.fm-legacy-skin .p-button:hover{border-color:var(--fm-cyan-strong)!important;background:var(--fm-cyan-strong)!important;color:#fff!important}
  body.fm-legacy-skin .btn-default,body.fm-legacy-skin .btn-secondary,body.fm-legacy-skin .ui-button-secondary,body.fm-legacy-skin .p-button-outlined{background:#fff!important;color:var(--fm-cyan-strong)!important}
  body.fm-legacy-skin table,body.fm-legacy-skin .ui-datatable table,body.fm-legacy-skin .p-datatable-table,body.fm-legacy-skin .dataTable{width:100%!important;border-collapse:collapse!important;background:#fff!important;font-size:12px!important}
  body.fm-legacy-skin table th,body.fm-legacy-skin .ui-datatable thead th,body.fm-legacy-skin .p-datatable-thead>tr>th,body.fm-legacy-skin .dataTable thead th{height:35px!important;padding:4px 7px!important;border:1px solid #c5d1d8!important;background:#f3f7f9!important;color:#173142!important;font-size:11px!important;font-weight:700!important}
  body.fm-legacy-skin table td,body.fm-legacy-skin .ui-datatable tbody td,body.fm-legacy-skin .p-datatable-tbody>tr>td,body.fm-legacy-skin .dataTable tbody td{height:34px!important;padding:5px 8px!important;border:1px solid #dce4e8!important;color:var(--fm-text)!important;white-space:nowrap!important}
  body.fm-legacy-skin table tbody tr:hover td,body.fm-legacy-skin .ui-datatable tbody tr:hover td,body.fm-legacy-skin .dataTable tbody tr:hover td{background:#f0fbfc!important}
  body.fm-legacy-skin .ui-paginator,body.fm-legacy-skin .p-paginator,body.fm-legacy-skin .dataTables_paginate,body.fm-legacy-skin .pagination{min-height:38px!important;border:1px solid var(--fm-border)!important;background:#fff!important;color:#1d3747!important}
  body.fm-legacy-skin .ui-dialog,body.fm-legacy-skin .p-dialog,body.fm-legacy-skin .modal-content,body.fm-legacy-skin [role=dialog]{max-width:calc(100vw - 28px)!important;border:1px solid #d7e0e5!important;border-radius:12px!important;background:#fff!important;box-shadow:0 20px 55px rgba(20,48,59,.24)!important;overflow:hidden!important}
  body.fm-legacy-skin .ui-dialog-titlebar,body.fm-legacy-skin .p-dialog-header,body.fm-legacy-skin .modal-header{position:relative!important;min-height:50px!important;display:flex!important;align-items:center!important;padding:11px 84px 11px 16px!important;border:0!important;border-bottom:1px solid var(--fm-border)!important;background:#fff!important;color:var(--fm-text)!important}
  body.fm-legacy-skin .ui-dialog-content,body.fm-legacy-skin .p-dialog-content,body.fm-legacy-skin .modal-body{padding:15px 17px!important;background:#fff!important}
  body.fm-legacy-skin .ui-dialog-buttonpane,body.fm-legacy-skin .p-dialog-footer,body.fm-legacy-skin .modal-footer{padding:11px 17px!important;border-top:1px solid var(--fm-border)!important;background:#fff!important}
  body.fm-legacy-skin .fm-legacy-maximize{position:absolute!important;top:9px!important;right:44px!important;width:31px!important;min-width:31px!important;height:31px!important;min-height:31px!important;padding:0!important;border:0!important;border-radius:6px!important;background:transparent!important;color:#526b78!important;font-size:19px!important;line-height:1!important;box-shadow:none!important;z-index:2!important}
  body.fm-legacy-skin .fm-legacy-maximize:hover{background:var(--fm-cyan-soft)!important;color:var(--fm-cyan-strong)!important}
  body.fm-legacy-skin .fm-legacy-dialog--maximized{position:fixed!important;inset:22px!important;width:auto!important;max-width:none!important;height:calc(100vh - 44px)!important;max-height:none!important;display:flex!important;flex-direction:column!important;z-index:999999!important}
  body.fm-legacy-skin .fm-legacy-dialog--maximized .ui-dialog-content,body.fm-legacy-skin .fm-legacy-dialog--maximized .p-dialog-content,body.fm-legacy-skin .fm-legacy-dialog--maximized .modal-body{flex:1 1 auto!important;overflow:auto!important}
  body.fm-legacy-skin .ui-datepicker,body.fm-legacy-skin .p-datepicker,body.fm-legacy-skin .datepicker{width:268px!important;padding:8px!important;border:1px solid var(--fm-border)!important;border-radius:7px!important;background:#fff!important;box-shadow:0 16px 38px rgba(20,48,59,.22)!important}
  body.fm-legacy-skin .ui-datepicker td a,body.fm-legacy-skin .p-datepicker-day{width:30px!important;height:30px!important;border-radius:50%!important;font-size:11px!important}
  @media(max-width:760px){body.fm-legacy-skin{overflow-x:auto!important}body.fm-legacy-skin .ui-dialog,body.fm-legacy-skin .p-dialog,body.fm-legacy-skin .modal-content{width:calc(100vw - 20px)!important}body.fm-legacy-skin .fm-legacy-dialog--maximized{inset:8px!important;height:calc(100vh - 16px)!important}}
`

const jobtypeCss = `
  body.fm-legacy-skin[data-fm-profile=jobtype]{padding:0!important;background:#fff!important;color:#263238!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] .ui-accordion,body.fm-legacy-skin[data-fm-profile=jobtype] .accordion,body.fm-legacy-skin[data-fm-profile=jobtype] [class*=accordion]{width:100%!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] .ui-accordion-header,body.fm-legacy-skin[data-fm-profile=jobtype] .accordion-heading,body.fm-legacy-skin[data-fm-profile=jobtype] .accordion-header{height:28px!important;min-height:28px!important;margin:0!important;padding:5px 10px!important;border:0!important;border-bottom:1px solid #dfe4e8!important;border-radius:0!important;background:#f7f7f7!important;color:#000!important;font-size:12px!important;font-weight:500!important;line-height:18px!important;box-shadow:none!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] .ui-accordion-content,body.fm-legacy-skin[data-fm-profile=jobtype] .accordion-inner,body.fm-legacy-skin[data-fm-profile=jobtype] .accordion-content{margin:0 0 10px!important;padding:0!important;border:1px solid #d6dde2!important;border-left:3px solid #00a9bd!important;border-radius:0!important;background:#fff!important;overflow:visible!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] fieldset,body.fm-legacy-skin[data-fm-profile=jobtype] .panel,body.fm-legacy-skin[data-fm-profile=jobtype] .ui-panel{margin:0 0 10px!important;border:1px solid #d6dde2!important;border-left:3px solid #00a9bd!important;border-radius:0!important;background:#fff!important;box-shadow:none!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] legend,body.fm-legacy-skin[data-fm-profile=jobtype] .panel-heading,body.fm-legacy-skin[data-fm-profile=jobtype] .ui-panel-titlebar{height:28px!important;min-height:28px!important;margin:0!important;padding:5px 10px!important;border:0!important;border-bottom:1px solid #dfe4e8!important;border-radius:0!important;background:#f7f7f7!important;color:#000!important;font-size:12px!important;font-weight:500!important;line-height:18px!important;box-shadow:none!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] .fm-jobtype-action{width:120px!important;min-width:120px!important;max-width:120px!important;height:36px!important;min-height:36px!important;max-height:36px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;padding:0 13px!important;border:1px solid #00a9bd!important;border-radius:6px!important;background:#00a9bd!important;color:#fff!important;font-size:13px!important;font-weight:400!important;line-height:1!important;box-shadow:0 4px 10px rgba(0,78,91,.16)!important;text-shadow:none!important;white-space:nowrap!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] .fm-jobtype-action:hover:not(:disabled){border-color:#008fa1!important;background:#008fa1!important;color:#fff!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] .fm-jobtype-action.fm-jobtype-outline{background:#fff!important;color:#00a0b4!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] .fm-jobtype-action:disabled,body.fm-legacy-skin[data-fm-profile=jobtype] .fm-jobtype-action.ui-state-disabled{border-color:#aeb8bd!important;background:#edf0f2!important;color:#8f9ba2!important;box-shadow:none!important;cursor:not-allowed!important;opacity:.7!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] .fm-jobtype-icon-button{width:26px!important;min-width:26px!important;max-width:26px!important;height:26px!important;min-height:26px!important;max-height:26px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;margin:0 auto!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;color:#173142!important;box-shadow:none!important;text-shadow:none!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] .fm-jobtype-icon-button:hover:not(:disabled){border:0!important;background:transparent!important;color:#007d8c!important;box-shadow:none!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] .fm-jobtype-icon-button i,body.fm-legacy-skin[data-fm-profile=jobtype] .fm-jobtype-icon-button svg,body.fm-legacy-skin[data-fm-profile=jobtype] .fm-jobtype-icon-button img,body.fm-legacy-skin[data-fm-profile=jobtype] .fm-jobtype-icon-button .ui-icon{width:18px!important;max-width:18px!important;height:18px!important;max-height:18px!important;font-size:16px!important;line-height:18px!important;color:currentColor!important;opacity:1!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] .fm-jobtype-icon-button:disabled,body.fm-legacy-skin[data-fm-profile=jobtype] .fm-jobtype-icon-button.ui-state-disabled{color:#aeb8bd!important;cursor:not-allowed!important;opacity:.55!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] .ui-datatable,body.fm-legacy-skin[data-fm-profile=jobtype] .dataTables_wrapper,body.fm-legacy-skin[data-fm-profile=jobtype] .fm-jobtype-grid-wrapper{width:100%!important;max-width:100%!important;overflow:auto!important;border:1px solid #d1d1d1!important;background:#fff!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] table.fm-jobtype-grid,body.fm-legacy-skin[data-fm-profile=jobtype] .ui-datatable table,body.fm-legacy-skin[data-fm-profile=jobtype] table.dataTable{width:max-content!important;min-width:100%!important;table-layout:fixed!important;border-collapse:collapse!important;background:#fff!important;font-size:12px!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] table.fm-jobtype-grid thead th,body.fm-legacy-skin[data-fm-profile=jobtype] .ui-datatable thead th,body.fm-legacy-skin[data-fm-profile=jobtype] table.dataTable thead th{height:34px!important;min-height:34px!important;padding:4px 7px!important;border-right:1px solid #c9d3da!important;border-bottom:1px solid #dce3e8!important;background:#f4f7f9!important;color:#263f50!important;font-size:11px!important;font-weight:700!important;vertical-align:middle!important;white-space:nowrap!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] table.fm-jobtype-grid tbody td,body.fm-legacy-skin[data-fm-profile=jobtype] .ui-datatable tbody td,body.fm-legacy-skin[data-fm-profile=jobtype] table.dataTable tbody td{height:35px!important;min-height:35px!important;padding:5px 8px!important;border-right:1px solid #c9d3da!important;border-bottom:1px solid #dce3e8!important;background:#fff!important;color:#263238!important;font-size:12px!important;vertical-align:middle!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] table.fm-jobtype-grid tbody tr:hover td,body.fm-legacy-skin[data-fm-profile=jobtype] .ui-datatable tbody tr:hover td,body.fm-legacy-skin[data-fm-profile=jobtype] table.dataTable tbody tr:hover td{background:#edfafd!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] table.fm-jobtype-grid tbody tr.ui-state-highlight td,body.fm-legacy-skin[data-fm-profile=jobtype] table.fm-jobtype-grid tbody tr.selected td,body.fm-legacy-skin[data-fm-profile=jobtype] .ui-datatable tbody tr.ui-state-highlight td,body.fm-legacy-skin[data-fm-profile=jobtype] table.dataTable tbody tr.selected td{background:#d9f8fa!important;color:#111!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] table.fm-jobtype-grid tbody tr.ui-state-disabled td,body.fm-legacy-skin[data-fm-profile=jobtype] table.fm-jobtype-grid tbody tr.disabled td,body.fm-legacy-skin[data-fm-profile=jobtype] .ui-datatable tbody tr.ui-state-disabled td{background:#edf0f2!important;color:#111!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] thead input,body.fm-legacy-skin[data-fm-profile=jobtype] thead select,body.fm-legacy-skin[data-fm-profile=jobtype] .ui-column-filter{height:25px!important;min-height:25px!important;padding:3px 5px!important;border:1px solid #c7d1d8!important;border-radius:3px!important;background:#fff!important;color:#263746!important;font-size:11px!important;box-shadow:none!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] .ui-paginator,body.fm-legacy-skin[data-fm-profile=jobtype] .p-paginator,body.fm-legacy-skin[data-fm-profile=jobtype] .dataTables_paginate,body.fm-legacy-skin[data-fm-profile=jobtype] .pagination,body.fm-legacy-skin[data-fm-profile=jobtype] .pager{min-height:38px!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;margin:0!important;padding:3px 8px!important;border:1px solid #d1d1d1!important;border-top:0!important;border-radius:0!important;background:#fff!important;color:#111!important;font-size:12px!important;box-shadow:none!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] .fm-jobtype-pager-control{width:22px!important;min-width:22px!important;max-width:22px!important;height:28px!important;min-height:28px!important;max-height:28px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;color:#111!important;font-size:14px!important;font-weight:400!important;line-height:1!important;box-shadow:none!important;text-shadow:none!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] .fm-jobtype-pager-control:hover:not(.ui-state-disabled):not(.disabled){border:0!important;background:transparent!important;color:#00a9bd!important;box-shadow:none!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] .fm-jobtype-pager-control.ui-state-disabled,body.fm-legacy-skin[data-fm-profile=jobtype] .fm-jobtype-pager-control.disabled{color:#b7c0c4!important;cursor:default!important;opacity:1!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] .ui-paginator select,body.fm-legacy-skin[data-fm-profile=jobtype] .dataTables_length select{width:58px!important;min-width:58px!important;height:28px!important;min-height:28px!important;padding:0 6px!important;border:1px solid #cbd4db!important;border-radius:4px!important;background:#fff!important;color:#111!important;font-size:12px!important}
  body.fm-legacy-skin[data-fm-profile=jobtype] .ui-paginator-current,body.fm-legacy-skin[data-fm-profile=jobtype] .dataTables_info{margin-left:auto!important;color:#222!important;font-size:12px!important;white-space:nowrap!important}
  @media(max-width:900px){body.fm-legacy-skin[data-fm-profile=jobtype] .fm-jobtype-action{width:min(120px,calc(50vw - 24px))!important;min-width:0!important}body.fm-legacy-skin[data-fm-profile=jobtype] .ui-paginator,body.fm-legacy-skin[data-fm-profile=jobtype] .p-paginator,body.fm-legacy-skin[data-fm-profile=jobtype] .dataTables_paginate{flex-wrap:wrap!important}}
`

const dialogSelectors = '.ui-dialog, .p-dialog, .modal-content, [role="dialog"]'
const headerSelectors = '.ui-dialog-titlebar, .p-dialog-header, .modal-header, [class*="dialog-header"]'
const paginatorSelectors = '.ui-paginator, .p-paginator, .dataTables_paginate, .pagination, .pager'
const paginatorControlSelectors = [
  '.ui-paginator a', '.ui-paginator button', '.ui-paginator span.ui-paginator-page',
  '.p-paginator a', '.p-paginator button', '.p-paginator span.p-paginator-page',
  '.dataTables_paginate a', '.dataTables_paginate button',
  '.pagination a', '.pagination button', '.pager a', '.pager button'
].join(', ')
const controlSelectors = 'button, input[type="button"], input[type="submit"], a.btn, a.ui-button, a.p-button, .ui-button, .p-button'

const enhanceDialogs = (document) => {
  document.querySelectorAll(dialogSelectors).forEach((dialog) => {
    if (dialog.dataset.fmEnhanced === 'true') return

    const header = dialog.querySelector(headerSelectors)
    if (!header) return

    dialog.dataset.fmEnhanced = 'true'
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'fm-legacy-maximize'
    button.title = 'Maximizar'
    button.setAttribute('aria-label', 'Maximizar')
    button.textContent = '□'

    button.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      const maximized = dialog.classList.toggle('fm-legacy-dialog--maximized')
      button.textContent = maximized ? '❐' : '□'
      button.title = maximized ? 'Restaurar tamaño' : 'Maximizar'
      button.setAttribute('aria-label', button.title)
    })

    header.appendChild(button)
  })
}

const controlText = (control) => String(
  control.value || control.textContent || control.getAttribute('aria-label') || control.title || ''
).replace(/\s+/g, ' ').trim()

const enhanceJobtype = (document) => {
  if (document.body.dataset.fmProfile !== 'jobtype') return

  document.querySelectorAll('table').forEach((table) => {
    table.classList.add('fm-jobtype-grid')
    const wrapper = table.closest('.ui-datatable, .dataTables_wrapper, .table-responsive, [class*="table-container"]')
    wrapper?.classList.add('fm-jobtype-grid-wrapper')
  })

  document.querySelectorAll(controlSelectors).forEach((control) => {
    if (control.classList.contains('fm-legacy-maximize')) return

    if (control.closest(paginatorSelectors)) {
      control.classList.add('fm-jobtype-pager-control')
      control.classList.remove('fm-jobtype-action', 'fm-jobtype-icon-button', 'fm-jobtype-outline')
      return
    }

    const text = controlText(control)
    const hasIcon = Boolean(control.querySelector?.('i, svg, img, .ui-icon, .pi, [class*="icon"]'))
    const iconOnly = control.classList.contains('ui-button-icon-only') ||
      control.classList.contains('p-button-icon-only') ||
      (!text && hasIcon) ||
      (hasIcon && text.length <= 2)

    if (iconOnly) {
      control.classList.add('fm-jobtype-icon-button')
      control.classList.remove('fm-jobtype-action', 'fm-jobtype-outline')
      return
    }

    control.classList.add('fm-jobtype-action')
    control.classList.remove('fm-jobtype-icon-button')

    const outline = /cancelar|cerrar|limpiar|volver|salir/i.test(text) ||
      control.classList.contains('btn-default') ||
      control.classList.contains('btn-secondary') ||
      control.classList.contains('ui-button-secondary') ||
      control.classList.contains('p-button-outlined')

    control.classList.toggle('fm-jobtype-outline', outline)
  })

  document.querySelectorAll(paginatorControlSelectors).forEach((control) => {
    control.classList.add('fm-jobtype-pager-control')
  })
}

const enhanceLegacyDocument = (document) => {
  enhanceDialogs(document)
  enhanceJobtype(document)
}

const applyLegacyStyles = () => {
  try {
    const iframe = iframeRef.value
    const document = iframe?.contentDocument || iframe?.contentWindow?.document
    if (!document?.head || !document?.body) return

    document.body.classList.add('fm-legacy-skin')
    document.body.dataset.fmProfile = profileName.value

    let style = document.getElementById('fm-injected-styles')
    if (!style) {
      style = document.createElement('style')
      style.id = 'fm-injected-styles'
      document.head.appendChild(style)
    }
    style.textContent = profileName.value === 'jobtype' ? `${legacyCss}\n${jobtypeCss}` : legacyCss

    enhanceLegacyDocument(document)
    legacyObserver?.disconnect()
    legacyObserver = new MutationObserver(() => enhanceLegacyDocument(document))
    legacyObserver.observe(document.body, { childList: true, subtree: true })
  } catch {}
}

const onIframeLoad = () => {
  applyLegacyStyles()
  loading.value = false
}

function handleRedirect(event) {
  const origins = new Set([import.meta.env.VITE_ORIGIN, window.location.origin])
  if (!origins.has(event.origin)) return

  const message = event.data
  if (message?.type === 'redirect' && message.nroActa && message.url) {
    sessionStorage.setItem('nroActa', message.nroActa)
    sessionStorage.setItem('urlDetalle', message.url)
    const route = router.resolve({ name: 'DEAC' })
    window.open(route.href, '_blank')
  }
}

window.addEventListener('message', handleRedirect)

onUnmounted(() => {
  legacyObserver?.disconnect()
  window.removeEventListener('message', handleRedirect)
})
</script>

<style scoped>
.iframe-page {
  min-height: calc(100vh - 82px);
}

.iframe-panel {
  margin: 0;
}

.iframe-stage {
  position: relative;
  width: 100%;
  height: calc(100vh - 124px);
  min-height: 520px;
  overflow: hidden;
  background: #fff;
}

.fm-legacy-frame {
  width: 100%;
  height: 100%;
  display: block;
  border: 0;
  background: #fff;
}

@media (max-width: 900px) {
  .iframe-stage {
    height: calc(100vh - 116px);
    min-height: 460px;
  }
}
</style>
