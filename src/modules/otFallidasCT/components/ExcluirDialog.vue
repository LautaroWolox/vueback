<template>
    <Dialog
        :visible="visible"
        modal
        header="ALERTA"
        :style="{ width: '50rem' }"
        @update:visible="$emit('update:visible', $event)"
        >
        <div class="card flex-col justify-center">
            <div>
                <label for="desc">Motivo</label>       
                <span v-if="status.motivos === 'loading'">
                    Cargando...
                </span>
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
        visible: Boolean,
        selectedRows: {
            type: Array,
            default: () => []
        }
    })

    const confirm = useConfirm();
    const emit = defineEmits(['update:visible'])
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

    function cerrar() {
        motivoSelected.value = ''
        comentario.value = ''
        emit('update:visible', false)
    }

    function confirmar() {
        console.log('motivo:' + motivoSelected.value.nombreCorto)
        console.log('comentario: ' + comentario.value)
        console.log('selección: ' + store.selectedRows)
        if(store.selectedRows.length > 0){
        confirm.require({
            message: '¿Confirma que desea excluir la OT seleccionada?',
            header: 'ACEPTAR',
            rejectProps: {label: 'Cancelar'},
            acceptProps: {label: 'Aceptar'},
            accept: async () => {
               let resp = await store.sendExcluidas(motivoSelected.value.nombreCorto,comentario.value)
               console.log('resp: ' + JSON.stringify(resp))
               cerrar()
            },
            reject: () => { cerrar() }
        });
        } else {
            alert('agregar toast de error')
            cerrar()
        }
    }

    onMounted(() => commonCT.setMotivosExcInc())


/*
//BOTON EXCLUIR OT Y LLAMADA A CONTROLLER
const excluirOtFallida = () => {
		var arrData = [];
		var selectedRow = $(OT_FALLIDAS_GRID).jqGrid("getGridParam", 'selrow');
		var arrDataStr;
		var arrSelectedRows = $(OT_FALLIDAS_GRID).jqGrid("getGridParam", 'selarrrow');
		let nota = $("#notaExclusionFallida").val();
		let motivoExclusion = $("#excluirOtFallidaMotivos").val();
		for (var i = 0; i < arrSelectedRows.length; i++) {
			var curr = $(OT_FALLIDAS_GRID).getRowData(arrSelectedRows[i]);
			if(curr.excluida === "N"){
						arrData.push(curr.id); // arrData.push(curr["nroOrdenTrabajo"]);
				}		
			}
		arrDataStr = JSON.stringify(arrData);
		toggleLoader();                                                                                               
		
		$.post("registroOTFallidasReproceso/excluirOTFallida.html", {arrDataStr: arrDataStr, nota: nota,motivoNombreCorto: motivoExclusion },function(data) {
			var page = $(OT_FALLIDAS_GRID).jqGrid("getGridParam", 'page');
			if(data.status) {
				if (validateFilters("filtrosForm")) {
					var filtrosBusqueda = $("#filtrosForm :input").serialize() + "&sinFiltros="+false;
					initotFallidasGrid("registroOT
                    FallidasReproceso/searchFallidas.html", filtrosBusqueda, page);
				} else {
					var filtrosBusqueda = $("#filtrosForm :input").serialize() + "&sinFiltros="+ true;
					initotFallidasGrid("registroOTFallidasReproceso/searchFallidas.html", filtrosBusqueda, page);
				}
			} else {
				let alertConfirm = $("#alertConfirmar");
				alertConfirm.find('#messageModal').html(data.respuesta);
				alertConfirm.modal("show");
			}
			$('#modalExcluirOtFallida').modal('hide');
		}).fail(function(error) {
		}).always(function() {
			toggleLoader();
		});
}
*/
</script>

