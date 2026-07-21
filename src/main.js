import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './assets/css/nuestros.css';
import Lara from '@primeuix/themes/lara';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedState from "pinia-plugin-persistedstate";
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import Tooltip from 'primevue/tooltip';
import App from './App.vue';
import router from './router';
import { strings } from './strings.js'

import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Select from 'primevue/select';
import ProgressSpinner from 'primevue/progressspinner';
import MultiSelect from 'primevue/multiselect'
import Dialog from 'primevue/dialog';

const pinia = createPinia();
pinia.use(piniaPluginPersistedState);
const app = createApp(App)
app.use(pinia);
app.use(router);
app.use(ToastService);
app.use(ConfirmationService);
app.use(PrimeVue, {
    theme: {
        preset: Lara,
        options: {
            prefix: '',
            cssLayer: {
                name: 'primevue',
                order: 'primevue, nuestros'
            },
            darkModeSelector: false
        }
    },
    ripple: true,
    inputVariant: "filled",
    strings
});

app.component('Accordion', Accordion);
app.component('AccordionPanel', AccordionPanel);
app.component('AccordionHeader', AccordionHeader);
app.component('AccordionContent', AccordionContent);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Button', Button);
app.component('CheckBox', Checkbox);
app.component('ProgressSpinner', ProgressSpinner);
app.component('MultiSelect', MultiSelect);
app.component('Dialog', Dialog);
app.component('Select',Select);

app.directive('tooltip', Tooltip);
app.mount('#app');




