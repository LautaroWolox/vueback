/* ── Estilos globales ── */
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import './assets/css/fm-global.css'
import './modules/parametrizaciones/jobtypeContrato/styles/jobtype-contrato.css'
import './modules/parametrizaciones/jobtypeContrato/styles/jobtypeContratoSingleRow.css'

import Lara from '@primeuix/themes/lara'
import { definePreset } from '@primeuix/themes'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Tooltip from 'primevue/tooltip'

import App from './App.vue'
import router from './router'
import { strings } from './strings.js'
import { useAuthStore } from './store/auth'
import { fmPrimePassThrough } from './components/shared/primePassThrough.js'
import { installResponsiveIframes } from './plugins/responsiveIframes.js'
import { installUserMenuProfile } from './plugins/userMenuProfile.js'
import { installGridPaginatorDefaults } from './plugins/gridPaginatorDefaults.js'
import { installReportSasAutoHeight } from './plugins/reportSasAutoHeight.js'

/* ── Plugin Fm*: registra todos los componentes globales de FieldManager ── */
import { fmComponents } from './plugins/fmComponents.js'

/* ── Componentes PrimeVue ── */
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import AutoComplete from 'primevue/autocomplete'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import ProgressSpinner from 'primevue/progressspinner'
import Select from 'primevue/select'

/* ── Tema ── */
const FieldManagerPreset = definePreset(Lara, {
  semantic: {
    primary: {
      50: '#e0fafa',
      100: '#b3f1f1',
      200: '#80e7e8',
      300: '#4ddddd',
      400: '#26d4d4',
      500: '#00b4b5',
      600: '#00a9bd',
      700: '#008fa1',
      800: '#007678',
      900: '#006364',
      950: '#004445'
    }
  }
})

const pinia = createPinia()
pinia.use(piniaPluginPersistedState)

const app = createApp(App)

app.use(pinia)
useAuthStore().normalizeDisplayName()
app.use(router)
app.use(ToastService)
app.use(ConfirmationService)
app.use(PrimeVue, {
  theme: {
    preset: FieldManagerPreset,
    options: {
      prefix: '',
      cssLayer: {
        name: 'primevue',
        order: 'primevue, fieldmanager'
      },
      darkModeSelector: false
    }
  },
  pt: fmPrimePassThrough,
  ripple: true,
  inputVariant: 'filled',
  locale: strings.locale
})

/* ── Plugin Fm* (componentes globales FieldManager) ── */
app.use(fmComponents)

/* ── Componentes PrimeVue globales ── */
app.component('Accordion', Accordion)
app.component('AccordionPanel', AccordionPanel)
app.component('AccordionHeader', AccordionHeader)
app.component('AccordionContent', AccordionContent)
app.component('AutoComplete', AutoComplete)
app.component('Button', Button)
app.component('CheckBox', Checkbox)
app.component('Column', Column)
app.component('DataTable', DataTable)
app.component('Dialog', Dialog)
app.component('InputText', InputText)
app.component('MultiSelect', MultiSelect)
app.component('ProgressSpinner', ProgressSpinner)
app.component('Select', Select)

app.directive('tooltip', Tooltip)
app.mount('#app')

installResponsiveIframes()
installUserMenuProfile()
installGridPaginatorDefaults()
installReportSasAutoHeight()
