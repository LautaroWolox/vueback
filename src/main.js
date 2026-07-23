import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import './assets/css/fm-global.css'
import './assets/css/fm-grid-resize.css'
import './assets/css/fm-responsive.css'
import './assets/css/fm-menu-responsive.css'
import './assets/css/fm-select.css'
import './assets/css/jobtype-contrato.css'

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
import { fmPrimePassThrough } from './components/shared/primePassThrough.js'
import { installResponsiveIframes } from './plugins/responsiveIframes.js'

import FmButton from './components/shared/FmButton.vue'
import FmPanel from './components/shared/FmPanel.vue'
import FmGridShell from './components/shared/FmGridShell.vue'
import FmAlertDialog from './components/shared/FmAlertDialog.vue'
import FmActionButton from './components/shared/FmActionButton.vue'
import FmGridActions from './components/shared/FmGridActions.vue'
import FmGridPaginator from './components/shared/FmGridPaginator.vue'
import FmTypingLoader from './components/shared/FmTypingLoader.vue'
import FmResponsivePage from './components/shared/FmResponsivePage.vue'

import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Select from 'primevue/select'
import ProgressSpinner from 'primevue/progressspinner'
import MultiSelect from 'primevue/multiselect'
import Dialog from 'primevue/dialog'

const pinia = createPinia()
pinia.use(piniaPluginPersistedState)

const FieldManagerPreset = definePreset(Lara, {
  semantic: {
    primary: {
      50: '#e0fafa',
      100: '#b3f1f1',
      200: '#80e7e8',
      300: '#4ddddd',
      400: '#26d4d4',
      500: '#00b4b5',
      600: '#009fa0',
      700: '#008b8c',
      800: '#007678',
      900: '#006364',
      950: '#004445'
    }
  }
})

const app = createApp(App)

app.use(pinia)
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

app.component('Accordion', Accordion)
app.component('AccordionPanel', AccordionPanel)
app.component('AccordionHeader', AccordionHeader)
app.component('AccordionContent', AccordionContent)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Button', Button)
app.component('CheckBox', Checkbox)
app.component('ProgressSpinner', ProgressSpinner)
app.component('MultiSelect', MultiSelect)
app.component('Dialog', Dialog)
app.component('Select', Select)

app.component('FmButton', FmButton)
app.component('FmPanel', FmPanel)
app.component('FmGridShell', FmGridShell)
app.component('FmAlertDialog', FmAlertDialog)
app.component('FmActionButton', FmActionButton)
app.component('FmGridActions', FmGridActions)
app.component('FmGridPaginator', FmGridPaginator)
app.component('FmTypingLoader', FmTypingLoader)
app.component('FmResponsivePage', FmResponsivePage)

app.directive('tooltip', Tooltip)
app.mount('#app')
installResponsiveIframes()
