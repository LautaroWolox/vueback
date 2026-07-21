
<template>

    <div class="card">
        <DataTable scrollable sortMode="multiple" removableSort v-model:filters="filters" :value="data" 
        paginator :rows="20" :rowsPerPageOptions="[10, 20, 30, 50]" 
        tableStyle="min-width: 50rem" selectionMode="single" @row-select= "onRowSelect"
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} to {last} of {totalRecords}" filterDisplay="row"
        id="tabla" stripedRows v-model:selection="operario">    
            <template #empty>
                <p class="py-1 pl-8 text-xl"> No se encontraron resultados. </p>
            </template>

            <Column field="legajo" sortable header="LEGAJO" style="min-width: 20dvh">
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" @input="filterCallback()" type="text"
                        class="p-column-filter" />
                </template>
            </Column>

            <Column field="nombre" sortable header="NOMBRE" style="min-width: 20dvh" class="pr-3">
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" @input="filterCallback()" type="text"
                        class="p-column-filter" />
                </template>
            </Column>
            <Column field="apellido" sortable header="APELLIDO" style="min-width: 10dvh" class="pr-3">
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" @input="filterCallback()" type="text"
                        class="p-column-filter" />
                </template>
            </Column>
            <Column field="perfil" sortable header="PERFIL" style="min-width: 10dvh" class="pr-3">
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" @input="filterCallback()" type="text"
                        class="p-column-filter" />
                </template>
            </Column>
        </DataTable>
    </div>
          
    

    <Dialog v-model:visible="showPopup" modal header="Emulacion" style="width:25rem; z-index: 10;">
        
        <loadingOverlay :loading="store.toggleLoader"/>
    
        <div class="flex gap-2"> 
            Se redirecciona al usuario ingresado
            <div v-if="store.toggleLoader" class="flex align-items-center">
                <!-- <ProgressSpinner :style="{ width: '30px', height: '30px' }" /> -->
            </div>
            <div>
                <Button type="button" label="Aceptar" @click="emular"></Button>
            </div>
        </div>
    </Dialog>
  <Toast position="top-center" />
  
  

</template>

<script setup>
import { ref, watch } from 'vue';
import emulacionStore from '../store/emulacionStore.js';
import { useFetch } from '@vueuse/core'
import router from '@/router';
import { FilterMatchMode } from '@primevue/core/api';
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import loadingOverlay from '../../shared/components/LoadingOverlay.vue';
import { useAuthStore } from '@/store/auth';


const store = emulacionStore();
const data = ref([]);
const showPopup = ref(false);
const legajo =ref('');
const operario = ref(null);
const toast = useToast();
const authStore = useAuthStore();


const showErrorToast = (val) => {
  toast.add({ severity: 'error', summary: '', detail: val })
}

const onRowSelect = (event) => {
    showPopup.value = true;
    legajo.value = event.data.legajo;
}

const emular = async (event) => {
    store.toggleLoader=true;
    showPopup.value = false;
    await store.$emulate();
        if(store.error_message !== ""){
            showErrorToast('No se pudo emular al operario seleccionado')
            console.error("error: " + store.error_message)
        }else {
            console.log(authStore.$state)
            await router.push({ name: 'main' });
            window.location.reload();  
    }
    store.toggleLoader=false;
}

watch(() => store.data, (newVal) => {
    data.value = newVal;

});


const filters = ref({
    legajo: { value: null, matchMode: FilterMatchMode.IN },
    nombre: { value: null, matchMode: FilterMatchMode.IN },
    apellido: { value: null, matchMode: FilterMatchMode.IN },
    perfil: { value: null, matchMode: FilterMatchMode.IN },
   
});


</script>


<style scoped>

.gap-2 {
  gap: 0.5rem; 
}
.align-items-center {
  align-items: left; 
}
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparente */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999; /* Asegúrate de que la capa de carga esté encima del resto del contenido */
}
</style>