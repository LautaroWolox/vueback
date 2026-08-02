<template>
  <Dialog
    :visible="visible"
    appendTo="body"
    modal
    :closable="false"
    :draggable="true"
    :resizable="false"
    class="jobtype-contrato-delete-confirm-dialog fm-confirm-dialog"
    :style="dialogStyle"
    @update:visible="(val) => emit('update:visible', val)"
  >
    <template #header>
      <div class="jobtype-contrato-delete-confirm__header">
        <div class="jobtype-contrato-delete-confirm__header-main">
          <span class="jobtype-contrato-delete-confirm__icon-circle">
            <i class="pi pi-bell jobtype-contrato-delete-confirm__header-icon" aria-hidden="true" />
          </span>
          <span class="jobtype-contrato-delete-confirm__title">Confirmar Acción</span>
        </div>
        <button
          type="button"
          class="jobtype-contrato-delete-confirm__close"
          title="Cerrar"
          aria-label="Cerrar"
          @click="cancelar"
        >×</button>
      </div>
    </template>

    <div class="jobtype-contrato-delete-confirm__content">
      <span class="jobtype-contrato-delete-confirm__message">
        ¿Confirma que desea desactivar la relación seleccionada?
      </span>
    </div>

    <template #footer>
      <FmDialogActions
        secondary-label="CANCELAR"
        primary-label="ACEPTAR"
        @secondary="cancelar"
        @primary="confirmar"
      />
    </template>
  </Dialog>
</template>

<script setup>
import Dialog from 'primevue/dialog'
import FmDialogActions from '@/components/shared/FmDialogActions.vue'

defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'confirmar'])

const dialogStyle = 'width: min(900px, calc(100vw - 32px)); max-width: 900px;'

const cancelar = () => {
  emit('update:visible', false)
}

const confirmar = () => {
  emit('update:visible', false)
  emit('confirmar')
}
</script>

<style scoped>
.jobtype-contrato-delete-confirm__header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.jobtype-contrato-delete-confirm__header-main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 14px;
}

.jobtype-contrato-delete-confirm__icon-circle {
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e9f8fa;
}

.jobtype-contrato-delete-confirm__header-icon {
  color: #11aabd;
  font-size: 23px;
}

.jobtype-contrato-delete-confirm__title {
  color: #252b33;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}

.jobtype-contrato-delete-confirm__close {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #c7c7c7;
  font-size: 21px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.jobtype-contrato-delete-confirm__close:hover {
  color: #00a9bd;
}

.jobtype-contrato-delete-confirm__content {
  min-height: 72px;
  display: flex;
  align-items: center;
  padding: 18px 4px;
}

.jobtype-contrato-delete-confirm__message {
  color: #4b5563;
  font-size: 15px;
  line-height: 1.35;
}

:global(.p-dialog.jobtype-contrato-delete-confirm-dialog) {
  overflow: hidden;
  border: 1px solid #bdbdbd;
  border-radius: 0;
  box-shadow: 0 4px 14px rgba(0, 0, 0, .28);
}

:global(.jobtype-contrato-delete-confirm-dialog .p-dialog-header) {
  min-height: 68px;
  padding: 12px 18px;
  border-bottom: 1px solid #dedede;
  background: #fff;
}

:global(.jobtype-contrato-delete-confirm-dialog .p-dialog-content) {
  padding: 0 18px;
  background: #fff;
}

:global(.jobtype-contrato-delete-confirm-dialog .p-dialog-footer) {
  min-height: 60px;
  display: flex;
  align-items: center;
  padding: 10px 18px;
  border-top: 1px solid #dedede;
  background: #fff;
}
</style>
