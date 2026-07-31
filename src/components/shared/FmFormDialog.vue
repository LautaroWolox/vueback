<template>
  <!-- Dialog principal -->
  <Dialog
    :visible="visible"
    append-to="body"
    modal
    :closable="false"
    :close-on-escape="false"
    :draggable="draggable"
    :resizable="false"
    class="fm-form-dialog"
    :class="[sizeClass, { 'fm-form-dialog--loading': loading }]"
    :style="dialogStyle"
    @update:visible="onVisibleChange"
  >
    <template #header>
      <div class="fm-form-dialog__header">
        <slot name="header">
          <h2 class="fm-form-dialog__title">{{ title }}</h2>
        </slot>
        <button
          type="button"
          class="fm-form-dialog__close"
          title="Cerrar"
          aria-label="Cerrar"
          @click="solicitarCierre"
        >×</button>
      </div>
    </template>

    <div class="fm-form-dialog__body">
      <slot />
    </div>

    <template #footer>
      <div class="fm-form-dialog__footer">
        <slot name="footer" />
      </div>
    </template>
  </Dialog>

  <!-- Guard: cambios sin guardar -->
  <FmConfirmDialog
    v-if="dirty"
    v-model:visible="showDirtyGuard"
    title="Confirmar acción"
    message="Hay cambios sin guardar. ¿Confirma que desea cancelar?"
    @accept="onDirtyConfirmed"
    @cancel="onDirtyCancelled"
  />
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  visible:   { type: Boolean, default: false },
  title:     { type: String,  default: '' },
  /**
   * 'sm'  → 540px
   * 'md'  → 720px   (default)
   * 'lg'  → 960px
   * 'xl'  → 1200px
   * 'auto' → sin ancho predefinido, usar width prop
   */
  size:      { type: String,  default: 'md', validator: (v) => ['sm', 'md', 'lg', 'xl', 'auto'].includes(v) },
  /** Ancho custom (overrides size) */
  width:     { type: String,  default: '' },
  height:    { type: String,  default: '' },
  draggable: { type: Boolean, default: false },
  /** Si hay cambios sin guardar, activa el guard antes de cerrar */
  dirty:     { type: Boolean, default: false },
  loading:   { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'close'])

const showDirtyGuard = ref(false)

const sizeWidths = { sm: '540px', md: '720px', lg: '960px', xl: '1200px' }

const sizeClass = computed(() => `fm-form-dialog--${props.size}`)

const dialogStyle = computed(() => {
  const result = {}
  const w = props.width || (props.size !== 'auto' ? `min(${sizeWidths[props.size]}, calc(100dvw - 32px))` : undefined)
  if (w) result.width = w
  if (props.height) result.height = props.height
  result.maxWidth = 'calc(100dvw - 32px)'
  result.maxHeight = 'calc(100dvh - 32px)'
  return result
})

const solicitarCierre = () => {
  if (props.dirty) {
    showDirtyGuard.value = true
    return
  }
  cerrar()
}

const onVisibleChange = (val) => {
  if (!val) solicitarCierre()
}

const cerrar = () => {
  emit('update:visible', false)
  emit('close')
}

const onDirtyConfirmed = () => {
  showDirtyGuard.value = false
  cerrar()
}

const onDirtyCancelled = () => {
  showDirtyGuard.value = false
}
</script>

<style>
/* No-scoped: estiliza el Dialog de PrimeVue que se teletransporta a body */
.fm-form-dialog.p-dialog {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--fm-border-strong);
  border-radius: var(--fm-radius-md);
  box-shadow: var(--fm-shadow-dialog);
  background: var(--fm-white);
}

.fm-form-dialog .p-dialog-header {
  flex: 0 0 auto;
  min-height: var(--fm-dialog-header-height);
  padding: 0 16px;
  border-bottom: 1px solid var(--fm-border);
  background: var(--fm-white);
}

.fm-form-dialog .p-dialog-content {
  flex: 1 1 auto;
  min-height: 0;
  padding: 0;
  overflow: auto;
  overscroll-behavior: contain;
  background: var(--fm-white);
}

.fm-form-dialog .p-dialog-footer {
  flex: 0 0 auto;
  min-height: var(--fm-dialog-footer-height);
  padding: 0 16px;
  border-top: 1px solid var(--fm-border);
  background: var(--fm-white);
}
</style>

<style scoped>
.fm-form-dialog__header {
  width: 100%;
  height: 100%;
  min-height: var(--fm-dialog-header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.fm-form-dialog__title {
  margin: 0;
  color: var(--fm-text);
  font-size: var(--fm-font-size-2xl);
  font-weight: 400;
  line-height: 1.2;
}

.fm-form-dialog__close {
  width: 32px;
  min-width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: var(--fm-radius-sm);
  background: transparent;
  color: #9aa4aa;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: border-color var(--fm-transition-fast), color var(--fm-transition-fast);
}

.fm-form-dialog__close:hover {
  border-color: var(--fm-cyan);
  color: var(--fm-cyan);
}

.fm-form-dialog__body {
  padding: 16px;
}

.fm-form-dialog__footer {
  width: 100%;
  height: 100%;
  min-height: var(--fm-dialog-footer-height);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

/* Responsive */
@media (max-width: 600px) {
  .fm-form-dialog__footer {
    flex-direction: column-reverse;
    align-items: stretch;
    min-height: auto;
    padding: 10px 0;
    gap: 8px;
  }
}
</style>
