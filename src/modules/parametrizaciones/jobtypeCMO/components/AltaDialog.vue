<template>
  <AltaDialogBackend
    :visible="visible"
    class="cmo-alta-dialog"
    @update:visible="emit('update:visible', $event)"
    @saved="emit('saved')"
  />
</template>

<script setup lang="ts">
import AltaDialogBackend from './AltaDialogBackend.vue'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

</script>
