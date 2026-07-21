import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useFetch } from '@vueuse/core'


const useEmulacionStore = defineStore('emulacionStore', {
    state: () => ({
        legajoSelected: ref(''),
        activeTab: ref([0]),
        toggleLoader: ref(false), 
        authStore: useAuthStore()
    }),
    actions: {
        $setlegajoSelected(selection) {
            this.legajoSelected = selection;
        },
       
        $resetFilters() {
            this.legajoSelected = '';
        },
        $resetData() {
            this.data = [];
        },
        async $fetchData() {
            this.error_code = '';
            this.error_message = '';
            this.toggleLoader = true;
            let request = {
                'legajo': this.legajoSelected,
            }
            const { isFetching, error, data } = await useFetch(
                '/pc/emulacion/buscar.html?legajo='+this.legajoSelected)
            if (data) {
                let datos = JSON.parse(data.value)
                this.data = datos;
            }
            this.error_message = error;
            this.error_code = error;
            this.toggleLoader = false;
            console.log(this.data);
        },
        async $emulate(){
            this.error_code = "";
            this.error_message = "";
            const { isFetching, error, data } = await useFetch(
                '/pc/emulacion/cambiarUsuario.html?legajo='+this.legajoSelected) 
            if (data) {
                let datos = JSON.parse(data.value)
                this.authStore.setPerfil({
                    autenticado: true,
                    rutas: datos.rutas,
                    nombre: datos.nombre,
                    email: datos.email,
                    legajo: datos.legajo
                })  
            } else {
                this.error_message = error
                this.error_code = error
            }
        },
        $setActiveTab(val) {
            this.activeTab = [val];
        },
      
    },
    getters: {
        
    },
    
})


export default useEmulacionStore;

