<template>
  <Dialog
    :visible="visible"
    appendTo="body"
    modal
    :closable="false"
    :draggable="true"
    :resizable="false"
    class="jobtype-contrato-delete-confirm-dialog"
    :style="dialogStyle"
    @update:visible="(val) => emit('update:visible', val)"
  >
    <template #header>
      <div class="jobtype-contrato-delete-confirm__header">
        <div class="jobtype-contrato-delete-confirm__header-main">
          <span class="jobtype-contrato-delete-confirm__icon-circle">
            <i class="pi pi-bell jobtype-contrato-delete-confirm__header-icon" aria-hidden="true" />
          </span>
          <span class="jobtype-contrato-delete-confirm__title">Confirmar Accion</span>
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
      <div class="jobtype-contrato-delete-confirm__actions">
        <button
          type="button"
          class="jobtype-contrato-delete-confirm__button jobtype-contrato-delete-confirm__button--cancel"
          @click="cancelar"
        >CANCELAR</button>
        <button
          type="button"
          class="jobtype-contrato-delete-confirm__button jobtype-contrato-delete-confirm__button--accept"
          @click="confirmar"
        >ACEPTAR</button>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import Dialog from 'primevue/dialog'

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
