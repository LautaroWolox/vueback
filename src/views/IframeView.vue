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
const titulo = computed(() => props.titleParam || sessionStorage.getItem('titleParam') || '')
const profileClass = computed(() => {
  const value = String(props.urlParam || '').toLowerCase()
  if (value.includes('busquedaots')) return 'iframe-page--busqueda-ots'
  if (value.includes('jobtypecontrato')) return 'iframe-page--jobtype'
  if (value.includes('configuracmoactividad')) return 'iframe-page--cmo'
  return 'iframe-page--generic'
})

watchEffect(() => {
  sessionStorage.setItem('urlParam', props.urlParam)
  sessionStorage.setItem('titleParam', props.titleParam)
})

const iframeSrc = computed(() => `/pc${props.urlParam || sessionStorage.getItem('urlParam') || ''}`)

watch(iframeSrc, () => {
  loading.value = true
})

const legacyCss = `
  :root {
    --fm-cyan: #00a9bd;
    --fm-cyan-strong: #008fa1;
    --fm-cyan-soft: #e4f9fc;
    --fm-text: #263746;
    --fm-muted: #607887;
    --fm-border: #d4dde2;
    font-size: 13px;
  }
  *, *::before, *::after { box-sizing: border-box; }
  html, body { width: 100%; min-height: 100%; margin: 0; }
  body.fm-legacy-skin {
    background: #fff !important;
    color: var(--fm-text) !important;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important;
    font-size: 13px !important;
  }
  body.fm-legacy-skin h1,
  body.fm-legacy-skin h2,
  body.fm-legacy-skin h3,
  body.fm-legacy-skin h4 { color: #203947 !important; }
  body.fm-legacy-skin fieldset,
  body.fm-legacy-skin .panel,
  body.fm-legacy-skin .card,
  body.fm-legacy-skin .ui-panel,
  body.fm-legacy-skin .p-panel,
  body.fm-legacy-skin .accordion-group,
  body.fm-legacy-skin .ui-accordion-content {
    border: 1px solid var(--fm-border) !important;
    border-left: 3px solid var(--fm-cyan) !important;
    border-radius: 0 !important;
    background: #fff !important;
    box-shadow: none !important;
  }
  body.fm-legacy-skin legend,
  body.fm-legacy-skin .panel-heading,
  body.fm-legacy-skin .card-header,
  body.fm-legacy-skin .ui-panel-titlebar,
  body.fm-legacy-skin .p-panel-header,
  body.fm-legacy-skin .ui-accordion-header {
    min-height: 31px !important;
    padding: 6px 10px !important;
    border: 0 !important;
    border-bottom: 1px solid var(--fm-border) !important;
    border-radius: 0 !important;
    background: #f7f9fa !important;
    color: #111 !important;
    font-size: 13px !important;
    font-weight: 500 !important;
  }
  body.fm-legacy-skin label {
    color: #111 !important;
    font-size: 12px !important;
    font-weight: 700 !important;
  }
  body.fm-legacy-skin input:not([type="checkbox"]):not([type="radio"]),
  body.fm-legacy-skin select,
  body.fm-legacy-skin textarea,
  body.fm-legacy-skin .ui-inputfield,
  body.fm-legacy-skin .p-inputtext,
  body.fm-legacy-skin .p-select,
  body.fm-legacy-skin .ui-selectonemenu {
    min-height: 30px !important;
    border: 1px solid #c5d1d8 !important;
    border-radius: 3px !important;
    background: #fff !important;
    color: var(--fm-text) !important;
    font-size: 12px !important;
    box-shadow: none !important;
  }
  body.fm-legacy-skin textarea { min-height: 76px !important; }
  body.fm-legacy-skin input:focus,
  body.fm-legacy-skin select:focus,
  body.fm-legacy-skin textarea:focus,
  body.fm-legacy-skin .ui-state-focus,
  body.fm-legacy-skin .p-focus {
    border-color: var(--fm-cyan) !important;
    outline: 0 !important;
    box-shadow: 0 0 0 2px rgba(0,169,189,.14) !important;
  }
  body.fm-legacy-skin button,
  body.fm-legacy-skin input[type="button"],
  body.fm-legacy-skin input[type="submit"],
  body.fm-legacy-skin .btn,
  body.fm-legacy-skin .ui-button,
  body.fm-legacy-skin .p-button {
    min-height: 32px !important;
    padding: 0 14px !important;
    border: 1px solid var(--fm-cyan) !important;
    border-radius: 6px !important;
    background: var(--fm-cyan) !important;
    color: #fff !important;
    font-size: 12px !important;
    font-weight: 700 !important;
    box-shadow: 0 4px 11px rgba(0,73,84,.14) !important;
    text-shadow: none !important;
  }
  body.fm-legacy-skin button:hover,
  body.fm-legacy-skin .btn:hover,
  body.fm-legacy-skin .ui-button:hover,
  body.fm-legacy-skin .p-button:hover {
    border-color: var(--fm-cyan-strong) !important;
    background: var(--fm-cyan-strong) !important;
    color: #fff !important;
  }
  body.fm-legacy-skin .btn-default,
  body.fm-legacy-skin .btn-secondary,
  body.fm-legacy-skin .ui-button-secondary,
  body.fm-legacy-skin .p-button-outlined {
    background: #fff !important;
    color: var(--fm-cyan-strong) !important;
  }
  body.fm-legacy-skin table,
  body.fm-legacy-skin .ui-datatable table,
  body.fm-legacy-skin .p-datatable-table,
  body.fm-legacy-skin .dataTable {
    width: 100% !important;
    border-collapse: collapse !important;
    background: #fff !important;
    font-size: 12px !important;
  }
  body.fm-legacy-skin table th,
  body.fm-legacy-skin .ui-datatable thead th,
  body.fm-legacy-skin .p-datatable-thead > tr > th,
  body.fm-legacy-skin .dataTable thead th {
    height: 35px !important;
    padding: 4px 7px !important;
    border: 1px solid #c5d1d8 !important;
    background: #f3f7f9 !important;
    color: #173142 !important;
    font-size: 11px !important;
    font-weight: 700 !important;
  }
  body.fm-legacy-skin table td,
  body.fm-legacy-skin .ui-datatable tbody td,
  body.fm-legacy-skin .p-datatable-tbody > tr > td,
  body.fm-legacy-skin .dataTable tbody td {
    height: 34px !important;
    padding: 5px 8px !important;
    border: 1px solid #dce4e8 !important;
    color: var(--fm-text) !important;
    white-space: nowrap !important;
  }
  body.fm-legacy-skin table tbody tr:hover td,
  body.fm-legacy-skin .ui-datatable tbody tr:hover td,
  body.fm-legacy-skin .dataTable tbody tr:hover td { background: #f0fbfc !important; }
  body.fm-legacy-skin .ui-paginator,
  body.fm-legacy-skin .p-paginator,
  body.fm-legacy-skin .dataTables_paginate,
  body.fm-legacy-skin .pagination {
    min-height: 38px !important;
    border: 1px solid var(--fm-border) !important;
    background: #fff !important;
    color: #1d3747 !important;
  }
  body.fm-legacy-skin .ui-dialog,
  body.fm-legacy-skin .p-dialog,
  body.fm-legacy-skin .modal-dialog,
  body.fm-legacy-skin [role="dialog"] {
    max-width: calc(100vw - 28px) !important;
    border: 1px solid #d7e0e5 !important;
    border-radius: 12px !important;
    background: #fff !important;
    box-shadow: 0 20px 55px rgba(20,48,59,.24) !important;
    overflow: hidden !important;
  }
  body.fm-legacy-skin .ui-dialog-titlebar,
  body.fm-legacy-skin .p-dialog-header,
  body.fm-legacy-skin .modal-header {
    min-height: 50px !important;
    padding: 11px 16px !important;
    border: 0 !important;
    border-bottom: 1px solid var(--fm-border) !important;
    background: #fff !important;
    color: var(--fm-text) !important;
  }
  body.fm-legacy-skin .ui-dialog-content,
  body.fm-legacy-skin .p-dialog-content,
  body.fm-legacy-skin .modal-body { padding: 15px 17px !important; background: #fff !important; }
  body.fm-legacy-skin .ui-dialog-buttonpane,
  body.fm-legacy-skin .p-dialog-footer,
  body.fm-legacy-skin .modal-footer {
    padding: 11px 17px !important;
    border-top: 1px solid var(--fm-border) !important;
    background: #fff !important;
  }
  body.fm-legacy-skin .ui-datepicker,
  body.fm-legacy-skin .p-datepicker,
  body.fm-legacy-skin .datepicker {
    width: 268px !important;
    padding: 8px !important;
    border: 1px solid var(--fm-border) !important;
    border-radius: 7px !important;
    background: #fff !important;
    box-shadow: 0 16px 38px rgba(20,48,59,.22) !important;
  }
  body.fm-legacy-skin .ui-datepicker td a,
  body.fm-legacy-skin .p-datepicker-day {
    width: 30px !important;
    height: 30px !important;
    border-radius: 50% !important;
    font-size: 11px !important;
  }
  @media (max-width: 760px) {
    body.fm-legacy-skin { overflow-x: auto !important; }
    body.fm-legacy-skin .ui-dialog,
    body.fm-legacy-skin .p-dialog,
    body.fm-legacy-skin .modal-dialog { width: calc(100vw - 20px) !important; }
  }
`

const applyLegacyStyles = () => {
  try {
    const iframe = iframeRef.value
    const document = iframe?.contentDocument || iframe?.contentWindow?.document
    if (!document?.head || !document?.body) return

    document.body.classList.add('fm-legacy-skin')
    document.body.dataset.fmProfile = profileClass.value.replace('iframe-page--', '')

    let style = document.getElementById('fm-injected-styles')
    if (!style) {
      style = document.createElement('style')
      style.id = 'fm-injected-styles'
      document.head.appendChild(style)
    }
    style.textContent = legacyCss
  } catch (error) {
    console.warn('No se pudieron inyectar estilos en el iframe:', error)
  }
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
