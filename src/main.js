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

const debugMessageListener = (event) => {
  console.log('MAIN CAPTURE RECEIVED MESSAGE', event.origin, event.data)
}

window.addEventListener('message', handleLoginMessage, true)


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
app.directive('tooltip', Tooltip);
app.mount('#app');




