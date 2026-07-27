<template>
  <FmDialog
    :visible="visible"
    :closable="closable"
    :draggable="draggable"
    :resizable="resizable"
    :dialog-class="['fm-grid-dialog', dialogClass]"
    :dialog-style="resolvedStyle"
    @update:visible="$emit('update:visible', $event)"
    @hide="$emit('hide')"
  >
    <template v-if="title || $slots.header" #header>
      <slot name="header">
        <span class="fm-grid-dialog__title">{{ title }}</span>
      </slot>
    </template>

    <div class="fm-grid-dialog__body">
      <slot />
    </div>

    <template v-if="$slots.footer || showCloseButton" #footer>
      <slot name="footer">
        <FmButton
          :label="closeLabel"
          variant="outline"
          @click="$emit('update:visible', false)"
        />
      </slot>
    </template>
  </FmDialog>
</template>

<script setup>
import { computed } from 'vue'
import FmButton from './FmButton.vue'
import FmDialog from './FmDialog.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: String, default: 'min(960px, calc(100vw - 24px))' },
  height: { type: String, default: 'min(720px, calc(100dvh - 24px))' },
  dialogClass: { type: [String, Array, Object], default: '' },
  closable: { type: Boolean, default: true },
  draggable: { type: Boolean, default: false },
  resizable: { type: Boolean, default: false },
  showCloseButton: { type: Boolean, default: true },
  closeLabel: { type: String, default: 'CERRAR' }
})

defineEmits(['update:visible', 'hide'])

const resolvedStyle = computed(() => ({
  width: props.width,
  height: props.height,
  maxWidth: 'calc(100vw - 24px)',
  maxHeight: 'calc(100dvh - 24px)'
}))
</script>

<style scoped>
.fm-grid-dialog__title {
  color: #263746;
  font-size: 18px;
  font-weight: 500;
}

.fm-grid-dialog__body {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
