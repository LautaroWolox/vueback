<template>
    <div class="flex flex-column px-2">
        <label for="excl">Excluida</label>
        <Select id="excl" v-model="exc" :options="excluida" optionLabel="valor"class="w-full md:w-56" />
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useFallidasCtStore } from '../../store/CtFallidaStore'

const store = useFallidasCtStore()

const excluida = ref ([
    {'id': '', 'valor': ''},
    {'id': 'S', 'valor': 'SI'},
    {'id': 'N', 'valor': 'NO'},
])

const exc = computed({
  get: () =>
    excluida.value.find(p => p.valor === store.filters.excluida) ?? exc.value[0],

  set: (value) =>
    store.setFilter('excluida', value?.id ?? '')
})

</script>

<style scoped>
</style>
