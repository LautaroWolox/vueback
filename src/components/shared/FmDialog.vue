<template>
  <Dialog
    v-bind="$attrs"
    :visible="visible"
    :modal="modal"
    :closable="closable"
    :draggable="draggable"
    :resizable="resizable"
    :append-to="appendTo"
    :class="['fm-dialog', dialogClass]"
    :style="dialogStyle"
    @update:visible="$emit('update:visible', $event)"
    @show="$emit('show')"
    @hide="$emit('hide')"
  >
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>

    <slot />

    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </Dialog>
</template>

<script setup>
import Dialog from 'primevue/dialog'

defineOptions({ inheritAttrs: false })

defineProps({
  visible: { type: Boolean, default: false },
  modal: { type: Boolean, default: true },
  closable: { type: Boolean, default: true },
  draggable: { type: Boolean, default: true },
  resizable: { type: Boolean, default: true },
  appendTo: { type: [String, Object], default: 'body' },
  dialogClass: { type: [String, Array, Object], default: '' },
  dialogStyle: { type: [String, Array, Object], default: undefined }
})

defineEmits(['update:visible', 'show', 'hide'])
</script>
