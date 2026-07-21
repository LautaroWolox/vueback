<template>
    <Dialog
        :visible="visibleExc"
        modal
        header="ALERTA"
        :style="{ width: '50rem' }"
        @update:visible="$emit('update:visible', $event)"
        >
        <div class="card flex-col justify-center">
            <div>
                <label for="desc">Motivo</label>       
                <Select 
                    v-if="status.motivos === 'loading'"
                    v-model="motivoSelected"
                    :disabled="true"
                />
                <Select
                    v-else-if="status.motivos === 'loaded'"
                    v-model="motivoSelected"
                    :options="motivoOptions"
                    optionLabel="nombre"
                    id="nombreCorto"
                />
                <span v-else-if="status.motivos === 'error'">
                    Error al cargar.
                </span>
            </div>
            <div>
                Comentario
                <br/>
                <InputText id="comentario" type="text" v-model="comentario" />
            </div>
        </div>
        <template #footer>
            <Button label="Cancelar" outlined @click="cerrar" />
            <Button label="Aceptar" @click="confirmar" />
        </template>
    </Dialog>
    <ConfirmDialog/>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue';
    import { useFallidasCtStore } from '../store/CtFallidaStore';
    import { useCommonCtStore } from '@/store/commonCt';
    import { storeToRefs } from 'pinia'
    import InputText from 'primevue/inputtext';
    import ConfirmDialog from 'primevue/confirmdialog';
    import { useConfirm } from "primevue/useconfirm";

    const props = defineProps({
        visibleExc: Boolean,
        selectedRows: {
            type: Array,
            default: () => []
        }
    })

    const confirm = useConfirm();
    const emit = defineEmits(['update:visibleExc'])
    const store = useFallidasCtStore()  
    const commonCT = useCommonCtStore()
    const { motivos, status } = storeToRefs(commonCT)
    const motivoSelected = ref('')
    const comentario = ref('')

    const motivoOptions = computed (() => [
        {
            id: 0,
            nombre: '',
            nombreCorto: '',
            activo: '',
        },
        ...(motivos.value ?? []),
    ])

    const confirmar = async() => {
        emit('update:visibleExc', false)
        let resp = await store.sendExcluidas(motivoSelected.value.nombreCorto,comentario.value)
        console.log('resp: ' + JSON.stringify(resp))
        motivoSelected.value = ''
        comentario.value = ''
        await store.setData()
        store.selectedRows = []
    }

    const cerrar = () => {
        emit('update:visibleExc', false)
        motivoSelected.value = ''
        comentario.value = ''
    }

    onMounted(() => commonCT.setMotivosExcInc())

</script>

